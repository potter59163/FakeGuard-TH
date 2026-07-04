"use client";

import { useEffect, useRef, useState } from "react";
import { pingHealth } from "@/lib/api";
import { MoonIcon, RefreshIcon, ShieldIcon } from "@/components/icons";

const WAKE_TIMEOUT_MS = 150_000; // Render free tier ตื่นได้ภายใน ~1-2 นาที
const RETRY_EVERY_MS = 3_000;

const MESSAGES = [
  "เซิร์ฟเวอร์ฟรีชอบงีบ กำลังไปสะกิดให้ตื่น…",
  "เกือบแล้วๆ กำลังอุ่นเครื่องโมเดล AI…",
  "ชงกาแฟให้เซิร์ฟเวอร์อยู่ อีกแป๊บเดียว",
  "ปลุกยากหน่อย แต่ตื่นแน่นอน รออีกนิดนะ",
];

type Status = "checking" | "waking" | "ready" | "failed";

export default function BackendWaker() {
  const [status, setStatus] = useState<Status>("checking");
  const [msgIdx, setMsgIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const runId = useRef(0);

  function startWaking() {
    const id = ++runId.current;
    setStatus("checking");
    setElapsed(0);
    (async () => {
      // เช็คครั้งแรกแบบเร็ว — ถ้า backend ตื่นอยู่แล้ว ไม่ต้องโชว์อะไรเลย
      if (await pingHealth(3000)) {
        if (runId.current === id) setStatus("ready");
        return;
      }
      if (runId.current !== id) return;
      setStatus("waking");
      const start = Date.now();
      while (runId.current === id && Date.now() - start < WAKE_TIMEOUT_MS) {
        await new Promise((r) => setTimeout(r, RETRY_EVERY_MS));
        setElapsed(Math.round((Date.now() - start) / 1000));
        if (await pingHealth(5000)) {
          if (runId.current === id) setStatus("ready");
          return;
        }
      }
      if (runId.current === id) setStatus("failed");
    })();
  }

  useEffect(() => {
    startWaking();
    return () => {
      runId.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status !== "waking") return;
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
      6000
    );
    return () => clearInterval(t);
  }, [status]);

  if (status === "ready" || status === "checking") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDF6F4]/95 backdrop-blur-sm">
      <div className="mx-4 max-w-sm rounded-3xl border-2 border-red-100 bg-white p-8 text-center shadow-xl">
        {status === "waking" ? (
          <>
            <div className="relative mx-auto h-20 w-20 animate-bounce text-red-500">
              <ShieldIcon className="h-20 w-20" />
              <MoonIcon className="absolute -right-3 -top-2 h-8 w-8 text-red-300" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-red-800">
              กำลังปลุกเซิร์ฟเวอร์
            </h2>
            <p className="mt-2 min-h-12 text-sm text-stone-500">
              {MESSAGES[msgIdx]}
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-red-50">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-1000"
                style={{ width: `${Math.min(95, (elapsed / 90) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-stone-400">
              เซิร์ฟเวอร์ฟรีจะหลับเมื่อไม่มีคนใช้ ปกติตื่นภายใน ~1 นาที
              ({elapsed} วิ)
            </p>
          </>
        ) : (
          <>
            <MoonIcon className="mx-auto h-16 w-16 text-stone-300" />
            <h2 className="mt-4 text-xl font-semibold text-stone-700">
              ปลุกไม่ตื่นเลย…
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              เซิร์ฟเวอร์อาจมีปัญหาชั่วคราว ลองใหม่อีกครั้ง
              หรือกลับมาใหม่ภายหลังนะ
            </p>
            <button
              onClick={startWaking}
              className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-700"
            >
              <RefreshIcon className="h-4.5 w-4.5" />
              ลองปลุกอีกครั้ง
            </button>
          </>
        )}
      </div>
    </div>
  );
}
