"""Preprocessing กลางของ FakeGuard-TH — ทุกโมเดลใช้ชุดเดียวกัน (ตัวแปรควบคุม)

- clean_text():   ทำความสะอาดข้อความ (ใช้ร่วมทุกโมเดล รวมถึงตอน inference ใน backend)
- thai_tokens():  ตัดคำ PyThaiNLP + ตัด stopwords (ใช้เฉพาะสาย TF-IDF)
                  หมายเหตุ: WangchanBERTa ใช้ข้อความ clean เต็มประโยค ไม่ผ่านฟังก์ชันนี้
                  เพราะ BERT มี tokenizer ของตัวเองและต้องการบริบทเต็ม
- รันเป็นสคริปต์:  แบ่ง train/test 80:20 (stratified, seed=42) บันทึก index ลงไฟล์
                  ให้ทุกโมเดลใช้ split เดียวกันเป๊ะ + สรุป EDA สั้นๆ

รัน:  .venv/bin/python ml/src/preprocess.py
"""

import re
from pathlib import Path

ML_DIR = Path(__file__).resolve().parents[1]
PROCESSED = ML_DIR / "data" / "processed"
DATASET_CSV = PROCESSED / "thai_fakenews_1000.csv"
SPLIT_FILE = PROCESSED / "train_test_split.json"

SEED = 42
TEST_SIZE = 0.2

URL_RE = re.compile(r"https?://\S+|www\.\S+")
EMOJI_RE = re.compile(
    "[\U0001f300-\U0001faff\U00002700-\U000027bf\U0001f000-\U0001f0ff"
    "\U00002600-\U000026ff️]+"
)
# เก็บอักษรไทย ละติน ตัวเลข และเว้นวรรค — ตัดอักขระพิเศษอื่น
KEEP_RE = re.compile(r"[^฀-๿a-zA-Z0-9\s.,%\-]")


def clean_text(text: str) -> str:
    """ทำความสะอาดข้อความ — ใช้ทั้งตอนเทรน (ทุกโมเดล) และตอน inference"""
    text = str(text)
    text = URL_RE.sub(" ", text)
    text = EMOJI_RE.sub(" ", text)
    text = KEEP_RE.sub(" ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def thai_tokens(text: str) -> list[str]:
    """ตัดคำ + ตัด stopwords สำหรับสาย TF-IDF (import ช้า จึง lazy-load)"""
    from pythainlp.corpus import thai_stopwords
    from pythainlp.tokenize import word_tokenize

    tokens = word_tokenize(clean_text(text), engine="newmm", keep_whitespace=False)
    stops = thai_stopwords()
    return [t for t in tokens if t not in stops and t.strip()]


def load_split():
    """โหลด dataset + split ที่บันทึกไว้ → (df, train_idx, test_idx)"""
    import json

    import pandas as pd

    df = pd.read_csv(DATASET_CSV)
    split = json.loads(SPLIT_FILE.read_text())
    return df, split["train_idx"], split["test_idx"]


def main() -> None:
    import json
    from collections import Counter

    import pandas as pd
    from sklearn.model_selection import train_test_split

    df = pd.read_csv(DATASET_CSV)
    df["text_clean"] = df["text"].map(clean_text)

    train_idx, test_idx = train_test_split(
        df.index.tolist(),
        test_size=TEST_SIZE,
        stratify=df["label"],
        random_state=SEED,
    )
    SPLIT_FILE.write_text(
        json.dumps({"train_idx": sorted(train_idx), "test_idx": sorted(test_idx),
                    "seed": SEED, "test_size": TEST_SIZE})
    )
    print(f"split: train={len(train_idx)} test={len(test_idx)} → {SPLIT_FILE.name}")
    print("สัดส่วน label ใน test:",
          df.loc[test_idx, "label"].value_counts().to_dict())

    # ---------- EDA สั้นๆ ----------
    lines = ["# EDA — Thai Fake News Dataset\n"]
    lens = df.groupby("label")["text_clean"].apply(lambda s: s.str.len())
    lines.append("## ความยาวข้อความ (ตัวอักษร หลัง clean)\n")
    for lb, name in [(0, "จริง"), (1, "ปลอม")]:
        s = df[df.label == lb]["text_clean"].str.len()
        lines.append(
            f"- {name}: mean {s.mean():.1f}, median {s.median():.0f}, "
            f"min {s.min()}, max {s.max()}"
        )

    lines.append("\n## คำที่พบบ่อย 15 อันดับต่อ class (หลังตัด stopwords)\n")
    for lb, name in [(0, "จริง"), (1, "ปลอม")]:
        cnt = Counter()
        for t in df[df.label == lb]["text"]:
            cnt.update(thai_tokens(t))
        top = ", ".join(f"{w}({c})" for w, c in cnt.most_common(15))
        lines.append(f"- **{name}**: {top}")

    lines.append("\n## หมวดหมู่\n")
    for k, v in df["topic"].value_counts().items():
        lines.append(f"- {k}: {v}")

    eda_file = ML_DIR / "reports" / "eda.md"
    eda_file.write_text("\n".join(lines), encoding="utf-8")
    print(f"EDA → {eda_file}")


if __name__ == "__main__":
    main()
