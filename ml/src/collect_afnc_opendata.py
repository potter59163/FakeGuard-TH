"""ดึงข้อมูลข่าวจากพอร์ทัล Open Data ของศูนย์ต่อต้านข่าวปลอม (AFNC)

ใช้ endpoint /api/export-posts (ตัวเดียวกับปุ่มดาวน์โหลด CSV บนเว็บ)
ดึงทีละเดือนช่วง พ.ศ. 2563-2567 (ค.ศ. 2020-2024) แล้วเก็บ JSON ดิบลง ml/data/raw/afnc/

รัน:  .venv/bin/python ml/src/collect_afnc_opendata.py
"""

import json
import time
from calendar import monthrange
from pathlib import Path

import requests

API_URL = "https://opendata.antifakenewscenter.com/api/export-posts"
RAW_DIR = Path(__file__).resolve().parents[1] / "data" / "raw" / "afnc"
HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "FakeGuard-TH student research project (JSTP; contact: paripat1.rod@gmail.com)",
}
START_YEAR, END_YEAR = 2020, 2024  # พ.ศ. 2563-2567
SLEEP_SECONDS = 1.5  # สุภาพกับเซิร์ฟเวอร์


def fetch_month(year: int, month: int) -> list[dict]:
    last_day = monthrange(year, month)[1]
    body = {
        "search": "",
        "start_date": f"{year}-{month:02d}-01",
        "end_date": f"{year}-{month:02d}-{last_day}",
    }
    resp = requests.post(API_URL, json=body, headers=HEADERS, timeout=120)
    resp.raise_for_status()
    return resp.json().get("data", [])


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    total = 0
    for year in range(START_YEAR, END_YEAR + 1):
        for month in range(1, 13):
            out_file = RAW_DIR / f"afnc_{year}-{month:02d}.json"
            if out_file.exists():  # ดึงแล้วข้าม (rerun ได้ปลอดภัย)
                n = len(json.loads(out_file.read_text())["data"])
                total += n
                print(f"[skip] {out_file.name}: {n} records (cached)")
                continue
            try:
                data = fetch_month(year, month)
            except requests.RequestException as e:
                print(f"[fail] {year}-{month:02d}: {e} — ข้ามไว้ rerun ทีหลัง")
                continue
            out_file.write_text(
                json.dumps({"data": data}, ensure_ascii=False), encoding="utf-8"
            )
            total += len(data)
            print(f"[ok]   {year}-{month:02d}: {len(data)} records")
            time.sleep(SLEEP_SECONDS)
    print(f"\nรวมทั้งหมด {total} records ใน {RAW_DIR}")


if __name__ == "__main__":
    main()
