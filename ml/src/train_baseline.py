"""เทรน baseline: TF-IDF + SVM และ TF-IDF + Random Forest

- ใช้ split เดียวกับทุกโมเดล (จาก preprocess.load_split)
- 5-fold CV บน training set (เช็คเสถียรภาพ) → ประเมินจริงบน test set
- บันทึกโมเดล .joblib + metrics ลง models/ และ ml/reports/

รัน:  .venv/bin/python ml/src/train_baseline.py
"""

import json
import time
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC

from preprocess import load_split, thai_tokens

ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT / "models"
REPORTS_DIR = ROOT / "ml" / "reports"
SEED = 42


def build_pipelines() -> dict[str, Pipeline]:
    tfidf = lambda: TfidfVectorizer(  # noqa: E731
        tokenizer=thai_tokens,
        token_pattern=None,
        ngram_range=(1, 2),
        max_features=20_000,
        min_df=2,
    )
    return {
        "svm": Pipeline(
            [("tfidf", tfidf()),
             ("clf", SVC(kernel="linear", probability=True, random_state=SEED))]
        ),
        "random_forest": Pipeline(
            [("tfidf", tfidf()),
             ("clf", RandomForestClassifier(n_estimators=300, random_state=SEED,
                                            n_jobs=-1))]
        ),
    }


def evaluate(y_true, y_pred) -> dict:
    return {
        "f1": round(f1_score(y_true, y_pred), 4),
        "precision": round(precision_score(y_true, y_pred), 4),
        "recall": round(recall_score(y_true, y_pred), 4),
        "accuracy": round(accuracy_score(y_true, y_pred), 4),
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
    }


def main() -> None:
    MODELS_DIR.mkdir(exist_ok=True)
    df, train_idx, test_idx = load_split()
    X_train = df.loc[train_idx, "text"].tolist()
    y_train = df.loc[train_idx, "label"].to_numpy()
    X_test = df.loc[test_idx, "text"].tolist()
    y_test = df.loc[test_idx, "label"].to_numpy()

    results = {}
    for name, pipe in build_pipelines().items():
        print(f"\n=== {name} ===")
        t0 = time.time()
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=SEED)
        cv_f1 = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="f1")
        print(f"5-fold CV F1: {cv_f1.mean():.4f} ± {cv_f1.std():.4f}")

        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)
        metrics = evaluate(y_test, y_pred)
        metrics["cv_f1_mean"] = round(float(cv_f1.mean()), 4)
        metrics["cv_f1_std"] = round(float(cv_f1.std()), 4)
        metrics["train_seconds"] = round(time.time() - t0, 1)
        results[name] = metrics
        print({k: v for k, v in metrics.items() if k != "confusion_matrix"})

        joblib.dump(pipe, MODELS_DIR / f"{name}.joblib")
        # เก็บคำทำนายบน test set ไว้ทำ error analysis
        np.save(MODELS_DIR / f"{name}_test_pred.npy", y_pred)

    (REPORTS_DIR / "baseline_metrics.json").write_text(
        json.dumps(results, indent=2)
    )
    print(f"\nบันทึกผล → {REPORTS_DIR / 'baseline_metrics.json'}")


if __name__ == "__main__":
    main()
