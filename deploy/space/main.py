"""FakeGuard-TH Backend API — Hugging Face Space (Docker)

โหลดโมเดลทั้ง 3 ตัว (SVM, Random Forest, WangchanBERTa) จาก HF Model Hub
ตอน container start แล้วให้บริการผ่าน FastAPI เหมือน backend/main.py ทุกอย่าง
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from inference import ModelRegistry

registry = ModelRegistry()
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "*")


@asynccontextmanager
async def lifespan(app: FastAPI):
    registry.warmup()
    yield


app = FastAPI(
    title="FakeGuard-TH API",
    description="ระบบตรวจสอบความน่าเชื่อถือของข่าวภาษาไทย (โครงงาน JSTP รุ่นที่ 29)",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if FRONTEND_ORIGIN == "*" else [FRONTEND_ORIGIN],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    text: str = Field(min_length=10, max_length=2000)
    model: str | None = Field(default=None)


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
