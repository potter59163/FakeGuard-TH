"use client";

import { useEffect, useState } from "react";
import { getModels, predict, type PredictResponse } from "@/lib/api";

type ModelOption = { value: string; label: string; disabled?: boolean };

const DEFAULT_OPTIONS: ModelOption[] = [
  { value: "", label: "โมเดลที่ดีที่สุด (อัตโนมัติ)" },
];

const EXAMPLES = [
  {
    emoji: "🏦",
    text: "ธนาคารออมสินปล่อยสินเชื่อผ่านเพจเฟซบุ๊ก กู้ได้ทุกอาชีพ ไม่ต้องมีหลักทรัพย์",
  },
  {
    emoji: "🌧️",
    text: "กรมอุตุนิยมวิทยาประกาศเตือนพายุฤดูร้อนบริเวณภาคเหนือช่วงสุดสัปดาห์นี้",
  },
  {
    emoji: "🍋",
    text: "ดื่มน้ำมะนาวผสมเบกกิ้งโซดาทุกเช้า ช่วยฆ่าเซลล์มะเร็งได้ภายใน 30 วัน",
  },
];

export default function CheckNewsPage() {
  const [text, setText] = useState("");
  const [model, setModel] = useState("");
  const [options, setOptions] = useState<ModelOption[]>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getModels()
      .then((data) => {
        const opts: ModelOption[] = [...DEFAULT_OPTIONS];
        for (const [name, m] of Object.entries(data.models)) {
          opts.push({
            value: name,
            label:
              m.available === false
                ? `${m.display_name} (เฉพาะเครื่อง dev)`
                : m.display_name,
            disabled: m.available === false,
          });
        }
        setOptions(opts);
      })
      .catch(() => {}); // backend ยังหลับ — BackendWaker จัดการอยู่
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 10) {
      setError("กรอกข้อความอย่างน้อย 10 ตัวอักษรก่อนนะ");
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
        <div className="text-5xl">📰✨</div>
        <h1 className="mt-3 text-3xl font-semibold text-green-900">
          ข่าวนี้… จริงหรือมั่วนะ?
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-stone-500">
          วางข้อความข่าวที่สงสัย แล้วให้ AI ที่เรียนรู้จากข้อมูลศูนย์ต่อต้านข่าวปลอม
          1,000 ข้อความ ช่วยคัดกรองให้ก่อนแชร์ต่อ
        </p>
      </section>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-3xl border-2 border-green-100 bg-white p-6 shadow-sm"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="วางข้อความข่าวที่ต้องการตรวจสอบที่นี่… 🧐"
          className="w-full resize-y rounded-2xl border-2 border-green-100 bg-[#FDFBF6] p-4 placeholder:text-stone-300 focus:border-green-400 focus:outline-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-stone-600">
            โมเดล:
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="rounded-full border-2 border-green-100 bg-white px-3 py-1.5"
            >
              {options.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-green-600 px-8 py-2.5 font-semibold text-white shadow-sm transition hover:bg-green-700 hover:shadow disabled:opacity-50"
          >
            {loading ? "กำลังวิเคราะห์… 🔎" : "ตรวจสอบเลย!"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400">ลองตัวอย่าง:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.text}
              type="button"
              onClick={() => setText(ex.text)}
              className="rounded-full border-2 border-green-100 bg-[#FDFBF6] px-3 py-1.5 text-stone-500 transition hover:border-green-300 hover:text-green-700"
            >
              {ex.emoji} {ex.text.slice(0, 28)}…
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-800">
          🙈 {error}
        </div>
      )}

      {result && (
        <section
          className={`rounded-3xl border-2 p-6 ${
            isFake
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div
                className={`text-3xl font-semibold ${
                  isFake ? "text-red-600" : "text-green-700"
                }`}
              >
                {isFake ? "🚨 น่าจะเป็นข่าวปลอม" : "💚 น่าจะเป็นข่าวจริง"}
              </div>
              <div className="mt-1 text-sm text-stone-500">
                วิเคราะห์โดย {result.display_name} · ใช้เวลา{" "}
                {result.latency_ms.toLocaleString()} ms
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-4xl font-semibold ${
                  isFake ? "text-red-600" : "text-green-700"
                }`}
              >
                {pct}%
              </div>
              <div className="text-xs text-stone-500">ความมั่นใจ</div>
            </div>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isFake ? "bg-red-400" : "bg-green-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 text-xs text-stone-500">
            🌿 ผลนี้เป็นการคัดกรองเบื้องต้นจากรูปแบบภาษาเท่านั้น
            โปรดตรวจสอบข้อเท็จจริงกับแหล่งข่าวทางการ เช่น ศูนย์ต่อต้านข่าวปลอม
            (antifakenewscenter.com) ก่อนแชร์ต่อ
          </p>
        </section>
      )}
    </div>
  );
}
