import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  رأس صفحة الجمهور                                                           */
/*                                                                             */
/*  فاتح كبقية الموقع.                                                          */
/*                                                                             */
/*  كان مشهداً داكناً بملء العرض والنصّ فوقه، فوقعت الشاشة المرسومة على العنوان    */
/*  تماماً، ونافر الأسودُ صفحةً بيضاء من أولها إلى آخرها. الرسم لم يكن مصمّماً     */
/*  لأن يُمدّ خلف نصّ: هو لوحة بطاقة عرضها ثابت والشاشة في وسطها.                  */
/*                                                                             */
/*  الآن: الرأس نصّ على أرضية الموقع، واللوحة تحته في إطارها. لكلٍّ مساحته.        */
/* -------------------------------------------------------------------------- */

export interface HeroPill {
  label: string;
  /** النبرة: محايد افتراضاً، و`ok` لما هو مفتوح الآن */
  tone?: "neutral" | "ok" | "brand";
  nums?: boolean;
}

export default function PageHero({
  back,
  eyebrow,
  title,
  lead,
  pills = [],
}: {
  back?: { href: string; label: string };
  eyebrow?: string;
  title: string;
  lead?: string;
  pills?: HeroPill[];
}) {
  return (
    <section className="aura grid-lines border-b border-line">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
        {back && (
          <Link
            href={back.href}
            className="text-[12px] font-semibold text-text-muted underline underline-offset-4 transition hover:text-brand"
          >
            ← {back.label}
          </Link>
        )}

        {eyebrow && (
          <p className={`text-[11px] uppercase tracking-[0.16em] text-brand ${back ? "mt-5" : ""}`}>
            {eyebrow}
          </p>
        )}

        <h1 className="mt-1.5 max-w-3xl text-3xl font-bold leading-tight text-text sm:text-5xl">
          {title}
        </h1>

        {lead && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
            {lead}
          </p>
        )}

        {pills.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {pills.map((p) => (
              <span
                key={p.label}
                className={[
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold",
                  p.nums ? "nums" : "",
                  p.tone === "ok"
                    ? "border-ok/25 bg-ok-wash text-ok"
                    : p.tone === "brand"
                      ? "border-brand-dim bg-brand-wash text-brand"
                      : "border-line bg-surface text-text-muted",
                ].join(" ")}
              >
                {p.tone === "ok" && <span className="h-1.5 w-1.5 rounded-full bg-ok" />}
                {p.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
