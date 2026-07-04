"""Error Analysis: ข้อความใน test set ที่โมเดลทายผิด

- แบ่งเป็น: ผิดทั้ง 3 โมเดล (ยากที่สุด) / ผิดเฉพาะ baseline แต่ WangchanBERTa ถูก
  (แสดงคุณค่าของการเข้าใจบริบท) / WangchanBERTa ผิดแต่ baseline ถูก
- ผลลัพธ์เป็นตาราง markdown ให้อ่านและจัดกลุ่มรูปแบบด้วยตา (ขั้นตอนเชิงคุณภาพ)

รัน:  .venv/bin/python ml/src/error_analysis.py   (หลังเทรนครบ 3 โมเดล)
"""

from pathlib import Path

import numpy as np

from preprocess import load_split

ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT / "models"
REPORTS_DIR = ROOT / "ml" / "reports"

LABEL_TH = {0: "จริง", 1: "ปลอม"}


def main() -> None:
    df, _, test_idx = load_split()
    test_df = df.loc[test_idx].reset_index(drop=True)
    y_true = test_df["label"].to_numpy()

    preds = {
        "SVM": np.load(MODELS_DIR / "svm_test_pred.npy"),
        "RF": np.load(MODELS_DIR / "random_forest_test_pred.npy"),
        "WangchanBERTa": np.load(MODELS_DIR / "wangchanberta_test_pred.npy"),
    }
    wrong = {name: p != y_true for name, p in preds.items()}

    all_wrong = wrong["SVM"] & wrong["RF"] & wrong["WangchanBERTa"]
    berta_saves = wrong["SVM"] & wrong["RF"] & ~wrong["WangchanBERTa"]
    berta_only = ~wrong["SVM"] & ~wrong["RF"] & wrong["WangchanBERTa"]

    def section(title: str, mask: np.ndarray) -> list[str]:
        lines = [f"\n## {title} ({mask.sum()} ข้อความ)\n"]
        if mask.sum() == 0:
            lines.append("*(ไม่มี)*")
            return lines
        lines.append("| เฉลย | ข้อความ | หมวด |")
        lines.append("|---|---|---|")
        for _, r in test_df[mask].iterrows():
            lines.append(f"| {LABEL_TH[r.label]} | {r.text[:120]} | {r.topic} |")
        return lines

    lines = [
        "# Error Analysis — FakeGuard-TH (test set n=200)\n",
        f"- SVM ผิด: {wrong['SVM'].sum()}",
        f"- Random Forest ผิด: {wrong['RF'].sum()}",
        f"- WangchanBERTa ผิด: {wrong['WangchanBERTa'].sum()}",
    ]
    lines += section("ทายผิดทั้ง 3 โมเดล (โจทย์ที่ยากที่สุดสำหรับ AI)", all_wrong)
    lines += section("Baseline ผิดทั้งคู่ แต่ WangchanBERTa ถูก (คุณค่าของบริบท)",
                     berta_saves)
    lines += section("WangchanBERTa ผิดคนเดียว (baseline ถูกทั้งคู่)", berta_only)
    lines.append(
        "\n## แนวทางจัดกลุ่ม (เติมด้วยมือหลังอ่านตาราง)\n\n"
        "- [ ] ข่าวบิดเบือนบางส่วน / จริงผสมเท็จ\n"
        "- [ ] ภาษาพูด / ภาษาวัยรุ่น / ตัวสะกดแปลก\n"
        "- [ ] ต้องใช้ความรู้ภายนอก (ชื่อหน่วยงาน วันที่ นโยบายล่าสุด)\n"
        "- [ ] ข้อความสั้นเกินไป ไม่มีสัญญาณพอ\n"
    )

    out = REPORTS_DIR / "error_analysis.md"
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"→ {out}")
    print(f"ผิดทั้ง 3 โมเดล: {all_wrong.sum()} | baseline ผิดแต่ BERTa ถูก: "
          f"{berta_saves.sum()} | BERTa ผิดคนเดียว: {berta_only.sum()}")


if __name__ == "__main__":
    main()
