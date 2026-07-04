import type { Metadata } from "next";
import { Mitr } from "next/font/google";
import Link from "next/link";
import BackendWaker from "@/components/BackendWaker";
import "./globals.css";

const mitr = Mitr({
  weight: ["300", "400", "500", "600"],
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "FakeGuard-TH — ตรวจสอบความน่าเชื่อถือของข่าวภาษาไทย",
  description:
    "ต้นแบบระบบตรวจจับข่าวปลอมภาษาไทยด้วย Machine Learning (โครงงาน JSTP รุ่นที่ 29)",
};

const NAV = [
  { href: "/", label: "🔍 ตรวจสอบข่าว" },
  { href: "/dashboard", label: "📊 ผลเปรียบเทียบโมเดล" },
  { href: "/about", label: "🌱 เกี่ยวกับโครงงาน" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${mitr.className} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#FBF7EE] text-stone-800">
        <BackendWaker />
        <header className="border-b-2 border-green-100 bg-white/80 backdrop-blur">
          <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-green-800">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-green-600 text-lg shadow-sm">
                🛡️
              </span>
              FakeGuard-TH
            </Link>
            <div className="flex flex-wrap gap-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2 text-stone-600 transition hover:bg-green-100 hover:text-green-800"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-4xl px-4 pb-8 text-center text-xs text-stone-400">
          🌿 ผลการวิเคราะห์เป็นเพียงการคัดกรองเบื้องต้น ไม่ใช่คำตัดสินสุดท้าย
          โปรดตรวจสอบกับแหล่งข่าวทางการเสมอ
        </footer>
      </body>
    </html>
  );
}
