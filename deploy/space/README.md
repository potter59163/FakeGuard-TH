---
title: FakeGuard-TH API
emoji: 🛡️
colorFrom: red
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

# FakeGuard-TH API

Backend API สำหรับตรวจสอบความน่าเชื่อถือของข่าวภาษาไทย
(โครงงาน JSTP รุ่นที่ 29 — ปริพัฒน์ รอดหยู่)

ให้บริการโมเดลครบทั้ง 3 ตัว: SVM + TF-IDF, Random Forest + TF-IDF,
และ WangchanBERTa (fine-tuned) — โหลดจาก Hugging Face Model Hub ตอน start

## Endpoints

- `GET /api/health`
- `GET /api/models` — metrics เปรียบเทียบ 3 โมเดล
- `POST /api/predict` — `{"text": "...", "model": "svm|random_forest|wangchanberta"}`

โค้ดต้นทางเต็ม: https://github.com/potter59163/FakeGuard-TH
