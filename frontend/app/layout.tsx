import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "FakeGuard-TH — ระบบตรวจสอบความน่าเชื่อถือของข่าวภาษาไทย",
  description:
    "ต้นแบบระบบตรวจจับข่าวปลอมภาษาไทยด้วย Machine Learning (โครงงาน JSTP รุ่นที่ 29)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${plexThai.className} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
                FG
              </span>
              FakeGuard-TH
            </Link>
            <div className="flex gap-1 text-sm">
              <Link href="/" className="rounded-lg px-3 py-2 hover:bg-slate-100">
                ตรวจสอบข่าว
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 hover:bg-slate-100"
              >
                ผลเปรียบเทียบโมเดล
              </Link>
              <Link
                href="/about"
                className="rounded-lg px-3 py-2 hover:bg-slate-100"
              >
                เกี่ยวกับโครงงาน
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-4xl px-4 pb-8 text-center text-xs text-slate-400">
          ผลการวิเคราะห์เป็นเพียงการคัดกรองเบื้องต้น
          ไม่ใช่คำตัดสินสุดท้าย โปรดตรวจสอบกับแหล่งข่าวทางการเสมอ
        </footer>
      </body>
    </html>
  );
}
