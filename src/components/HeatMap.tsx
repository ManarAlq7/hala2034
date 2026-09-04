"use client";

import { ZONES } from "@/lib/taxonomy";

interface Props {
  heat: Record<string, number>;
  counts: Record<string, number>;
  selected: string | null;
  onSelect: (zoneId: string | null) => void;
}

/** لون النقطة بحسب شدّة الكثافة */
function heatColor(v: number): string {
  if (v >= 0.75) return "rgb(220 38 38)";
  if (v >= 0.5) return "rgb(234 88 12)";
  if (v >= 0.28) return "rgb(217 149 24)";
  if (v > 0) return "rgb(31 133 88)";
  return "rgb(148 163 184)";
}

export default function HeatMap({ heat, counts, selected, onSelect }: Props) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-ink">الخريطة الحرارية للمواقع</h2>
          <p className="text-xs text-ink-muted">حجم النقطة ولونها يعكسان كثافة البلاغات وخطورتها</p>
        </div>
        {selected && (
          <button
            onClick={() => onSelect(null)}
            className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
          >
            إلغاء تحديد الموقع
          </button>
        )}
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-50 to-white ring-1 ring-hairline sm:aspect-[16/10]">
        {/* مخطط مبسّط للاستاد */}
        <div className="absolute inset-[14%] rounded-[36%] border-2 border-dashed border-brand-100" />
        <div className="absolute left-1/2 top-1/2 h-[26%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-brand-100 bg-brand-50/60">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-brand-100" />
          <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-100" />
        </div>

        {ZONES.map((z) => {
          const v = heat[z.id] ?? 0;
          const n = counts[z.id] ?? 0;
          const size = 26 + v * 42;
          const isSel = selected === z.id;
          const color = heatColor(v);
          return (
            <button
              key={z.id}
              onClick={() => onSelect(isSel ? null : z.id)}
              style={{ right: `${z.x}%`, top: `${z.y}%` }}
              className="group absolute -translate-y-1/2 translate-x-1/2 focus:outline-none"
              aria-label={`${z.label} — ${n} بلاغ`}
              aria-pressed={isSel}
            >
              <span
                className="relative grid place-items-center rounded-full text-[11px] font-bold text-white shadow-md transition group-hover:scale-110"
                style={{
                  width: size,
                  height: size,
                  background: color,
                  boxShadow: isSel ? `0 0 0 4px rgba(14,90,60,.25)` : undefined,
                }}
              >
                {v >= 0.6 && (
                  <span className="pulse-ring absolute inset-0 rounded-full" style={{ color }} />
                )}
                <span className="nums relative">{n}</span>
              </span>
              <span
                className={`mt-1 block whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition ${
                  isSel ? "bg-brand-700 text-white" : "bg-white/85 text-ink-muted"
                }`}
              >
                {z.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
        <span className="font-semibold text-ink">شدة الكثافة:</span>
        {[
          { c: "rgb(148 163 184)", l: "لا يوجد" },
          { c: "rgb(31 133 88)", l: "منخفضة" },
          { c: "rgb(217 149 24)", l: "متوسطة" },
          { c: "rgb(234 88 12)", l: "عالية" },
          { c: "rgb(220 38 38)", l: "حرجة" },
        ].map((x) => (
          <span key={x.l} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.c }} />
            {x.l}
          </span>
        ))}
      </div>
    </div>
  );
}
