/* -------------------------------------------------------------------------- */
/*  خريطة المملكة                                                              */
/*                                                                             */
/*  مرسومة لا مبلّطة: خريطة ببلاطات تحتاج شبكة ومزوّداً خارجياً، وقد بنينا هذا     */
/*  المشروع ليكتب المشجّع بلاغه والشبكة ساقطة. الغرض هنا التوجيه لا الملاحة —     */
/*  «أين تقع هذه المدينة من المملكة» — والملاحة الحقيقية بزرّ يفتح خرائط الجهاز.  */
/*                                                                             */
/*  الحدود مبسّطة عمداً: شكل يُعرَف لا مرجع جغرافي.                                */
/* -------------------------------------------------------------------------- */

/** حدود الإطار بالدرجات */
const WEST = 34.0;
const EAST = 56.0;
const NORTH = 33.0;
const SOUTH = 15.5;

const W = 440;
const H = 380;

const r2 = (n: number) => Math.round(n * 100) / 100;

export const project = (lat: number, lng: number) => ({
  x: r2(((lng - WEST) / (EAST - WEST)) * W),
  y: r2(((NORTH - lat) / (NORTH - SOUTH)) * H),
});

/* الحدود مسرودة بالدرجات ثم تُسقط، فتبقى قابلة للتعديل بلا حساب يدوي */
const OUTLINE: [number, number][] = [
  [29.35, 34.95],
  [29.2, 36.0],
  [30.0, 37.0],
  [31.0, 37.2],
  [31.6, 38.0],
  [32.15, 39.3],
  [31.5, 40.0],
  [31.0, 41.0],
  [30.4, 41.9],
  [29.8, 43.0],
  [29.2, 44.6],
  [28.55, 46.55],
  [28.54, 48.42],
  [28.0, 48.7],
  [27.0, 49.6],
  [26.6, 50.15],
  [25.6, 50.2],
  [24.7, 50.85],
  [24.1, 51.6],
  [22.9, 52.6],
  [22.6, 55.2],
  [21.0, 55.2],
  [20.0, 55.0],
  [19.0, 52.0],
  [18.2, 49.0],
  [17.6, 47.5],
  [17.3, 46.0],
  [17.4, 44.5],
  [17.0, 43.5],
  [16.4, 42.9],
  [16.9, 42.6],
  [17.9, 41.9],
  [19.1, 41.05],
  [20.1, 40.1],
  [21.5, 39.15],
  [23.0, 38.8],
  [24.1, 38.05],
  [25.0, 37.2],
  [26.1, 36.5],
  [27.3, 35.7],
  [28.0, 34.8],
];

export const OUTLINE_PATH = `M ${OUTLINE.map(([lat, lng]) => {
  const p = project(lat, lng);
  return `${p.x} ${p.y}`;
}).join(" L ")} Z`;

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  active?: boolean;
}

export default function SaudiMap({
  points,
  uid,
  className,
}: {
  points: MapPoint[];
  uid: string;
  className?: string;
}) {
  const active = points.find((p) => p.active);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={active?.label ?? ""}>
      <defs>
        <radialGradient id={`pin-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d={OUTLINE_PATH}
        fill="var(--surface-3)"
        stroke="var(--line-strong)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {points.map((p) => {
        const { x, y } = project(p.lat, p.lng);
        if (p.active) return null;
        return (
          <g key={p.id}>
            <circle cx={x} cy={y} r="3" fill="var(--text-dim)" />
          </g>
        );
      })}

      {active &&
        (() => {
          const { x, y } = project(active.lat, active.lng);
          return (
            <g>
              <circle cx={x} cy={y} r="34" fill={`url(#pin-${uid})`} />
              <circle cx={x} cy={y} r="7" fill="var(--brand)" stroke="var(--surface)" strokeWidth="2.5" />
              <text
                x={x}
                y={r2(y - 16)}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="var(--text)"
                stroke="var(--surface)"
                strokeWidth="3.5"
                paintOrder="stroke"
              >
                {active.label}
              </text>
            </g>
          );
        })()}
    </svg>
  );
}
