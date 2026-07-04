"use client";

import { useState } from "react";
import { predict, type PredictResponse } from "@/lib/api";

const MODEL_OPTIONS = [
  { value: "", label: "โมเดลที่ดีที่สุด (อัตโนมัติ)" },
  { value: "wangchanberta", label: "WangchanBERTa (fine-tuned)" },
  { value: "svm", label: "SVM + TF-IDF" },
  { value: "random_forest", label: "Random Forest + TF-IDF" },
];

const EXAMPLES = [
  "ธนาคารออมสินปล่อยสินเชื่อผ่านเพจเฟซบุ๊ก กู้ได้ทุกอาชีพ ไม่ต้องมีหลักทรัพย์",
  "กรมอุตุนิยมวิทยาประกาศเตือนพายุฤดูร้อนบริเวณภาคเหนือช่วงสุดสัปดาห์นี้",
  "ดื่มน้ำมะนาวผสมเบกกิ้งโซดาทุกเช้า ช่วยฆ่าเซลล์มะเร็งได้ภายใน 30 วัน",
];

export default function CheckNewsPage() {
  const [text, setText] = useState("");
  const [model, setModel] = useState("");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 10) {
      setError("กรุณากรอกข้อความอย่างน้อย 10 ตัวอักษร");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await predict(text.trim(), model || undefined));
    } catch (err) {
      setError(
        err instanceof Error
          ? `เชื่อมต่อระบบวิเคราะห์ไม่ได้: ${err.message}`
          : "เกิดข้อผิดพลาด"
      );
    } finally {
      setLoading(false);
    }
  }

  const isFake = result?.label === "fake";
  const pct = result ? Math.round(result.probability * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="text-center">
        <h1 className="text-3xl font-bold">ตรวจสอบความน่าเชื่อถือของข่าว</h1>
        <p className="mt-2 text-slate-500">
          วางข้อความข่าวภาษาไทยที่สงสัย ระบบจะวิเคราะห์ด้วย Machine Learning
          ที่เรียนรู้จากข้อมูลของศูนย์ต่อต้านข่าวปลอม 1,000 ข้อความ
        </p>
      </section>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="วางข้อความข่าวที่ต้องการตรวจสอบที่นี่…"
          className="w-full resize-y rounded-xl border border-slate-300 p-4 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            โมเดล:
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5"
            >
              {MODEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "กำลังวิเคราะห์…" : "ตรวจสอบ"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-400">ลองตัวอย่าง:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setText(ex)}
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
            >
              {ex.slice(0, 32)}…
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">
          {error}
        </div>
      )}

      {result && (
        <section
          className={`rounded-2xl border-2 p-6 ${
            isFake
              ? "border-red-300 bg-red-50"
              : "border-emerald-300 bg-emerald-50"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div
                className={`text-3xl font-bold ${
                  isFake ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {isFake ? "⚠️ น่าจะเป็นข่าวปลอม" : "✓ น่าจะเป็นข่าวจริง"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                วิเคราะห์โดย {result.display_name} · ใช้เวลา{" "}
                {result.latency_ms.toLocaleString()} ms
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${
                  isFake ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {pct}%
              </div>
              <div className="text-xs text-slate-500">ความมั่นใจ</div>
            </div>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isFake ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            ผลนี้เป็นการคัดกรองเบื้องต้นจากรูปแบบภาษาเท่านั้น
            โปรดตรวจสอบข้อเท็จจริงกับแหล่งข่าวทางการ เช่น ศูนย์ต่อต้านข่าวปลอม
            (antifakenewscenter.com) ก่อนแชร์ต่อ
          </p>
        </section>
      )}
    </div>
  );
}
