"""โหลดโมเดลและให้บริการ inference สำหรับ FakeGuard-TH API

- โหลด metrics.json เพื่อรู้ว่าโมเดลไหนดีที่สุด
- baseline (.joblib) ใช้ scikit-learn pipeline (มี TF-IDF + tokenizer ในตัว)
- wangchanberta โหลดผ่าน transformers → predict ด้วย softmax probability
- ใช้ clean_text ตัวเดียวกับตอนเทรน (import จาก ml/src/preprocess.py)
"""

import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "ml" / "src"))  # ให้ import preprocess ได้ และให้
# joblib unpickle หา thai_tokens เจอ (ถูก pickle ไว้ในไฟล์โมเดล baseline)

from preprocess import clean_text  # noqa: E402

MODELS_DIR = ROOT / "models"


class ModelRegistry:
    def __init__(self) -> None:
        self.metrics = json.loads((MODELS_DIR / "metrics.json").read_text())
        self.best = self.metrics["best_model"]
        self._baselines: dict = {}
        self._berta = None  # (tokenizer, model, device)

    # ---------- lazy loading ----------
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
            device = torch.device(
                "mps" if torch.backends.mps.is_available() else "cpu"
            )
            tokenizer = AutoTokenizer.from_pretrained(path)
            model = AutoModelForSequenceClassification.from_pretrained(path)
            model.to(device).eval()
            self._berta = (tokenizer, model, device)
        return self._berta

    def warmup(self) -> None:
        """โหลดทุกโมเดลล่วงหน้าตอน server start จะได้ตอบเร็วตั้งแต่ request แรก"""
        for name in self.metrics["models"]:
            if name == "wangchanberta":
                self._load_berta()
            else:
                self._load_baseline(name)

    # ---------- predict ----------
    def predict(self, text: str, model_name: str | None = None) -> dict:
        name = model_name or self.best
        if name not in self.metrics["models"]:
            raise KeyError(f"ไม่รู้จักโมเดล: {name}")
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
