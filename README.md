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

## Deploy

มี 2 ทางเลือกสำหรับ backend — ต่างกันตรงว่าครบ 3 โมเดลหรือไม่:

|  | Render (free) | Hugging Face Space (free) |
|---|---|---|
| RAM | 512MB | ~16GB |
| โมเดลที่ใช้ได้ | SVM + Random Forest เท่านั้น | **ครบทั้ง 3 โมเดล รวม WangchanBERTa** |
| ไฟล์โมเดล | commit ไว้ใน repo (เล็ก) | เก็บแยกบน HF Model Hub ดาวน์โหลดตอน start |
| หลับ/ตื่น | หลับหลังไม่ใช้ ~15 นาที | หลับหลังไม่ใช้ (นานกว่า) |

แนะนำ **Hugging Face Space** ถ้าอยากให้ WangchanBERTa ใช้งานได้บนเว็บจริงด้วย

### Backend → Hugging Face Space (แนะนำ — ครบทั้ง 3 โมเดล)

โค้ด Space อยู่ใน `deploy/space/` (Docker, ดาวน์โหลดโมเดลจาก HF Model Hub ตอน start)
สคริปต์ deploy อยู่ใน `scripts/`

1. สมัคร/ล็อกอิน [huggingface.co](https://huggingface.co)
2. สร้าง Access Token (สิทธิ์ **Write**) ที่ [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
3. ตั้ง token: `export HF_TOKEN=hf_xxxxxxxx` (หรือวางไว้ในไฟล์ `.hf_token` ที่ root โปรเจกต์ — อยู่ใน `.gitignore` แล้ว)
4. อัปโหลดโมเดลทั้ง 3 ตัวขึ้น HF Model Hub (ครั้งแรกใช้เวลาสักพักเพราะ
   WangchanBERTa 403MB):
   ```bash
   .venv/bin/pip install huggingface_hub
   .venv/bin/python scripts/upload_models_to_hf.py <your-hf-username>
   ```
5. สร้างและ deploy Space:
   ```bash
   .venv/bin/python scripts/deploy_hf_space.py <your-hf-username>
   ```
6. รอ build ~5-10 นาที (ดูสถานะที่หน้า Space บน huggingface.co) แล้วทดสอบ:
   `curl https://<username>-fakeguard-th-api.hf.space/api/health`
7. หลัง deploy frontend (ขั้นถัดไป) แล้ว กลับมาแก้ Space variable
   `FRONTEND_ORIGIN` เป็น URL ของ Vercel เพื่อจำกัด CORS (แก้ได้ที่หน้า
   Settings ของ Space หรือรัน `deploy_hf_space.py` ซ้ำ)

### Backend → Render (ทางเลือกเบา — SVM/RF เท่านั้น)

มีไฟล์ `render.yaml` (Blueprint) เตรียมไว้แล้ว:

1. เข้า [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint**
2. เชื่อม GitHub แล้วเลือก repo `FakeGuard-TH` → **Apply**
3. Render จะสร้าง service `fakeguard-th-api` อัตโนมัติ (ติดตั้งจาก
   `backend/requirements-render.txt` — เวอร์ชัน slim ไม่มี torch)
4. เสร็จแล้วจะได้ URL เช่น `https://fakeguard-th-api.onrender.com`
   ทดสอบด้วย `curl https://<url>/api/health`

ข้อจำกัด free tier: RAM 512MB → ให้บริการเฉพาะ **SVM + Random Forest**
(WangchanBERTa 403MB + torch ใหญ่เกิน ใช้เส้นทาง HF Space ด้านบนแทน — API
จะรายงาน `available: false` และ frontend จะ disable ตัวเลือกนี้เอง)
ทั้งสองทางเลือกจะ**หลับหลังไม่มีคนใช้** และ frontend มี popup
ปลุกเซิร์ฟเวอร์รอไว้แล้ว (`components/BackendWaker.tsx`)

### Frontend → Vercel

1. เข้า [vercel.com](https://vercel.com) → **Add New → Project** → เลือก repo นี้
2. ตั้ง **Root Directory = `frontend`**
3. เพิ่ม Environment Variable: `NEXT_PUBLIC_API_BASE` = URL ของ backend ที่ deploy ไว้
   (เช่น `https://<username>-fakeguard-th-api.hf.space` หรือ Render URL)
4. Deploy — เสร็จแล้วอย่าลืมกลับไปตั้ง `FRONTEND_ORIGIN` บน backend
   เป็น URL ของ Vercel (เช่น `https://fakeguard-th.vercel.app`) เพื่อจำกัด CORS

## ผลการทดลอง

ดู `ml/reports/results.md` (สร้างโดย `evaluate.py`) และ `ml/reports/error_analysis.md`

## เอกสารสำคัญ

- `ml/reports/data_card.md` — ที่มาข้อมูล การป้องกัน data leakage และข้อจำกัด
- `ml/reports/eda.md` — สถิติเบื้องต้นของ dataset
- `คอมพิวเตอร์_ปริพัฒน์_รอดหยู่_ข้อเสนอโครงงาน.pdf` — ข้อเสนอโครงงานฉบับเต็ม
