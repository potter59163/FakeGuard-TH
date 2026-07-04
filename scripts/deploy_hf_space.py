"""สร้าง/อัปเดต Hugging Face Space (Docker) จากไฟล์ใน deploy/space/

วิธีใช้ (หลังอัปโหลดโมเดลด้วย upload_models_to_hf.py แล้ว):
  export HF_TOKEN=hf_xxxxxxxx          # หรือมีไฟล์ .hf_token อยู่แล้ว
  .venv/bin/python scripts/deploy_hf_space.py <hf-username>
"""

import sys
from pathlib import Path

from _hf_auth import get_token

ROOT = Path(__file__).resolve().parents[1]
SPACE_DIR = ROOT / "deploy" / "space"


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("ใช้: .venv/bin/python scripts/deploy_hf_space.py <hf-username>")
    username = sys.argv[1]
    space_id = f"{username}/fakeguard-th-api"
    model_repo = f"{username}/fakeguard-th-models"

    from huggingface_hub import HfApi

    api = HfApi(token=get_token())
    api.create_repo(space_id, repo_type="space", space_sdk="docker", exist_ok=True,
                     private=False)
    api.add_space_variable(space_id, "HF_MODEL_REPO", model_repo)
    api.add_space_variable(space_id, "FRONTEND_ORIGIN", "*")  # ปรับเป็น URL Vercel ทีหลัง

    print(f"กำลังอัปโหลดโค้ด {SPACE_DIR} → {space_id}")
    api.upload_folder(folder_path=str(SPACE_DIR), repo_id=space_id, repo_type="space")

    print(f"\nสร้าง Space แล้ว → https://huggingface.co/spaces/{space_id}")
    print(f"URL API (รอ build เสร็จ ~5-10 นาที) → https://{username}-fakeguard-th-api.hf.space")


if __name__ == "__main__":
    main()
