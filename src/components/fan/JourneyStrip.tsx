"use client";

import { IconAI, IconFan, IconFeedback, IconOps, PitchLines } from "@/components/art/Line";
import { useLocale } from "@/lib/i18n";
import type { StringKey } from "@/lib/strings";

/* -------------------------------------------------------------------------- */
/*  مسار المنصّة                                                                */
/*                                                                             */
/*  مشجّع ← بلاغ ← ذكاء ← عمليات.                                               */
/*                                                                             */
/*  هذا ما يفعله المشروع في سطر واحد، ولم يكن مرئياً في أي صفحة: الزائر يرى      */
/*  تذاكر ومناطق ونموذج بلاغ، ولا يرى أن بلاغه يُفهَم ويُجمَّع ويصل غرفة عمليات.    */
/*                                                                             */
/*  والرسوم هنا وظيفية لا زينة: كل خطوة أيقونة تقول ما تفعله الخطوة.            */
/* -------------------------------------------------------------------------- */

const STEPS: {
  key: string;
  title: StringKey;
  body: StringKey;
  Icon: (p: { className?: string; weight?: number }) => React.JSX.Element;
}[] = [
  { key: "fan", title: "jr.fanTitle", body: "jr.fanBody", Icon: IconFan },
  { key: "feedback", title: "jr.reportTitle", body: "jr.reportBody", Icon: IconFeedback },
  { key: "ai", title: "jr.aiTitle", body: "jr.aiBody", Icon: IconAI },
  { key: "ops", title: "jr.opsTitle", body: "jr.opsBody", Icon: IconOps },
];

export default function JourneyStrip() {
  const { t, isRtl } = useLocale();

  return (
    <section className="relative isolate overflow-hidden border-y border-line bg-surface">
      {/* خطوط الملعب في الخلفية، خافتة جداً — هوية لا زخرفة تُقرأ */}
      <PitchLines className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-40 -translate-y-1/2 text-brand opacity-[0.07]" />

      <div className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">{t("jr.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">{t("jr.subtitle")}</p>

        <ol className="mt-8 grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.key} className="relative">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand-dim bg-brand-wash text-brand">
                  <step.Icon className="h-6 w-6" />
                </span>
                <span className="nums text-[11px] font-bold text-text-dim">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-3 text-[15px] font-bold text-text">{t(step.title)}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">{t(step.body)}</p>

              {/* سهم الوصل بين الخطوات — يختفي عند آخرها وعلى الشاشات الضيّقة */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -top-1 hidden text-lg text-line-strong lg:block"
                  style={isRtl ? { insetInlineStart: "-1.1rem" } : { insetInlineEnd: "-1.1rem" }}
                >
                  {isRtl ? "←" : "→"}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
