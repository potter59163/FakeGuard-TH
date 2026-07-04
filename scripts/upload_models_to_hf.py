"""อัปโหลดโมเดลทั้ง 3 ตัว (svm, random_forest, wangchanberta) ขึ้น
Hugging Face Model Hub เพื่อให้ Space ดาวน์โหลดไปใช้ตอน start

ต้องมี HF token (เลือกสิทธิ์ "Write") จาก
https://huggingface.co/settings/tokens

วิธีใช้:
  export HF_TOKEN=hf_xxxxxxxx          # หรือวางไว้ในไฟล์ .hf_token ที่ root โปรเจกต์
  .venv/bin/python scripts/upload_models_to_hf.py <hf-username>
"""

import sys
from pathlib import Path

from _hf_auth import get_token

ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "models"


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("ใช้: .venv/bin/python scripts/upload_models_to_hf.py <hf-username>")
    username = sys.argv[1]
    repo_id = f"{username}/fakeguard-th-models"

    from huggingface_hub import HfApi

    api = HfApi(token=get_token())
    api.create_repo(repo_id, repo_type="model", exist_ok=True, private=False)
    print(f"กำลังอัปโหลด {MODELS_DIR} → {repo_id} (โมเดล WangchanBERTa 403MB อาจใช้เวลาสักครู่)")
    api.upload_folder(
        folder_path=str(MODELS_DIR),
        repo_id=repo_id,
        repo_type="model",
        ignore_patterns=["*_test_pred.npy"],  # ไม่ต้องใช้ตอน inference
    )
    print(f"\nเสร็จแล้ว → https://huggingface.co/{repo_id}")


if __name__ == "__main__":
    main()
