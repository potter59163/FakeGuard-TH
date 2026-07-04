"""รวมผลทั้ง 3 โมเดล → ตารางเทียบ + กราฟ + models/metrics.json (backend ใช้ต่อ)

รัน:  .venv/bin/python ml/src/evaluate.py   (หลังเทรนครบ 3 โมเดล)
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT / "models"
REPORTS_DIR = ROOT / "ml" / "reports"

DISPLAY_NAMES = {
    "svm": "SVM + TF-IDF",
    "random_forest": "Random Forest + TF-IDF",
    "wangchanberta": "WangchanBERTa (fine-tuned)",
}


def main() -> None:
    baseline = json.loads((REPORTS_DIR / "baseline_metrics.json").read_text())
    wangchan = json.loads((REPORTS_DIR / "wangchanberta_metrics.json").read_text())
    all_metrics = {**baseline, "wangchanberta": wangchan}

    # ---------- metrics.json สำหรับ backend/dashboard ----------
    best = max(all_metrics, key=lambda k: all_metrics[k]["f1"])
    export = {
        "best_model": best,
        "models": {
            name: {
                "display_name": DISPLAY_NAMES[name],
                "f1": m["f1"],
                "precision": m["precision"],
                "recall": m["recall"],
                "accuracy": m["accuracy"],
                "confusion_matrix": m["confusion_matrix"],
            }
            for name, m in all_metrics.items()
        },
    }
    (MODELS_DIR / "metrics.json").write_text(
        json.dumps(export, ensure_ascii=False, indent=2)
    )

    # ---------- ตาราง markdown ----------
    lines = [
        "# ผลการเปรียบเทียบโมเดล — FakeGuard-TH\n",
        "ประเมินบน test set เดียวกัน 200 ข้อความ (จริง 100 : ปลอม 100), seed 42\n",
        "| โมเดล | F1 | Precision | Recall | Accuracy |",
        "|---|---|---|---|---|",
    ]
    for name, m in sorted(all_metrics.items(), key=lambda kv: -kv[1]["f1"]):
        flag = " **← ดีที่สุด**" if name == best else ""
        lines.append(
            f"| {DISPLAY_NAMES[name]}{flag} | {m['f1']:.4f} | {m['precision']:.4f} "
            f"| {m['recall']:.4f} | {m['accuracy']:.4f} |"
        )
    lines.append("\n## Confusion Matrix (แถว=จริง, คอลัมน์=ทำนาย; ลำดับ [จริง, ปลอม])\n")
    for name, m in all_metrics.items():
        cm = m["confusion_matrix"]
        lines.append(f"- **{DISPLAY_NAMES[name]}**: TN={cm[0][0]} FP={cm[0][1]} "
                     f"FN={cm[1][0]} TP={cm[1][1]}")

    hypo = ("✅ เป็นไปตามสมมติฐาน" if wangchan["f1"] >= 0.85
            and best == "wangchanberta" else "⚠️ ไม่เป็นไปตามสมมติฐานทั้งหมด — อภิปรายในรายงาน")
    lines.append(f"\n## สมมติฐาน (WangchanBERTa F1 ≥ 0.85 และสูงกว่า baseline): {hypo}")

    (REPORTS_DIR / "results.md").write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines))

    # ---------- กราฟแท่ง ----------
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    names = list(all_metrics)
    metrics_keys = ["f1", "precision", "recall", "accuracy"]
    x = range(len(names))
    width = 0.2
    fig, ax = plt.subplots(figsize=(9, 5))
    for i, key in enumerate(metrics_keys):
        vals = [all_metrics[n][key] for n in names]
        ax.bar([xi + i * width for xi in x], vals, width, label=key.upper())
    ax.set_xticks([xi + 1.5 * width for xi in x])
    ax.set_xticklabels([DISPLAY_NAMES[n] for n in names], fontsize=9)
    ax.set_ylim(0, 1)
    ax.set_title("FakeGuard-TH: Model Comparison (Test Set n=200)")
    ax.legend()
    ax.grid(axis="y", alpha=0.3)
    fig.tight_layout()
    fig.savefig(REPORTS_DIR / "model_comparison.png", dpi=150)
    print(f"\nกราฟ → {REPORTS_DIR / 'model_comparison.png'}")


if __name__ == "__main__":
    main()
