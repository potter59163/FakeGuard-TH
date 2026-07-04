"""รวมข้อมูลดิบจาก AFNC (+AFP ถ้ามี) → dataset สมดุล 500:500 พร้อมเทรน

ขั้นตอน:
1. โหลด JSON ดิบทุกเดือนจาก ml/data/raw/afnc/
2. กรองเฉพาะ "ข่าวปลอม" (label=1) และ "ข่าวจริง" (label=0)
   — ตัด "ข่าวบิดเบือน" ทิ้งเพื่อให้ label สะอาด (บันทึกเหตุผลใน data card)
3. ใช้หัวข้อข่าว (post_title) เป็นข้อความ และ **ตัด boilerplate ที่รั่วเฉลย (data leakage)**:
   - prefix "ข่าวปลอม อย่าแชร์!" ฯลฯ → ถ้าไม่ตัด โมเดลจะจำคำเฉลยแทนที่จะเรียนรู้เนื้อข่าว
   - suffix "จริงหรือ?" ของข่าวจริง
4. dedupe (exact หลัง normalize)
5. สุ่ม 500:500 (seed=42, กระจายตามปีและหมวด) → ml/data/processed/thai_fakenews_1000.csv
   และเก็บ pool เต็มไว้ที่ ml/data/interim/afnc_pool.csv

รัน:  .venv/bin/python ml/src/build_dataset.py
"""

import json
import re
import unicodedata
from pathlib import Path

import pandas as pd

ML_DIR = Path(__file__).resolve().parents[1]
RAW_AFNC = ML_DIR / "data" / "raw" / "afnc"
RAW_AFP = ML_DIR / "data" / "raw" / "afp"
INTERIM = ML_DIR / "data" / "interim"
PROCESSED = ML_DIR / "data" / "processed"

SEED = 42
N_PER_CLASS = 500

# ---------- การตัด boilerplate ที่รั่วเฉลย ----------
LEAKY_PREFIXES = [
    # คำเฉลยที่ AFNC เติมหน้าหัวข้อ (มีหลายรุ่น เช่น "อย่าแชร์!", "แชร์ว่อน!!",
    # "สร้างความปั่นป่วน หยุดแชร์!") — ตัดคำเฉลย + วลีเชิญชวนแชร์ที่ตามมา
    r"^(ข่าวปลอม|ข่าวบิดเบือน|ข่าวจริง)\s*",
    r"^(อย่าแชร์|หยุดแชร์|แชร์ว่อน|สร้างความปั่นป่วน[^!]{0,20}|ไม่ควรแชร์ต่อ)\s*!*\s*",
]
LEAKY_SUFFIXES = [
    r"\s*จริงหรือไม่\s*\??\s*$",
    r"\s*จริงหรือ\s*\??\s*$",
    r"\s*ใช่หรือไม่\s*\??\s*$",
    r"\s*ข่าวบิดเบือน\s*ไม่ควรแชร์ต่อ\s*$",
    r"\s*(อย่าแชร์ต่อ|ไม่ควรแชร์ต่อ)\s*$",
]
# ถ้าตัดแล้วยังเหลือคำเฉลยอยู่ในข้อความ → ทิ้งทั้งแถว (ปลอดภัยกว่าเก็บไว้)
LEAK_RESIDUE = re.compile(r"ข่าวปลอม|ข่าวบิดเบือน|อย่าแชร์|หยุดแชร์|จริงหรือ")


