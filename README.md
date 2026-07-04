# FakeGuard-TH 🛡️

ต้นแบบระบบตรวจสอบความน่าเชื่อถือของข่าวภาษาไทยด้วย Machine Learning
— โครงงาน JSTP รุ่นที่ 29: *การเปรียบเทียบประสิทธิภาพของ WangchanBERTa,
Support Vector Machine และ Random Forest ในการตรวจจับข่าวปลอมภาษาไทยบนโซเชียลมีเดีย*

ผู้พัฒนา: ปริพัฒน์ รอดหยู่ (โรงเรียนสวนกุหลาบวิทยาลัย) · อาจารย์ที่ปรึกษา: ครูนิภารัตน์ รูปไข่
มีการใช้ AI (Claude) ช่วยค้นคว้างานวิจัย ตรวจภาษา และช่วยเขียนโค้ด

## สถาปัตยกรรม

```
ml/        Data & ML pipeline (Python)  — เก็บข้อมูล → สร้าง dataset → เทรน 3 โมเดล → เปรียบเทียบ
models/    Model artifacts + metrics.json
backend/   FastAPI  (port 8000)         — โหลดโมเดล ให้บริการ /api/predict, /api/models
frontend/  Next.js  (port 3000)         — หน้าตรวจข่าว / dashboard / about (เรียก API เท่านั้น)
```

## วิธีรันตั้งแต่ต้น

```bash
# 0) เตรียม environment (ครั้งเดียว)
python3 -m venv .venv
.venv/bin/pip install -r ml/requirements.txt -r backend/requirements.txt sentencepiece accelerate
cd frontend && npm install && cd ..

# 1) Data pipeline (ครั้งเดียว หรือเมื่ออยากอัปเดตข้อมูล)
.venv/bin/python ml/src/collect_afnc_opendata.py   # ดึงข้อมูล AFNC 2563-2567 (~5 นาที)
.venv/bin/python ml/src/build_dataset.py           # สร้าง dataset สมดุล 500:500
.venv/bin/python ml/src/preprocess.py              # แบ่ง train/test + EDA

# 2) เทรนโมเดล
cd ml/src
../../.venv/bin/python train_baseline.py           # SVM + Random Forest (~1 นาที)
../../.venv/bin/python train_wangchanberta.py      # fine-tune (~15-30 นาทีบน Apple Silicon)
../../.venv/bin/python evaluate.py                 # ตารางเทียบ + models/metrics.json
../../.venv/bin/python error_analysis.py           # วิเคราะห์ข้อความที่ทายผิด
cd ../..

# 3) รันระบบ
.venv/bin/uvicorn main:app --app-dir backend --port 8000   # terminal 1
cd frontend && npm run dev                                  # terminal 2 → เปิด http://localhost:3000
```

## ผลการทดลอง

ดู `ml/reports/results.md` (สร้างโดย `evaluate.py`) และ `ml/reports/error_analysis.md`

## เอกสารสำคัญ

- `ml/reports/data_card.md` — ที่มาข้อมูล การป้องกัน data leakage และข้อจำกัด
- `ml/reports/eda.md` — สถิติเบื้องต้นของ dataset
- `คอมพิวเตอร์_ปริพัฒน์_รอดหยู่_ข้อเสนอโครงงาน.pdf` — ข้อเสนอโครงงานฉบับเต็ม
