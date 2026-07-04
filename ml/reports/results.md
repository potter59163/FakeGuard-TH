# ผลการเปรียบเทียบโมเดล — FakeGuard-TH

ประเมินบน test set เดียวกัน 200 ข้อความ (จริง 100 : ปลอม 100), seed 42

| โมเดล | F1 | Precision | Recall | Accuracy |
|---|---|---|---|---|
| SVM + TF-IDF **← ดีที่สุด** | 0.7463 | 0.7426 | 0.7500 | 0.7450 |
| Random Forest + TF-IDF | 0.7200 | 0.7200 | 0.7200 | 0.7200 |
| WangchanBERTa (fine-tuned) | 0.7097 | 0.6581 | 0.7700 | 0.6850 |

## Confusion Matrix (แถว=จริง, คอลัมน์=ทำนาย; ลำดับ [จริง, ปลอม])

- **SVM + TF-IDF**: TN=74 FP=26 FN=25 TP=75
- **Random Forest + TF-IDF**: TN=72 FP=28 FN=28 TP=72
- **WangchanBERTa (fine-tuned)**: TN=60 FP=40 FN=23 TP=77

## สมมติฐาน (WangchanBERTa F1 ≥ 0.85 และสูงกว่า baseline): ⚠️ ไม่เป็นไปตามสมมติฐานทั้งหมด — อภิปรายในรายงาน