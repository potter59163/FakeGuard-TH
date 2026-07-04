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
  wangchanberta: "bg-indigo-500",
  svm: "bg-sky-500",
  random_forest: "bg-teal-500",
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
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-800">
        เชื่อมต่อ API ไม่ได้ ({error}) — ตรวจสอบว่า backend รันอยู่ที่ port 8000
      </div>
    );
  if (!data) return <p className="text-slate-500">กำลังโหลดผลการทดลอง…</p>;

  const entries = Object.entries(data.models).sort(
    (a, b) => b[1].f1 - a[1].f1
  );

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">ผลเปรียบเทียบโมเดล</h1>
        <p className="mt-2 text-slate-500">
          ประเมินบน test set เดียวกัน 200 ข้อความ (ข่าวจริง 100 : ข่าวปลอม 100)
          — ทุกโมเดลใช้ข้อมูลและการแบ่งชุดเดียวกันเพื่อความยุติธรรม
        </p>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3">โมเดล</th>
              {Object.values(METRIC_LABELS).map((l) => (
                <th key={l} className="px-4 py-3 text-center">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, m]) => (
              <tr key={name} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium">
                  {m.display_name}
                  {name === data.best_model && (
                    <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                      ดีที่สุด
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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">F1-score (ยิ่งสูงยิ่งดี)</h2>
        <div className="space-y-3">
          {entries.map(([name, m]) => (
            <div key={name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{m.display_name}</span>
                <span className="tabular-nums font-medium">
                  {m.f1.toFixed(4)}
                </span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${BAR_COLORS[name] ?? "bg-slate-400"}`}
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
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <h3 className="mb-3 text-sm font-semibold">{m.display_name}</h3>
              <div className="grid grid-cols-2 gap-1 text-center text-xs">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <div className="text-lg font-bold text-emerald-700">
                    {cm[0][0]}
                  </div>
                  จริง→จริง ✓
                </div>
                <div className="rounded-lg bg-red-50 p-2">
                  <div className="text-lg font-bold text-red-700">{cm[0][1]}</div>
                  จริง→ปลอม ✗
                </div>
                <div className="rounded-lg bg-red-50 p-2">
                  <div className="text-lg font-bold text-red-700">{cm[1][0]}</div>
                  ปลอม→จริง ✗
                </div>
                <div className="rounded-lg bg-emerald-50 p-2">
                  <div className="text-lg font-bold text-emerald-700">
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
