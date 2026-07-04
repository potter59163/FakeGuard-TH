"""Fine-tune WangchanBERTa สำหรับตรวจจับข่าวปลอมภาษาไทย

- โมเดล: airesearch/wangchanberta-base-att-spm-uncased (HuggingFace)
- Hyperparameters ตามข้อเสนอโครงงาน: lr 2e-5, batch size 16, epochs 5
- ใช้ train/test split เดียวกับ baseline (ตัวแปรควบคุม)
- ใช้ training loop ตรงๆ ด้วย PyTorch (โปร่งใส อธิบายกรรมการได้ทุกบรรทัด)
- อุปกรณ์: Apple Silicon (mps) → ถ้าไม่มีใช้ CPU (หรือย้ายไป Colab ด้วยโค้ดเดิม)

รัน:  .venv/bin/python ml/src/train_wangchanberta.py
"""

import json
import random
import time
from pathlib import Path

import numpy as np
import torch
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from torch.utils.data import DataLoader, TensorDataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    get_linear_schedule_with_warmup,
)

from preprocess import clean_text, load_split

ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT / "models"
REPORTS_DIR = ROOT / "ml" / "reports"

MODEL_NAME = "airesearch/wangchanberta-base-att-spm-uncased"
LR = 2e-5
BATCH_SIZE = 16
EPOCHS = 5
MAX_LENGTH = 256
SEED = 42


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def get_device() -> torch.device:
    if torch.backends.mps.is_available():
        return torch.device("mps")
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")


def encode(tokenizer, texts: list[str]) -> dict:
    return tokenizer(
        [clean_text(t) for t in texts],
        truncation=True,
        padding="max_length",
        max_length=MAX_LENGTH,
        return_tensors="pt",
    )


def main() -> None:
    set_seed(SEED)
    device = get_device()
    print(f"device: {device}")

    df, train_idx, test_idx = load_split()
    X_train = df.loc[train_idx, "text"].tolist()
    y_train = df.loc[train_idx, "label"].tolist()
    X_test = df.loc[test_idx, "text"].tolist()
    y_test = df.loc[test_idx, "label"].tolist()

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, num_labels=2
    ).to(device)

    enc_train = encode(tokenizer, X_train)
    enc_test = encode(tokenizer, X_test)
    train_ds = TensorDataset(
        enc_train["input_ids"], enc_train["attention_mask"],
        torch.tensor(y_train),
    )
    test_ds = TensorDataset(
        enc_test["input_ids"], enc_test["attention_mask"],
        torch.tensor(y_test),
    )
    train_dl = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,
                          generator=torch.Generator().manual_seed(SEED))
    test_dl = DataLoader(test_ds, batch_size=BATCH_SIZE)

    optimizer = torch.optim.AdamW(model.parameters(), lr=LR)
    total_steps = len(train_dl) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=int(0.1 * total_steps),
        num_training_steps=total_steps,
    )

    t0 = time.time()
    for epoch in range(1, EPOCHS + 1):
        model.train()
        losses = []
        for input_ids, attn, labels in train_dl:
            input_ids, attn, labels = (
                input_ids.to(device), attn.to(device), labels.to(device)
            )
            optimizer.zero_grad()
            out = model(input_ids, attention_mask=attn, labels=labels)
            out.loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            losses.append(out.loss.item())
        print(f"epoch {epoch}/{EPOCHS}  train loss: {np.mean(losses):.4f}  "
              f"({time.time() - t0:.0f}s)")

    # ---------- ประเมินบน test set ----------
    model.eval()
    preds = []
    with torch.no_grad():
        for input_ids, attn, _ in test_dl:
            out = model(input_ids.to(device), attention_mask=attn.to(device))
            preds.extend(out.logits.argmax(dim=-1).cpu().tolist())

    metrics = {
        "f1": round(f1_score(y_test, preds), 4),
        "precision": round(precision_score(y_test, preds), 4),
        "recall": round(recall_score(y_test, preds), 4),
        "accuracy": round(accuracy_score(y_test, preds), 4),
        "confusion_matrix": confusion_matrix(y_test, preds).tolist(),
        "train_seconds": round(time.time() - t0, 1),
        "hyperparameters": {
            "model": MODEL_NAME, "lr": LR, "batch_size": BATCH_SIZE,
            "epochs": EPOCHS, "max_length": MAX_LENGTH, "seed": SEED,
        },
    }
    print({k: v for k, v in metrics.items()
           if k not in ("confusion_matrix", "hyperparameters")})

    out_dir = MODELS_DIR / "wangchanberta"
    model.save_pretrained(out_dir)
    tokenizer.save_pretrained(out_dir)
    np.save(MODELS_DIR / "wangchanberta_test_pred.npy", np.array(preds))
    (REPORTS_DIR / "wangchanberta_metrics.json").write_text(
        json.dumps(metrics, indent=2)
    )
    print(f"บันทึกโมเดล → {out_dir}")


if __name__ == "__main__":
    main()
