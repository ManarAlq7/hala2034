"use client";

/* -------------------------------------------------------------------------- */
/*  توزيع بسيط بأشرطة أفقية                                                    */
/*                                                                             */
/*  الأشرطة الأفقية لا الدوائر: المقارنة بين الفئات هي السؤال، وطول الشريط      */
/*  يُقارَن بالعين مباشرةً بينما زوايا القطاعات لا تُقارَن. والتسمية بجانب        */
/*  الشريط لا في مفتاح منفصل، فلا يحتاج القارئ لمطابقة الألوان.                  */
/* -------------------------------------------------------------------------- */

export interface Slice {
  key: string;
  label: string;
  value: number;
  /** لون CSS صريح — يُستخدم حين يحمل الصنف دلالة (خطورة مثلاً) */
  color?: string;
}

export default function DistributionBars({
  slices,
  empty,
  max: providedMax,
}: {
  slices: Slice[];
  empty: string;
  max?: number;
}) {
  const shown = slices.filter((s) => s.value > 0).sort((a, b) => b.value - a.value);

  if (shown.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-text-dim">{empty}</p>;
  }

  const max = providedMax ?? Math.max(...shown.map((s) => s.value));
  const total = shown.reduce((a, s) => a + s.value, 0);

  return (
    <ul className="space-y-2.5 p-4">
      {shown.map((s) => (
        <li key={s.key}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-text-muted">{s.label}</span>
            <span className="nums shrink-0 font-bold text-text">
              {s.value}
              <span className="font-normal text-text-dim"> · {Math.round((s.value / total) * 100)}%</span>
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(3, (s.value / max) * 100)}%`,
                background: s.color ?? "var(--brand-strong)",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
