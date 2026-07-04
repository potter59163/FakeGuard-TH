"""FakeGuard-TH Backend API (FastAPI)

รัน:  .venv/bin/uvicorn main:app --app-dir backend --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from inference import ModelRegistry

registry = ModelRegistry()


@asynccontextmanager
async def lifespan(app: FastAPI):
    registry.warmup()  # โหลดโมเดลทั้งหมดตอน start
    yield


app = FastAPI(
    title="FakeGuard-TH API",
    description="ระบบตรวจสอบความน่าเชื่อถือของข่าวภาษาไทย (โครงงาน JSTP รุ่น 29)",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    text: str = Field(min_length=10, max_length=2000,
                      description="ข้อความข่าวภาษาไทยที่ต้องการตรวจสอบ")
    model: str | None = Field(default=None,
                              description="svm | random_forest | wangchanberta (ไม่ระบุ = ตัวที่ดีที่สุด)")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "best_model": registry.best}


@app.get("/api/models")
def models() -> dict:
    return registry.metrics


@app.post("/api/predict")
def predict(req: PredictRequest) -> dict:
    try:
        return registry.predict(req.text, req.model)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
