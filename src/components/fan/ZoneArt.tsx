/* -------------------------------------------------------------------------- */
/*  لوحة منطقة المشجعين                                                         */
/*                                                                             */
/*  أُعيد رسمها. الأولى كانت شاشةً رماديةً ميتة أمام دوائر كبيرة تمثّل الحشد —      */
/*  فبدت صورةً معطوبة لا لوحة. ثلاثة أشياء تغيّرت:                                */
/*                                                                             */
/*  الشاشة تضيء فعلاً وتُلقي ضوءها على من أمامها، فهي مصدر الضوء في المشهد لا     */
/*  مستطيل فيه. والحشد صار صفوفاً متدرّجة الحجم والعتمة — الأبعد أصغر وأخفت —     */
/*  فيُقرأ عمقاً لا زخرفة. والخلفية تختلف بالمدينة، وهي ما يميّز منطقة عن أخرى.    */
/* -------------------------------------------------------------------------- */

export type ZoneBackdrop = "city" | "sea" | "mountains" | "line" | "park";

export interface ZoneScene {
  zoneId: string;
  sky: [string, string];
  glow: string;
  backdrop: ZoneBackdrop;
  /** لون ضوء الشاشة الذي ينسكب على الحشد */
  screen: string;
}

export const ZONE_SCENES: ZoneScene[] = [
  { zoneId: "FZ-01", sky: ["#0b0f24", "#443a66"], glow: "#c9a961", backdrop: "city", screen: "#ffe6ad" },
  { zoneId: "FZ-02", sky: ["#04121f", "#1f6b76"], glow: "#5fd2c8", backdrop: "sea", screen: "#c9f6ff" },
  { zoneId: "FZ-03", sky: ["#06121c", "#2f6a70"], glow: "#63b6c9", backdrop: "sea", screen: "#d6f2ff" },
  { zoneId: "FZ-04", sky: ["#080f14", "#3f6a4c"], glow: "#8fd08a", backdrop: "mountains", screen: "#e2ffd9" },
  { zoneId: "FZ-05", sky: ["#050a16", "#2b4f7a"], glow: "#6ea8ff", backdrop: "line", screen: "#dbe9ff" },
  { zoneId: "FZ-06", sky: ["#0b0715", "#6d3352"], glow: "#d8748f", backdrop: "city", screen: "#ffd4e4" },
];

export const zoneSceneFor = (zoneId: string, index: number): ZoneScene =>
  ZONE_SCENES.find((s) => s.zoneId === zoneId) ?? ZONE_SCENES[index % ZONE_SCENES.length];

const r2 = (n: number) => Math.round(n * 100) / 100;

/*
 * صفوف الحشد.
 *
 * كل صف أقرب من سابقه: أكبر حجماً، وأدكن، وأكثر تباعداً. الإزاحة مكتوبة لا
 * عشوائية كي لا يختلف الخادم عن المتصفح، ومختلفة بين الصفوف كي لا تصطفّ
 * الرؤوس في أعمدة فتبدو مشطاً لا ناساً.
 */
const ROWS = [
  { y: 236, r: 3.4, gap: 21, offset: 0, opacity: 0.34 },
  { y: 250, r: 4.2, gap: 25, offset: 11, opacity: 0.46 },
  { y: 266, r: 5.2, gap: 30, offset: 4, opacity: 0.6 },
  { y: 286, r: 6.4, gap: 36, offset: 19, opacity: 0.76 },
  { y: 310, r: 8, gap: 44, offset: 8, opacity: 0.92 },
];

