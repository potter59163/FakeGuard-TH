"""Preprocessing กลาง — สำเนาสำหรับ Docker image ของ Hugging Face Space

ต้นฉบับอยู่ที่ ml/src/preprocess.py — คัดลอกมาที่นี่เพราะ Docker build ของ
Space เป็น context แยกจากโปรเจกต์หลัก (ไม่ดึงทั้ง repo) ถ้าแก้ preprocessing
ที่ต้นฉบับ ต้องอัปเดตไฟล์นี้ให้ตรงกันด้วย แล้ว deploy ใหม่

สำคัญ: ต้องชื่อโมดูล "preprocess" เหมือนเดิม เพราะ joblib pickle ของ
SVM/Random Forest อ้างอิง thai_tokens จากโมดูลชื่อนี้ตอนเทรน
"""

import re

URL_RE = re.compile(r"https?://\S+|www\.\S+")
EMOJI_RE = re.compile(
    "[\U0001f300-\U0001faff\U00002700-\U000027bf\U0001f000-\U0001f0ff"
    "\U00002600-\U000026ff️]+"
)
KEEP_RE = re.compile(r"[^฀-๿a-zA-Z0-9\s.,%\-]")


def clean_text(text: str) -> str:
    text = str(text)
    text = URL_RE.sub(" ", text)
    text = EMOJI_RE.sub(" ", text)
    text = KEEP_RE.sub(" ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def thai_tokens(text: str) -> list[str]:
    from pythainlp.corpus import thai_stopwords
    from pythainlp.tokenize import word_tokenize

    tokens = word_tokenize(clean_text(text), engine="newmm", keep_whitespace=False)
    stops = thai_stopwords()
    return [t for t in tokens if t not in stops and t.strip()]
