"use client";

import { useEffect, useState } from "react";
import { getModels, type ModelsResponse } from "@/lib/api";
import { AlertTriangleIcon, ChartIcon, TrophyIcon } from "@/components/icons";

const METRIC_LABELS: Record<string, string> = {
  f1: "F1-score",
  precision: "Precision",
  recall: "Recall",
  accuracy: "Accuracy",
};

const BAR_COLORS: Record<string, string> = {
  wangchanberta: "bg-rose-400",
  svm: "bg-red-600",
  random_forest: "bg-orange-400",
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
      <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-800">
        <AlertTriangleIcon className="h-5 w-5 shrink-0" />
        เชื่อมต่อ API ไม่ได้ ({error}) — รอเซิร์ฟเวอร์ตื่นสักครู่แล้วรีเฟรชอีกครั้ง
      </div>
    );
  if (!data)
    return <p className="text-center text-stone-400">กำลังโหลดผลการทดลอง…</p>;

  const entries = Object.entries(data.models).sort((a, b) => b[1].f1 - a[1].f1);

  return (
    <div className="space-y-8">
      <section className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-100 text-red-600">
          <ChartIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-red-800">
          ผลเปรียบเทียบโมเดล
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-stone-500">
          ประเมินบน test set เดียวกัน 200 ข้อความ (ข่าวจริง 100 : ข่าวปลอม 100)
          — ทุกโมเดลใช้ข้อมูลและการแบ่งชุดเดียวกันเพื่อความยุติธรรม
        </p>
      </section>

      <section className="overflow-x-auto rounded-3xl border-2 border-red-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-red-100 bg-[#FEFBFA] text-left">
              <th className="px-4 py-3 text-red-800">โมเดล</th>
              {Object.values(METRIC_LABELS).map((l) => (
                <th key={l} className="px-4 py-3 text-center text-red-800">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, m]) => (
              <tr key={name} className="border-b border-red-50 last:border-0">
                <td className="px-4 py-3 font-medium">
                  {m.display_name}
                  {name === data.best_model && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      <TrophyIcon className="h-3.5 w-3.5" />
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

      <section className="rounded-3xl border-2 border-red-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-red-800">
          F1-score (ยิ่งสูงยิ่งดี)
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
              <div className="h-4 w-full overflow-hidden rounded-full bg-red-50">
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
              className="rounded-3xl border-2 border-red-100 bg-white p-4 shadow-sm"
            >
              <h3 className="mb-3 text-sm font-semibold text-red-800">
                {m.display_name}
              </h3>
              <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
                <div className="rounded-xl bg-emerald-50 p-2">
                  <div className="text-lg font-semibold text-emerald-700">
                    {cm[0][0]}
                  </div>
                  จริง→จริง ถูก
                </div>
                <div className="rounded-xl bg-red-50 p-2">
                  <div className="text-lg font-semibold text-red-600">
                    {cm[0][1]}
                  </div>
                  จริง→ปลอม ผิด
                </div>
                <div className="rounded-xl bg-red-50 p-2">
                  <div className="text-lg font-semibold text-red-600">
                    {cm[1][0]}
                  </div>
                  ปลอม→จริง ผิด
                </div>
                <div className="rounded-xl bg-emerald-50 p-2">
                  <div className="text-lg font-semibold text-emerald-700">
                    {cm[1][1]}
                  </div>
                  ปลอม→ปลอม ถูก
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
