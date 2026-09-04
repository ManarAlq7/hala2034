"use client";

import { ZONES, zoneLabel } from "@/lib/taxonomy";
import { useLocale } from "@/lib/i18n";

interface Props {
  heat: Record<string, number>;
  counts: Record<string, number>;
  selected: string | null;
  onSelect: (zoneId: string | null) => void;
  /** نسخة مصغّرة للنظرة العامة — بلا مفتاح ألوان ولا عنوان */
  bare?: boolean;
}

/** لون النقطة بحسب شدّة الكثافة — نفس سلّم ألوان درجات الخطورة */
function heatColor(v: number): string {
  if (v >= 0.75) return "var(--danger)";
  if (v >= 0.5) return "var(--warn)";
  if (v >= 0.28) return "var(--info)";
  if (v > 0) return "var(--brand)";
  return "var(--line-strong)";
}

const LEGEND = [
  { c: "var(--line-strong)", k: "heat.none" },
  { c: "var(--brand)", k: "heat.low" },
  { c: "var(--info)", k: "heat.medium" },
  { c: "var(--warn)", k: "heat.high" },
  { c: "var(--danger)", k: "heat.critical" },
] as const;

export default function HeatMap({ heat, counts, selected, onSelect, bare = false }: Props) {
  const { t, locale } = useLocale();

  return (
    <div className={bare ? "" : "card p-4"}>
      {!bare && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-text">{t("heat.title")}</h2>
            <p className="mt-0.5 text-[11px] text-text-dim">{t("heat.subtitle")}</p>
          </div>
          {selected && (
            <button onClick={() => onSelect(null)} className="btn btn-ghost btn-sm">
              {t("heat.clear")}
            </button>
          )}
        </div>
      )}

      <div className="grid-lines relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-surface-2 sm:aspect-[16/10]">
        {/* مخطط مبسّط للاستاد */}
        <div className="absolute inset-[14%] rounded-[36%] border border-dashed border-line-strong" />
        <div className="absolute left-1/2 top-1/2 h-[26%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line-strong">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-line-strong" />
          <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-strong" />
        </div>

        {ZONES.map((z) => {
          const v = heat[z.id] ?? 0;
          const n = counts[z.id] ?? 0;
          const size = 24 + v * 40;
          const isSel = selected === z.id;
          const color = heatColor(v);
          const label = zoneLabel(z.id, locale);
          return (
            <button
              key={z.id}
              onClick={() => onSelect(isSel ? null : z.id)}
              style={{ right: `${z.x}%`, top: `${z.y}%` }}
              className="group absolute -translate-y-1/2 translate-x-1/2 focus:outline-none"
              aria-label={`${label} — ${n}`}
              aria-pressed={isSel}
            >
              <span
                className="relative grid place-items-center rounded-full text-[11px] font-bold text-[#04120c] transition group-hover:scale-110"
                style={{
                  width: size,
                  height: size,
                  background: color,
                  boxShadow: isSel ? "0 0 0 4px rgba(47,191,126,.28)" : undefined,
                }}
              >
                {v >= 0.6 && (
                  <span className="pulse-ring absolute inset-0 rounded-full" style={{ color }} />
                )}
                <span className="nums relative">{n}</span>
              </span>
              <span
                className={`mt-1 block whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold transition ${
                  isSel ? "bg-brand-strong text-[#04120c]" : "bg-surface/85 text-text-muted"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {!bare && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-text-dim">
          <span className="font-semibold text-text-muted">{t("heat.legend")}</span>
          {LEGEND.map((x) => (
            <span key={x.k} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.c }} />
              {t(x.k)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
