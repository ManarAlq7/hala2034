"use client";

import { useMemo, useState } from "react";
import { timeSeries } from "@/lib/analytics";
import { clockTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import type { Report } from "@/lib/types";

interface Props {
  reports: Report[];
  now: number;
}

/**
 * اتجاه البلاغات عبر شرائح ١٥ دقيقة — SVG مباشر بلا مكتبة رسوم.
 * الجزء الأحمر من كل عمود هو البلاغات العالية والحرجة داخل الشريحة.
 */
export default function TrendChart({ reports, now }: Props) {
  const { t, isRtl } = useLocale();
  const buckets = useMemo(() => timeSeries(reports, now), [reports, now]);
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(1, ...buckets.map((b) => b.total));
  const totalRecent = buckets.reduce((a, b) => a + b.total, 0);

  // مقارنة آخر ساعة بالساعة التي قبلها — هذا ما يكشف حادثة تتصاعد
  const lastHour = buckets.slice(-4).reduce((a, b) => a + b.total, 0);
  const prevHour = buckets.slice(-8, -4).reduce((a, b) => a + b.total, 0);
  const delta =
    prevHour === 0 ? (lastHour > 0 ? 100 : 0) : Math.round(((lastHour - prevHour) / prevHour) * 100);

  const W = 100;
  const H = 34;
  const gap = 0.9;
  const barW = W / buckets.length - gap;

  return (
    <div className="card p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-text">{t("trend.title")}</h2>
          <p className="mt-0.5 text-[11px] text-text-dim">{t("trend.subtitle", { n: totalRecent })}</p>
        </div>
        <span
          className={`chip ${
            delta > 20 ? "chip-danger" : delta < -20 ? "chip-ok" : "chip-neutral"
          }`}
        >
          {t("trend.lastHour")}{" "}
          <span className="nums">
            {delta > 0 ? `+${delta}` : delta}
            {isRtl ? "٪" : "%"}
          </span>
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-24 w-full"
          role="img"
          aria-label={t("trend.aria")}
        >
          {buckets.map((b, i) => {
            const h = (b.total / max) * H;
            const uh = (b.urgent / max) * H;
            const x = i * (barW + gap);
            return (
              <g key={b.at} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {/* مساحة التقاط المؤشر تغطي كامل الارتفاع */}
                <rect x={x} y={0} width={barW + gap} height={H} fill="transparent" />
                <rect
                  x={x}
                  y={H - h}
                  width={barW}
                  height={h}
                  rx={0.6}
                  fill={hover === i ? "var(--brand)" : "var(--gold-dim)"}
                />
                <rect x={x} y={H - uh} width={barW} height={uh} rx={0.6} fill="var(--danger)" />
              </g>
            );
          })}
        </svg>

        {hover !== null && (
          <div
            className={`pointer-events-none absolute -top-1 rounded-lg border border-line-strong bg-surface-3 px-2 py-1 text-[11px] text-text shadow-lg ${
              isRtl ? "right-0" : "left-0"
            }`}
          >
            <span className="nums">{clockTime(buckets[hover].at)}</span> —{" "}
            <span className="nums">{buckets[hover].total}</span>
            {buckets[hover].urgent > 0 && (
              <>
                {" "}
                (<span className="nums">{buckets[hover].urgent}</span> {t("trend.urgentCount")})
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-text-dim">
        <span className="nums">{clockTime(buckets[0].at)}</span>
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: "var(--gold-dim)" }} />
            {t("trend.all")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: "var(--danger)" }} />
            {t("trend.urgent")}
          </span>
        </span>
        <span className="nums">{clockTime(buckets[buckets.length - 1].at)}</span>
      </div>
    </div>
  );
}
