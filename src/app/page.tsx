import Link from "next/link";
import { CATEGORIES, CHANNELS } from "@/lib/taxonomy";

const STEPS = [
  {
    icon: "📞",
    title: "استقبال البلاغ",
    body: "يستقبل النظام البلاغات عبر التطبيق، الموقع، المراكز الاستشارية، ووسائل التواصل الاجتماعي — نصاً أو صوتاً.",
  },
  {
    icon: "🧠",
    title: "فهم ومعالجة ذكية",
    body: "يفهم المحرك اللغة تلقائياً ويحدّد نوع المشكلة ودرجة خطورتها والموقع والوقت.",
  },
  {
    icon: "🧩",
    title: "تجميع ذكي",
    body: "يجمع البلاغات المتشابهة في مشكلة واحدة بناءً على المحتوى والموقع والزمن بدل تكرارها.",
  },
  {
    icon: "📊",
    title: "عرض وتحليل",
    body: "تظهر المشكلة على لوحة متابعة وخريطة حرارية مع مؤشرات الأولوية والتكرار.",
  },
  {
    icon: "✅",
    title: "اتخاذ إجراء ومتابعة",
    body: "تُحال المشكلة للجهة المختصة مع تتبّع الحالة حتى الإغلاق وإشعار مقدّم البلاغ.",
  },
];

const FEATURES = [
  "دعم متعدد اللغات مع كشف تلقائي للغة البلاغ",
  "تحويل الصوت إلى نص داخل المتصفح",
  "تصنيف ذكي للمشكلات وتجميع تلقائي للمتشابه",
  "خريطة حرارية تفاعلية لتحديد المواقع الساخنة",
  "لوحة متابعة للمشرفين مع بحث وتصفية",
  "تصعيد تلقائي للأولوية عند تكرار البلاغات",
  "سجل متابعة لكل مشكلة حتى الإغلاق",
];

const IMPACT = [
  { icon: "😊", text: "تحسين تجربة الجماهير وزيادة رضاهم" },
  { icon: "⏱", text: "استجابة أسرع وقرارات مبنية على بيانات حقيقية" },
  { icon: "⚙️", text: "رفع كفاءة العمليات وتقليل البلاغات المتكررة" },
  { icon: "🌍", text: "دعم رؤية 2030 في استضافة أحداث عالمية بمعايير ذكية" },
];

export default function Home() {
  return (
    <div>
      {/* ------------------------------- الواجهة ------------------------------- */}
      <section className="brand-gradient relative overflow-hidden text-white">
        <div className="brand-dots absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:py-20">
          <p className="mb-3 inline-block rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-gold-200 ring-1 ring-white/20">
            HALA 2034
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
            ذكاء تشغيلي لتجربة جماهير كأس العالم
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">
            يستقبل النظام ملاحظات الجماهير بلغات مختلفة (صوت أو نص)، ينظّمها ويجمع البلاغات
            المتشابهة في مشكلة واحدة تظهر للجهة المنظّمة على لوحة متابعة وخريطة حرارية — مما يساعد
            على اكتشاف المشكلات بسرعة أثناء الفعاليات الكبرى وتحسين تجربة الجماهير.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/report"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-brand-800 shadow-sm transition hover:bg-gold-200"
            >
              جرّب تقديم بلاغ
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl bg-white/12 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"
            >
              افتح لوحة المتابعة
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------ كيف يعمل ------------------------------ */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <SectionTitle>كيف يعمل النظام؟</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card relative p-5">
              <span className="nums absolute left-4 top-4 text-xs font-bold text-hairline">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl ring-1 ring-brand-100">
                {s.icon}
              </span>
              <h3 className="mb-1.5 font-bold text-ink">{s.title}</h3>
              <p className="text-xs leading-relaxed text-ink-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- القنوات والمزايا --------------------------- */}
      <section className="mx-auto max-w-7xl px-5 pb-14">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-6">
            <h3 className="mb-4 font-bold text-ink">القنوات المدعومة</h3>
            <ul className="divide-y divide-hairline">
              {CHANNELS.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-base ring-1 ring-brand-100">
                    {c.icon}
                  </span>
                  <span className="text-sm text-ink">{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 font-bold text-ink">الميزات الرئيسية</h3>
            <ul className="space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand-600 text-[10px] text-white">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 font-bold text-ink">الأثر المتوقع</h3>
            <ul className="space-y-3">
              {IMPACT.map((x) => (
                <li key={x.text} className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-base ring-1 ring-brand-100">
                    {x.icon}
                  </span>
                  <span className="text-sm leading-relaxed text-ink">{x.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ------------------------------ التصنيفات ------------------------------ */}
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <SectionTitle>أنواع المشكلات التي يتعرّف عليها النظام</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm text-ink ring-1 ring-hairline"
            >
              <span aria-hidden>{c.icon}</span>
              {c.label}
              <span className="text-[11px] text-ink-muted">— {c.owner}</span>
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <h2 className="text-xl font-bold text-ink sm:text-2xl">{children}</h2>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}