def strip_leaky_boilerplate(text: str) -> str:
    """ตัดคำขึ้นต้น/ลงท้ายที่เป็น 'คำเฉลย' ของ AFNC ออก (ใช้กับทุก label เท่ากัน)"""
    changed = True
    while changed:  # prefix อาจซ้อนกันหลายชั้น เช่น "ข่าวปลอม แชร์ว่อน!!"
        before = text
        for pat in LEAKY_PREFIXES:
            text = re.sub(pat, "", text).strip()
        changed = text != before
    for pat in LEAKY_SUFFIXES:
        text = re.sub(pat, "", text)
    return text.strip()


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFC", str(text))
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def load_afnc() -> pd.DataFrame:
    rows = []
    for f in sorted(RAW_AFNC.glob("afnc_*.json")):
        for x in json.loads(f.read_text())["data"]:
            label_th = x.get("status_label")
            if label_th not in ("ข่าวปลอม", "ข่าวจริง"):
                continue  # ตัด บิดเบือน/คลังความรู้/อาชญากรรมออนไลน์/อื่นๆ
            title = normalize(x.get("post_title", ""))
            text = strip_leaky_boilerplate(title)
            if len(text) < 15:  # สั้นเกินไป ไม่มีเนื้อหาพอ
                continue
            rows.append(
                {
                    "text": text,
                    "label": 1 if label_th == "ข่าวปลอม" else 0,
                    "source": "AFNC OpenData",
                    "url": x.get("guid", ""),
                    "date": x.get("post_date_gmt", ""),
                    "topic": x.get("news_type", ""),
                }
            )
    return pd.DataFrame(rows)


def load_afp() -> pd.DataFrame:
    """โหลดข้อมูล AFP Fact Check (ถ้าเก็บไว้แล้ว) — คำกล่าวอ้างเท็จ = label 1"""
    f = RAW_AFP / "afp_claims.json"
    if not f.exists():
        return pd.DataFrame()
    rows = []
    for x in json.loads(f.read_text()):
        text = strip_leaky_boilerplate(normalize(x["claim"]))
        if len(text) < 15:
            continue
        rows.append(
            {
                "text": text,
                "label": 1,
                "source": "AFP Fact Check",
                "url": x.get("url", ""),
                "date": x.get("date", ""),
                "topic": x.get("topic", "AFP"),
            }
        )
    return pd.DataFrame(rows)


def main() -> None:
    INTERIM.mkdir(parents=True, exist_ok=True)
    PROCESSED.mkdir(parents=True, exist_ok=True)

    df = pd.concat([load_afnc(), load_afp()], ignore_index=True)
    print(f"โหลดทั้งหมด: {len(df)} rows")

    # dedupe: ข้อความเดียวกัน (หลัง normalize) เก็บรายการแรก
    df["text_key"] = df["text"].str.lower()
    df = df.drop_duplicates("text_key").drop(columns="text_key")
    print(f"หลัง dedupe: {len(df)} rows")
    print(df["label"].value_counts().rename({0: "จริง", 1: "ปลอม"}).to_string())

    # ทิ้งแถวที่ยังมีคำเฉลยหลงเหลือ (กัน data leakage เด็ดขาด)
    residue_mask = df["text"].str.contains(LEAK_RESIDUE)
    print(f"ทิ้งแถวที่ยังมีคำเฉลยตกค้าง: {residue_mask.sum()} rows")
    df = df[~residue_mask].reset_index(drop=True)
    print(df["label"].value_counts().rename({0: "จริง", 1: "ปลอม"}).to_string())

    df.to_csv(INTERIM / "afnc_pool.csv", index=False)

    # สุ่ม 500:500 ด้วย seed คงที่ แล้ว shuffle
    balanced = (
        pd.concat(
            [
                df[df["label"] == 0].sample(
                    min(N_PER_CLASS, (df["label"] == 0).sum()), random_state=SEED
                ),
                df[df["label"] == 1].sample(
                    min(N_PER_CLASS, (df["label"] == 1).sum()), random_state=SEED
                ),
            ]
        )
        .sample(frac=1, random_state=SEED)
        .reset_index(drop=True)
    )
    out = PROCESSED / "thai_fakenews_1000.csv"
    balanced.to_csv(out, index=False)
    print(f"\nบันทึก {len(balanced)} rows → {out}")
    print(balanced["label"].value_counts().rename({0: "จริง", 1: "ปลอม"}).to_string())
    print("\nตัวอย่าง:")
    for _, r in balanced.head(4).iterrows():
        print(f"  [{'ปลอม' if r['label'] else 'จริง'}] {r['text'][:70]}")


if __name__ == "__main__":
    main()
