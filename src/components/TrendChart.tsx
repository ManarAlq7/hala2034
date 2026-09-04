"use client";

import { useMemo, useState } from "react";
import { timeSeries } from "@/lib/analytics";
import { clockTime } from "@/lib/format";
import type { Report } from "@/lib/types";

interface Props {
  reports: Report[];
  now: number;
}

/**
 * اتجاه البلاغات عبر شرائح ١٥ دقيقة — مرسوم بـ SVG مباشرة دون مكتبة رسوم.
 * الأعمدة الداكنة هي البلاغات العالية والحرجة داخل كل شريحة.
 */
export default function TrendChart({ reports, now }: Props) {
  const buckets = useMemo(() => timeSeries(reports, now), [reports, now]);
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(1, ...buckets.map((b) => b.total));
  const totalRecent = buckets.reduce((a, b) => a + b.total, 0);

  // مقارنة آخر ساعة بالساعة التي قبلها لبيان الاتجاه
  const lastHour = buckets.slice(-4).reduce((a, b) => a + b.total, 0);
  const prevHour = buckets.slice(-8, -4).reduce((a, b) => a + b.total, 0);
  const delta = prevHour === 0 ? (lastHour > 0 ? 100 : 0) : Math.round(((lastHour - prevHour) / prevHour) * 100);

  const W = 100;
  const H = 34;
  const gap = 0.9;
  const barW = W / buckets.length - gap;

  return (
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-bold text-ink">اتجاه البلاغات</h2>
          <p className="text-xs text-ink-muted">
            <span className="nums">{totalRecent}</span> بلاغاً خلال آخر ٦ ساعات، بشرائح ١٥ دقيقة
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
            delta > 20
              ? "bg-red-50 text-red-700 ring-red-200"
              : delta < -20
                ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                : "bg-slate-50 text-slate-600 ring-slate-200"
          }`}
        >
          آخر ساعة <span className="nums">{delta > 0 ? `+${delta}` : delta}</span>٪
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-28 w-full"
          role="img"
          aria-label="رسم بياني لعدد البلاغات عبر الوقت"
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
                  className={hover === i ? "fill-brand-600" : "fill-brand-500/45"}
                />
                <rect x={x} y={H - uh} width={barW} height={uh} rx={0.6} className="fill-red-500/80" />
              </g>
            );
          })}
        </svg>

        {hover !== null && (
          <div className="pointer-events-none absolute -top-1 right-0 rounded-lg bg-ink px-2 py-1 text-[11px] text-white shadow-lg">
            <span className="nums">{clockTime(buckets[hover].at)}</span> —{" "}
            <span className="nums">{buckets[hover].total}</span> بلاغ
            {buckets[hover].urgent > 0 && (
              <>
                {" "}
                (<span className="nums">{buckets[hover].urgent}</span> عاجل)
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
        <span className="nums">{clockTime(buckets[0].at)}</span>
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-brand-500/45" />
            كل البلاغات
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-red-500/80" />
            عالي وحرج
          </span>
        </span>
        <span className="nums">{clockTime(buckets[buckets.length - 1].at)}</span>
      </div>
    </div>
  );
}
