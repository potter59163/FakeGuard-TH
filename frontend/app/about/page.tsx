export default function AboutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">เกี่ยวกับโครงงาน</h1>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">FakeGuard-TH คืออะไร</h2>
        <p className="mt-2 leading-relaxed text-slate-600">
          ต้นแบบระบบตรวจสอบความน่าเชื่อถือของข้อมูลภาษาไทยอัตโนมัติ
          ส่วนหนึ่งของโครงงาน &ldquo;การเปรียบเทียบประสิทธิภาพของ WangchanBERTa,
          Support Vector Machine และ Random Forest
          ในการตรวจจับข่าวปลอมภาษาไทยบนโซเชียลมีเดีย&rdquo;
          เสนอต่อโครงการพัฒนาอัจฉริยภาพทางวิทยาศาสตร์และเทคโนโลยีสำหรับเด็กและเยาวชน
          (JSTP) รุ่นที่ 29
        </p>
        <ul className="mt-4 space-y-1 text-sm text-slate-600">
          <li>
            <span className="font-medium">ผู้พัฒนา:</span> นายปริพัฒน์ รอดหยู่
            โรงเรียนสวนกุหลาบวิทยาลัย
          </li>
          <li>
            <span className="font-medium">อาจารย์ที่ปรึกษา:</span> ครูนิภารัตน์
            รูปไข่ กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">ข้อมูลที่ใช้ฝึกสอน</h2>
        <p className="mt-2 leading-relaxed text-slate-600">
          ข้อความข่าว 1,000 ข้อความ (ข่าวจริง 500 : ข่าวปลอม 500)
          จากพอร์ทัลข้อมูลเปิดของศูนย์ต่อต้านข่าวปลอม (Anti-Fake News Center)
          กระทรวงดิจิทัลเพื่อเศรษฐกิจและสังคม ช่วงปี พ.ศ. 2563–2567
          ผ่านการทำความสะอาดข้อมูลและตัดคำเฉลย (เช่น &ldquo;ข่าวปลอม
          อย่าแชร์!&rdquo;) ออกเพื่อป้องกัน data leakage
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">การใช้ปัญญาประดิษฐ์ (AI) ในโครงงาน</h2>
        <p className="mt-2 leading-relaxed text-slate-600">
          โครงงานนี้ใช้ AI (Claude) ช่วยในการ (1)
          ค้นหาและสรุปงานวิจัยที่เกี่ยวข้อง (2)
          ตรวจสอบความถูกต้องของภาษาและการเรียบเรียงเนื้อหา และ (3)
          ช่วยเขียนโค้ด โดยผู้พัฒนาเป็นผู้ออกแบบระเบียบวิธีวิจัย ตรวจสอบ
          และเข้าใจการทำงานของทุกส่วน
        </p>
      </section>

      <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-800">ข้อจำกัดสำคัญ</h2>
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
