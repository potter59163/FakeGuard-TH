import {
  AlertTriangleIcon,
  BookIcon,
  CpuIcon,
  InfoIcon,
  SearchIcon,
  UserIcon,
} from "@/components/icons";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-100 text-red-600">
          <InfoIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-red-800">
          เกี่ยวกับโครงงาน
        </h1>
      </section>

      <section className="rounded-3xl border-2 border-red-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-red-800">
          <SearchIcon className="h-5 w-5" />
          FakeGuard-TH คืออะไร
        </h2>
        <p className="mt-2 leading-relaxed text-stone-600">
          ต้นแบบระบบตรวจสอบความน่าเชื่อถือของข้อมูลภาษาไทยอัตโนมัติ
          ส่วนหนึ่งของโครงงาน &ldquo;การเปรียบเทียบประสิทธิภาพของ WangchanBERTa,
          Support Vector Machine และ Random Forest
          ในการตรวจจับข่าวปลอมภาษาไทยบนโซเชียลมีเดีย&rdquo;
          เสนอต่อโครงการพัฒนาอัจฉริยภาพทางวิทยาศาสตร์และเทคโนโลยีสำหรับเด็กและเยาวชน
          (JSTP) รุ่นที่ 29
        </p>
        <ul className="mt-4 space-y-2 text-sm text-stone-600">
          <li className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 shrink-0 text-red-500" />
            <span>
              <span className="font-medium">ผู้พัฒนา:</span> นายปริพัฒน์ รอดหยู่
              โรงเรียนสวนกุหลาบวิทยาลัย
            </span>
          </li>
          <li className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 shrink-0 text-red-500" />
            <span>
              <span className="font-medium">อาจารย์ที่ปรึกษา:</span> ครูนิภารัตน์
              รูปไข่ กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี
            </span>
          </li>
        </ul>
      </section>

      <section className="rounded-3xl border-2 border-red-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-red-800">
          <BookIcon className="h-5 w-5" />
          ข้อมูลที่ใช้ฝึกสอน
        </h2>
        <p className="mt-2 leading-relaxed text-stone-600">
          ข้อความข่าว 1,000 ข้อความ (ข่าวจริง 500 : ข่าวปลอม 500)
          จากพอร์ทัลข้อมูลเปิดของศูนย์ต่อต้านข่าวปลอม (Anti-Fake News Center)
          กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม ช่วงปี พ.ศ. 2563–2567
          ผ่านการทำความสะอาดข้อมูลและตัดคำเฉลย (เช่น &ldquo;ข่าวปลอม
          อย่าแชร์!&rdquo;) ออกเพื่อป้องกัน data leakage
        </p>
      </section>

      <section className="rounded-3xl border-2 border-red-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-red-800">
          <CpuIcon className="h-5 w-5" />
          การใช้ปัญญาประดิษฐ์ (AI) ในโครงงาน
        </h2>
        <p className="mt-2 leading-relaxed text-stone-600">
          โครงงานนี้ใช้ AI (Claude) ช่วยในการ (1)
          ค้นหาและสรุปงานวิจัยที่เกี่ยวข้อง (2)
          ตรวจสอบความถูกต้องของภาษาและการเรียบเรียงเนื้อหา และ (3) ช่วยเขียนโค้ด
          โดยผู้พัฒนาเป็นผู้ออกแบบระเบียบวิธีวิจัย ตรวจสอบ
          และเข้าใจการทำงานของทุกส่วน
        </p>
      </section>

      <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-800">
          <AlertTriangleIcon className="h-5 w-5" />
          ข้อจำกัดสำคัญ
        </h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-amber-800">
          <li>
            ผลการวิเคราะห์มาจาก &ldquo;รูปแบบภาษา&rdquo; ของข้อความเท่านั้น
            ระบบไม่ได้ตรวจสอบข้อเท็จจริงกับแหล่งข้อมูลจริง
          </li>
          <li>
            ข้อมูลฝึกสอนเป็นหัวข้อข่าวสั้นจาก AFNC
            ข้อความประเภทอื่นอาจได้ผลคลาดเคลื่อน
          </li>
          <li>
            ใช้เป็นเครื่องมือคัดกรองเบื้องต้นเท่านั้น ไม่ใช่คำตัดสินสุดท้าย
            โปรดตรวจสอบกับ antifakenewscenter.com หรือแหล่งข่าวทางการเสมอ
          </li>
        </ul>
      </section>
    </div>
  );
}
