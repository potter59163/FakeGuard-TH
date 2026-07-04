"""โหลดโมเดลและให้บริการ inference — เวอร์ชัน Hugging Face Space

ต่างจาก backend/inference.py (ตัวสำหรับรันบนเครื่อง/Render) ตรงที่:
- ไม่มีไฟล์โมเดลติดมากับ image (Space repo เบา ไม่เก็บไฟล์ 400MB+)
- ดาวน์โหลดโมเดลทั้ง 3 ตัวจาก Hugging Face Model Hub ตอน container start
  (repo กำหนดผ่าน env HF_MODEL_REPO) แล้วเก็บไว้ที่ /app/models
"""

import json
import os
import time
from pathlib import Path

from preprocess import clean_text

MODELS_DIR = Path(__file__).resolve().parent / "models"
HF_MODEL_REPO = os.environ.get("HF_MODEL_REPO", "")


def ensure_models_downloaded() -> None:
    """ดาวน์โหลดโมเดลจาก HF Hub ถ้ายังไม่มีในเครื่อง (รันครั้งเดียวตอน start)"""
    if (MODELS_DIR / "metrics.json").exists():
        return
    if not HF_MODEL_REPO:
        raise RuntimeError(
            "ไม่พบโมเดลในเครื่องและไม่ได้ตั้ง env HF_MODEL_REPO ให้ดาวน์โหลด"
        )
    from huggingface_hub import snapshot_download

    print(f"กำลังดาวน์โหลดโมเดลจาก {HF_MODEL_REPO} ...")
    t0 = time.time()
    snapshot_download(
        repo_id=HF_MODEL_REPO, repo_type="model", local_dir=MODELS_DIR
    )
    print(f"ดาวน์โหลดเสร็จใน {time.time() - t0:.0f} วินาที")


class ModelRegistry:
    def __init__(self) -> None:
        ensure_models_downloaded()
        self.metrics = json.loads((MODELS_DIR / "metrics.json").read_text())
        self.available = {
            n for n in self.metrics["models"] if self._artifact_exists(n)
        }
        for name, m in self.metrics["models"].items():
            m["available"] = name in self.available
        best = self.metrics["best_model"]
        self.best = (
            best
            if best in self.available
            else max(self.available, key=lambda n: self.metrics["models"][n]["f1"])
        )
        self._baselines: dict = {}
        self._berta = None  # (tokenizer, model, device)

    @staticmethod
    def _artifact_exists(name: str) -> bool:
        if name == "wangchanberta":
            return (MODELS_DIR / "wangchanberta").is_dir()
        return (MODELS_DIR / f"{name}.joblib").exists()

    def _load_baseline(self, name: str):
        if name not in self._baselines:
            import joblib

            self._baselines[name] = joblib.load(MODELS_DIR / f"{name}.joblib")
        return self._baselines[name]

    def _load_berta(self):
        if self._berta is None:
            import torch
            from transformers import (
                AutoModelForSequenceClassification,
                AutoTokenizer,
            )

            path = MODELS_DIR / "wangchanberta"
            device = torch.device("cpu")  # HF Space free tier = CPU basic
            tokenizer = AutoTokenizer.from_pretrained(path)
            model = AutoModelForSequenceClassification.from_pretrained(path)
            model.to(device).eval()
            self._berta = (tokenizer, model, device)
        return self._berta

    def warmup(self) -> None:
        for name in self.available:
            if name == "wangchanberta":
                self._load_berta()
            else:
                self._load_baseline(name)

    def predict(self, text: str, model_name: str | None = None) -> dict:
        name = model_name or self.best
        if name not in self.metrics["models"]:
            raise KeyError(f"ไม่รู้จักโมเดล: {name}")
        if name not in self.available:
            raise KeyError(f"โมเดล {name} ไม่พร้อมใช้งานบนเซิร์ฟเวอร์นี้")
        t0 = time.time()

        if name == "wangchanberta":
            import torch

            tokenizer, model, device = self._load_berta()
            enc = tokenizer(
                clean_text(text), truncation=True, max_length=256,
                return_tensors="pt",
            ).to(device)
            with torch.no_grad():
                probs = model(**enc).logits.softmax(dim=-1)[0].cpu().tolist()
        else:
            pipe = self._load_baseline(name)
            probs = pipe.predict_proba([text])[0].tolist()

        label_idx = int(probs[1] >= 0.5)
        return {
            "label": "fake" if label_idx == 1 else "real",
            "label_th": "ข่าวปลอม" if label_idx == 1 else "ข่าวจริง",
            "probability": round(probs[label_idx], 4),
            "prob_fake": round(probs[1], 4),
            "model_used": name,
            "display_name": self.metrics["models"][name]["display_name"],
            "latency_ms": round((time.time() - t0) * 1000, 1),
        }
