"use client";

import { useEffect, useState } from "react";
import { getModels, type ModelsResponse } from "@/lib/api";

const METRIC_LABELS: Record<string, string> = {
  f1: "F1-score",
  precision: "Precision",
  recall: "Recall",
  accuracy: "Accuracy",
};

const BAR_COLORS: Record<string, string> = {
  wangchanberta: "bg-violet-400",
  svm: "bg-green-500",
  random_forest: "bg-amber-400",
};

export default function DashboardPage() {
  const [data, setData] = useState<ModelsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getModels()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "โหลดข้อมูลไม่ได้"));
  }, []);

  if (error)
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-800">
        🙈 เชื่อมต่อ API ไม่ได้ ({error}) — รอเซิร์ฟเวอร์ตื่นแป๊บนึงแล้วรีเฟรชนะ
      </div>
    );
  if (!data)
    return <p className="text-center text-stone-400">กำลังโหลดผลการทดลอง… 🐢</p>;

  const entries = Object.entries(data.models).sort((a, b) => b[1].f1 - a[1].f1);

  return (
    <div className="space-y-8">
      <section className="text-center">
        <div className="text-5xl">📊🌾</div>
        <h1 className="mt-3 text-3xl font-semibold text-green-900">
          ผลเปรียบเทียบโมเดล
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-stone-500">
          ประเมินบน test set เดียวกัน 200 ข้อความ (ข่าวจริง 100 : ข่าวปลอม 100)
          — ทุกโมเดลใช้ข้อมูลและการแบ่งชุดเดียวกันเพื่อความยุติธรรม
        </p>
      </section>

      <section className="overflow-x-auto rounded-3xl border-2 border-green-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-green-100 bg-[#FDFBF6] text-left">
              <th className="px-4 py-3 text-green-900">โมเดล</th>
              {Object.values(METRIC_LABELS).map((l) => (
                <th key={l} className="px-4 py-3 text-center text-green-900">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, m]) => (
              <tr key={name} className="border-b border-green-50 last:border-0">
                <td className="px-4 py-3 font-medium">
                  {m.display_name}
                  {name === data.best_model && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      🏆 ดีที่สุด
                    </span>
                  )}
                </td>
                {(["f1", "precision", "recall", "accuracy"] as const).map(
                  (k) => (
                    <td key={k} className="px-4 py-3 text-center tabular-nums">
                      {m[k].toFixed(4)}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl border-2 border-green-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-green-900">
          🌱 F1-score (ยิ่งสูงยิ่งดี)
        </h2>
        <div className="space-y-3">
          {entries.map(([name, m]) => (
            <div key={name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{m.display_name}</span>
                <span className="font-medium tabular-nums">
                  {m.f1.toFixed(4)}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-[#F3EFE3]">
                <div
                  className={`h-full rounded-full ${BAR_COLORS[name] ?? "bg-stone-400"}`}
                  style={{ width: `${m.f1 * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {entries.map(([name, m]) => {
          const cm = m.confusion_matrix;
          return (
            <div
              key={name}
              className="rounded-3xl border-2 border-green-100 bg-white p-4 shadow-sm"
            >
              <h3 className="mb-3 text-sm font-semibold text-green-900">
                {m.display_name}
              </h3>
              <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
                <div className="rounded-xl bg-green-50 p-2">
                  <div className="text-lg font-semibold text-green-700">
                    {cm[0][0]}
                  </div>
                  จริง→จริง ✓
                </div>
                <div className="rounded-xl bg-red-50 p-2">
                  <div className="text-lg font-semibold text-red-600">
                    {cm[0][1]}
                  </div>
                  จริง→ปลอม ✗
                </div>
                <div className="rounded-xl bg-red-50 p-2">
                  <div className="text-lg font-semibold text-red-600">
                    {cm[1][0]}
                  </div>
                  ปลอม→จริง ✗
                </div>
                <div className="rounded-xl bg-green-50 p-2">
                  <div className="text-lg font-semibold text-green-700">
                    {cm[1][1]}
                  </div>
                  ปลอม→ปลอม ✓
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