function Crowd({ color }: { color: string }) {
  return (
    <g fill={color}>
      {ROWS.map((row) => {
        const count = Math.ceil(860 / row.gap);
        return (
          <g key={row.y} opacity={row.opacity}>
            {Array.from({ length: count }, (_, i) => {
              const x = r2(-30 + row.offset + i * row.gap);
              return (
                <g key={x}>
                  <circle cx={x} cy={row.y} r={row.r} />
                  {/* الكتفان قوس لا مثلّث: المثلّث يبدو مخروطاً */}
                  <path
                    d={`M ${r2(x - row.r * 1.5)} ${r2(row.y + row.r * 3.4)}
                        a ${r2(row.r * 1.5)} ${r2(row.r * 2)} 0 0 1 ${r2(row.r * 3)} 0 Z`}
                  />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

function Backdrop({ form, color }: { form: ZoneBackdrop; color: string }) {
  if (form === "sea") {
    return (
      <g>
        <rect y="176" width="800" height="60" fill={color} opacity="0.4" />
        {[186, 200, 214].map((y, i) => (
          <path
            key={y}
            d={`M-20 ${y} Q 150 ${y - 4} 320 ${y} T 660 ${y} T 860 ${y}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            opacity={0.14 - i * 0.035}
          />
        ))}
      </g>
    );
  }

  if (form === "mountains") {
    return (
      <g fill={color}>
        <path d="M-20 214 L110 96 L200 168 L290 118 L400 214 Z" opacity="0.42" />
        <path d="M330 214 L470 128 L560 180 L680 104 L860 214 Z" opacity="0.32" />
      </g>
    );
  }

  if (form === "line") {
    return (
      <g>
        <rect x="-20" y="46" width="840" height="170" fill={color} opacity="0.45" />
        {Array.from({ length: 22 }, (_, i) => (
          <line
            key={i}
            x1={r2(-20 + i * 40)}
            y1="46"
            x2={r2(-20 + i * 40)}
            y2="216"
            stroke="#ffffff"
            strokeWidth={i % 4 === 0 ? 1.1 : 0.5}
            opacity={i % 4 === 0 ? 0.14 : 0.06}
          />
        ))}
      </g>
    );
  }

  if (form === "park") {
    return (
      <g fill={color} opacity="0.42">
        {[60, 150, 250, 560, 660, 750].map((x) => (
          <g key={x}>
            <rect x={x} y="164" width="5" height="52" />
            <circle cx={x + 2.5} cy="158" r="22" />
          </g>
        ))}
      </g>
    );
  }

  const towers: [number, number, number][] = [
    [20, 112, 38],
    [70, 150, 30],
    [112, 84, 26],
    [152, 138, 36],
    [630, 130, 32],
    [674, 92, 24],
    [710, 148, 40],
    [762, 110, 28],
  ];
  return (
    <g fill={color} opacity="0.42">
      {towers.map(([x, y, w]) => (
        <rect key={x} x={x} y={y} width={w} height={r2(216 - y)} />
      ))}
    </g>
  );
}

export default function ZoneArt({
  scene,
  uid,
  className,
}: {
  scene: ZoneScene;
  uid: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 800 340"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`zsky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.sky[0]} />
          <stop offset="100%" stopColor={scene.sky[1]} />
        </linearGradient>

        <radialGradient id={`zglow-${uid}`} cx="50%" cy="34%" r="52%">
          <stop offset="0%" stopColor={scene.glow} stopOpacity="0.4" />
          <stop offset="100%" stopColor={scene.glow} stopOpacity="0" />
        </radialGradient>

        {/* الشاشة مضيئة من مركزها: الصورة المعروضة ضوء لا سطح مصمت */}
        <radialGradient id={`zscreen-${uid}`} cx="50%" cy="45%" r="62%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor={scene.screen} />
          <stop offset="100%" stopColor={scene.screen} stopOpacity="0.55" />
        </radialGradient>

        <linearGradient id={`zbeam-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.screen} stopOpacity="0.34" />
          <stop offset="100%" stopColor={scene.screen} stopOpacity="0" />
        </linearGradient>

        {/* عتمة عند الأسفل تُجلس المشهد بدل أن ينتهي بقطع حادّ */}
        <linearGradient id={`zfloor-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.sky[0]} stopOpacity="0" />
          <stop offset="100%" stopColor={scene.sky[0]} stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <rect width="800" height="340" fill={`url(#zsky-${uid})`} />
      <Backdrop form={scene.backdrop} color={scene.sky[0]} />
      <ellipse cx="400" cy="130" rx="380" ry="150" fill={`url(#zglow-${uid})`} />

      {/* الشاشة وحواملها */}
      <g>
        <rect x="252" y="52" width="296" height="130" rx="7" fill={scene.sky[0]} opacity="0.92" />
        <rect x="259" y="59" width="282" height="116" rx="4" fill={`url(#zscreen-${uid})`} />
        <rect x="298" y="182" width="14" height="40" fill={scene.sky[0]} opacity="0.9" />
        <rect x="488" y="182" width="14" height="40" fill={scene.sky[0]} opacity="0.9" />
      </g>

      {/* الضوء المنسكب — يمرّ فوق الحشد فيوحّد المشهد */}
      <path d="M259 175 L541 175 L700 340 L100 340 Z" fill={`url(#zbeam-${uid})`} />

      <Crowd color={scene.sky[0]} />

      <rect y="250" width="800" height="90" fill={`url(#zfloor-${uid})`} />
    </svg>
  );
}
