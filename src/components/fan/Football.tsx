/* -------------------------------------------------------------------------- */
/*  الكرة                                                                      */
/*                                                                             */
/*  أبسط ما يُقرأ كرةً: دائرة، وخماسي في وسطها، وخمسة دروز تخرج من رؤوسه         */
/*  وتتوقّف قبل الحافّة.                                                          */
/*                                                                             */
/*  النسخة الأولى رسمت النمط كاملاً — خماسيات على الحافّة ودروز تصل بينها —      */
/*  فصارت مشغولة، والعين لا تحتاج ذلك كلّه لتعرف أنها كرة. الرسم هنا علامة       */
/*  لا صورة.                                                                    */
/*                                                                             */
/*  والإحداثيات محسوبة ومقرّبة، فلا يختلف ما يرسمه الخادم عمّا يرسمه المتصفح.     */
/* -------------------------------------------------------------------------- */

const R = 100;
const rad = (deg: number) => (deg * Math.PI) / 180;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** رؤوس الخماسي: رأسٌ إلى الأعلى */
const VERTICES = [-90, -18, 54, 126, 198];

/** نصف قطر الخماسي الأوسط */
const PR = 40;

const CENTRE = `M ${VERTICES.map((a) => {
  const r = rad(a);
  return `${r2(PR * Math.cos(r))} ${r2(PR * Math.sin(r))}`;
}).join(" L ")} Z`;

/** الدرز يخرج من الرأس ويتوقّف قبل الحافّة — التوقّف هو ما يبقيه بسيطاً لا شبكة */
const SEAMS = VERTICES.map((a) => {
  const r = rad(a);
  return {
    a,
    x1: r2(PR * Math.cos(r)),
    y1: r2(PR * Math.sin(r)),
    x2: r2(84 * Math.cos(r)),
    y2: r2(84 * Math.sin(r)),
  };
});

export default function Football({
  uid,
  className,
  /** لون البقعة — الافتراضي لون النصّ المحيط */
  patch = "currentColor",
  seam = "currentColor",
  spin = false,
}: {
  uid?: string;
  className?: string;
  patch?: string;
  seam?: string;
  spin?: boolean;
}) {
  return (
    <svg
      viewBox="-110 -110 220 220"
      className={`${className ?? ""} ${spin ? "ball-spin" : ""}`}
      aria-hidden="true"
      data-ball={uid}
    >
      <circle r={R} fill="none" stroke={seam} strokeWidth="6" />

      <g stroke={seam} strokeWidth="6" strokeLinecap="round">
        {SEAMS.map((s) => (
          <line key={s.a} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
        ))}
      </g>

      <path d={CENTRE} fill={patch} />
    </svg>
  );
}
