/* -------------------------------------------------------------------------- */
/*  لوحة منطقة المشجعين                                                         */
/*                                                                             */
/*  المنطقة ليست ملعباً: لا حوض ولا مدرّجات، بل شاشة كبيرة وناس واقفون أمامها     */
/*  في الهواء الطلق. والفرق بين منطقة وأخرى في الخلفية لا في الشاشة — بحر جدة،   */
/*  وجبال أبها، وأبراج الرياض، وكتلة نيوم المرآتية.                              */
/*                                                                             */
/*  حتميّ ومقرّب كرسم الملاعب: لا عشوائية ولا وقت، فلا يختلف الخادم عن المتصفح.   */
/* -------------------------------------------------------------------------- */

export type ZoneBackdrop = "city" | "sea" | "mountains" | "line" | "park";

export interface ZoneScene {
  zoneId: string;
  sky: [string, string];
  glow: string;
  backdrop: ZoneBackdrop;
  /** لون ضوء الشاشة على الحشد */
  screen: string;
}

export const ZONE_SCENES: ZoneScene[] = [
  { zoneId: "FZ-01", sky: ["#0a0d20", "#3b3160"], glow: "#c9a961", backdrop: "city", screen: "#ffe6ad" },
  { zoneId: "FZ-02", sky: ["#04121f", "#1f6b76"], glow: "#5fd2c8", backdrop: "sea", screen: "#c9f6ff" },
  { zoneId: "FZ-03", sky: ["#06121c", "#2f6a70"], glow: "#63b6c9", backdrop: "sea", screen: "#d6f2ff" },
  { zoneId: "FZ-04", sky: ["#080f14", "#4a6b52"], glow: "#8fd08a", backdrop: "mountains", screen: "#e2ffd9" },
  { zoneId: "FZ-05", sky: ["#050a16", "#2b4f7a"], glow: "#6ea8ff", backdrop: "line", screen: "#dbe9ff" },
  { zoneId: "FZ-06", sky: ["#0b0715", "#6d3352"], glow: "#d8748f", backdrop: "city", screen: "#ffd4e4" },
];

export const zoneSceneFor = (zoneId: string, index: number): ZoneScene =>
  ZONE_SCENES.find((s) => s.zoneId === zoneId) ?? ZONE_SCENES[index % ZONE_SCENES.length];

const r2 = (n: number) => Math.round(n * 100) / 100;

/* صفوف الحشد: مواضع مكتوبة لا محسوبة عشوائياً */
const CROWD: number[][] = [
  [40, 96, 150, 208, 262, 318, 372, 430, 486, 540, 596, 652, 706, 762],
  [16, 70, 128, 182, 238, 292, 350, 404, 462, 516, 572, 628, 684, 740, 792],
  [56, 112, 168, 224, 280, 336, 392, 448, 504, 560, 616, 672, 728, 784],
];

function Backdrop({ form, color }: { form: ZoneBackdrop; color: string }) {
  if (form === "sea") {
    return (
      <g>
        <rect y="212" width="800" height="70" fill={color} opacity="0.45" />
        {[224, 244, 264].map((y, i) => (
          <path
            key={y}
            d={`M-20 ${y} Q 150 ${y - 5} 320 ${y} T 660 ${y} T 860 ${y}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1"
            opacity={0.16 - i * 0.04}
          />
        ))}
      </g>
    );
  }

  if (form === "mountains") {
    return (
      <g fill={color} opacity="0.5">
        <path d="M-20 250 L110 120 L200 200 L290 140 L400 250 Z" />
        <path d="M420 250 L520 160 L600 215 L700 130 L840 250 Z" />
      </g>
    );
  }

  if (form === "line") {
    return (
      <g>
        <rect x="-20" y="40" width="840" height="200" fill={color} opacity="0.55" />
        {Array.from({ length: 22 }, (_, i) => (
          <line
            key={i}
            x1={r2(-20 + i * 40)}
            y1="40"
            x2={r2(-20 + i * 40)}
            y2="240"
            stroke="#ffffff"
            strokeWidth={i % 4 === 0 ? 1.2 : 0.5}
            opacity={i % 4 === 0 ? 0.16 : 0.07}
          />
        ))}
        {[90, 140, 190].map((y) => (
          <line key={y} x1="-20" y1={y} x2="820" y2={y} stroke="#ffffff" strokeWidth="0.8" opacity="0.12" />
        ))}
      </g>
    );
  }

  if (form === "park") {
    return (
      <g fill={color} opacity="0.5">
        {[60, 150, 250, 560, 660, 750].map((x) => (
          <g key={x}>
            <rect x={x} y="200" width="6" height="50" />
            <circle cx={x + 3} cy="192" r="26" />
          </g>
        ))}
      </g>
    );
  }

  const towers: [number, number, number][] = [
    [20, 150, 42],
    [76, 190, 34],
    [122, 120, 30],
    [166, 176, 40],
    [620, 168, 36],
    [668, 128, 28],
    [708, 186, 44],
    [764, 146, 32],
  ];
  return (
    <g fill={color} opacity="0.5">
      {towers.map(([x, y, w]) => (
        <rect key={x} x={x} y={y} width={w} height={r2(250 - y)} />
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
      viewBox="0 0 800 320"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`zsky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.sky[0]} />
          <stop offset="100%" stopColor={scene.sky[1]} />
        </linearGradient>
        <radialGradient id={`zglow-${uid}`} cx="50%" cy="58%" r="55%">
          <stop offset="0%" stopColor={scene.glow} stopOpacity="0.45" />
          <stop offset="100%" stopColor={scene.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`zscreen-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor={scene.screen} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`zbeam-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.screen} stopOpacity="0.3" />
          <stop offset="100%" stopColor={scene.screen} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="320" fill={`url(#zsky-${uid})`} />
      <Backdrop form={scene.backdrop} color={scene.sky[0]} />
      <ellipse cx="400" cy="200" rx="420" ry="180" fill={`url(#zglow-${uid})`} />

      {/* ضوء الشاشة ينسكب على الحشد — هو ما يجعل المشهد ليلة مشاهدة لا ساحة فارغة */}
      <path d="M250 190 L550 190 L660 300 L140 300 Z" fill={`url(#zbeam-${uid})`} />

      {/* الشاشة */}
      <g>
        <rect x="248" y="66" width="304" height="126" rx="6" fill={scene.sky[0]} opacity="0.9" />
        <rect x="256" y="74" width="288" height="110" rx="3" fill={`url(#zscreen-${uid})`} />
        <rect x="292" y="192" width="18" height="34" fill={scene.sky[0]} opacity="0.85" />
        <rect x="490" y="192" width="18" height="34" fill={scene.sky[0]} opacity="0.85" />
      </g>

      {/* الحشد */}
      <g fill={scene.sky[0]}>
        {CROWD.map((row, ri) => {
          const y = 246 + ri * 22;
          const rx = 8 + ri * 1.5;
          return row.map((x) => (
            <g key={`${ri}-${x}`} opacity={0.55 + ri * 0.15}>
              <circle cx={x} cy={y} r={r2(rx * 0.55)} />
              <path
                d={`M ${r2(x - rx * 0.8)} ${r2(y + rx * 1.8)} Q ${x} ${r2(y + rx * 0.2)} ${r2(x + rx * 0.8)} ${r2(y + rx * 1.8)} Z`}
              />
            </g>
          ));
        })}
      </g>
    </svg>
  );
}
