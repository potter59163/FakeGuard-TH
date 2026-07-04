"""หา HF token: env HF_TOKEN ก่อน ไม่มีค่อยดูไฟล์ .hf_token ที่ root โปรเจกต์
(.hf_token อยู่ใน .gitignore แล้ว ไม่มีวันหลุดขึ้น git)
"""

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def get_token() -> str:
    tok = os.environ.get("HF_TOKEN")
    if tok:
        return tok.strip()
    f = ROOT / ".hf_token"
    if f.exists():
        tok = f.read_text().strip()
        if tok:
            return tok
    raise SystemExit(
        "ไม่พบ HF token — ตั้ง env HF_TOKEN หรือสร้างไฟล์ .hf_token ที่ root "
        "โปรเจกต์ (เอา token จาก https://huggingface.co/settings/tokens "
        "เลือกสิทธิ์ Write)"
    )
