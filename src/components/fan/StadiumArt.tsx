/* -------------------------------------------------------------------------- */
/*  مشهد الملعب                                                                */
/*                                                                             */
/*  الملاعب مرسومة لا مصوّرة: لا صور في المشروع، والصورة الفوتوغرافية لملعب لم   */
/*  يُبنَ بعد ادّعاء لا يصحّ في نموذج أوّلي. الرسم يقول "ملعب" دون أن يزعم أنه     */
/*  الملعب بعينه، ويكفي أن يصدق في الطراز: خيمة الملك فهد شعاعية، ونيوم شفرة    */
/*  واحدة، والقدية موجة على البحر.                                              */
/*                                                                             */
/*  كل شيء هنا حتميّ — لا عشوائية ولا قراءة للوقت — كي يتطابق ما يرسمه الخادم    */
/*  مع ما يرسمه المتصفح.                                                        */
/* -------------------------------------------------------------------------- */

export type LandForm = "dunes" | "peaks" | "sea" | "skyline" | "cliffs";
export type RoofForm = "ring" | "tent" | "wave" | "blade";

export interface StadiumScene {
  /** معرّف الملعب في الدليل */
  venueId: string;
  /** السماء من القمّة إلى الأفق */
  sky: [string, string, string];
  /** الوهج فوق الملعب */
  glow: string;
  /** جسم الملعب: الظل ثم الوجه المضاء */
  shell: string;
  shellLit: string;
  /** ضوء الكشّافات وأرض الملعب */
  light: string;
  land: LandForm;
  roof: RoofForm;
  /** عدد ألواح السقف */
  ribs: number;
}

/**
 * لكل ملعب لوحته وطرازه. الترتيب هو ترتيب العرض في البوابة ويبدأ بأكبر
 * الملاعب: أول ما يراه الزائر أضخم ما في البطولة.
 */
export const SCENES: StadiumScene[] = [
  {
    venueId: "VN-RUH1",
    sky: ["#070a1c", "#132046", "#3c3566"],
    glow: "#c8a45a",
    shell: "#141a33",
    shellLit: "#2b3358",
    light: "#ffe6ad",
    land: "dunes",
    roof: "ring",
    ribs: 40,
  },
  {
    venueId: "VN-RUH3",
    sky: ["#0a0715", "#241436", "#6b3a4a"],
    glow: "#e0894f",
    shell: "#1a1226",
    shellLit: "#372448",
    light: "#ffd9b0",
    land: "dunes",
    roof: "tent",
    ribs: 24,
  },
  {
    venueId: "VN-JED1",
    sky: ["#04101c", "#0b2c46", "#1f6b76"],
    glow: "#5fd2c8",
    shell: "#0d1c2b",
    shellLit: "#1d3a4f",
    light: "#c9f6ff",
    land: "sea",
    roof: "ring",
    ribs: 34,
  },
  {
    venueId: "VN-KHO1",
    sky: ["#07101a", "#123048", "#2f6a70"],
    glow: "#63b6c9",
    shell: "#101d2a",
    shellLit: "#213b4d",
    light: "#d6f2ff",
    land: "skyline",
    roof: "wave",
    ribs: 30,
  },
  {
    venueId: "VN-RUH2",
    sky: ["#0b0713", "#2a1330", "#6d3352"],
    glow: "#d8748f",
    shell: "#1b1024",
    shellLit: "#3a2144",
    light: "#ffd4e4",
    land: "skyline",
    roof: "ring",
    ribs: 36,
  },
  {
    venueId: "VN-NEO1",
    sky: ["#050914", "#101f3e", "#2b4f7a"],
    glow: "#6ea8ff",
    shell: "#0e1526",
    shellLit: "#1d2c47",
    light: "#dbe9ff",
    land: "cliffs",
    roof: "blade",
    ribs: 26,
  },
  {
    venueId: "VN-JED2",
    sky: ["#05101b", "#0d2f45", "#2a7a78"],
    glow: "#57cfae",
    shell: "#0c1e28",
    shellLit: "#1b3d47",
    light: "#ccffe9",
    land: "sea",
    roof: "wave",
    ribs: 28,
  },
  {
    venueId: "VN-ABH1",
    sky: ["#080d16", "#182a33", "#4a6b52"],
    glow: "#8fd08a",
    shell: "#111b1e",
    shellLit: "#243733",
    light: "#e2ffd9",
    land: "peaks",
    roof: "tent",
    ribs: 22,
  },
];

export const sceneFor = (venueId: string, index: number): StadiumScene =>
  SCENES.find((s) => s.venueId === venueId) ?? SCENES[index % SCENES.length];

/* -------------------------------- الهندسة -------------------------------- */

const CX = 800;
const CY = 548;
/** نصفا قطر حلقة السقف */
const RX = 452;
const RY = 156;
/** فتحة السقف */
const IRX = 306;
const IRY = 102;
const ICY = 534;
/** ارتفاع الواجهة تحت السقف */
const DEPTH = 78;

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * التقريب ليس تجميلاً بل شرط صحّة.
 *
 * جيب الزاوية وجيب تمامها قد يختلفان في آخر بت بين محرّك الخادم ومحرّك المتصفح،
 * فيخرج الرقم نفسه بنصّين مختلفين ويشكو React من عدم تطابق الترطيب. منزلتان
 * عشريتان أدقّ بكثير من بكسل على الشاشة، وتُلغيان الفرق.
 */
const r2 = (n: number) => Math.round(n * 100) / 100;

/** نقطة على حلقة السقف عند زاوية معطاة */
const onRing = (deg: number, rx = RX, ry = RY, cy = CY) => ({
  x: r2(CX + rx * Math.cos(rad(deg))),
  y: r2(cy + ry * Math.sin(rad(deg))),
});

/** بيضة مغلقة من قوسين — القطعة التي يُبنى منها السقف وفتحته */
const ellipsePath = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

const ROOF = `${ellipsePath(CX, CY, RX, RY)} ${ellipsePath(CX, ICY, IRX, IRY)}`;

const FACADE =
  `M ${CX - RX} ${CY} A ${RX} ${RY} 0 0 0 ${CX + RX} ${CY} ` +
  `L ${CX + RX} ${CY + DEPTH} A ${RX} ${RY} 0 0 1 ${CX - RX} ${CY + DEPTH} Z`;

/** نجوم ثابتة: موضعها مكتوب لا محسوب، كي لا يختلف الخادم عن المتصفح */
const STARS: [number, number, number][] = [
  [120, 90, 1.6],
  [260, 150, 1.1],
  [340, 62, 2],
  [470, 190, 1.2],
  [560, 96, 1.5],
  [690, 168, 1],
  [780, 54, 1.8],
  [910, 132, 1.3],
  [1040, 78, 1.6],
  [1130, 186, 1.1],
  [1250, 104, 1.9],
  [1380, 160, 1.2],
  [1470, 68, 1.4],
  [200, 240, 1],
  [620, 268, 1.2],
  [1010, 246, 1],
  [1330, 274, 1.3],
  [80, 320, 0.9],
  [1540, 226, 1.1],
  [430, 108, 1],
];

/* --------------------------------- الأرض --------------------------------- */

function Land({ form, color }: { form: LandForm; color: string }) {
  if (form === "sea") {
    return (
      <g>
        <path d="M0 690 H1600 V900 H0 Z" fill={color} opacity="0.55" />
        {[706, 730, 758, 790].map((y, i) => (
          <path
            key={y}
            d={`M${-40 + i * 30} ${y} Q 300 ${y - 8} 600 ${y} T 1200 ${y} T 1700 ${y}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.2}
            opacity={0.14 - i * 0.025}
          />
        ))}
      </g>
    );
  }

  if (form === "peaks") {
    return (
      <g fill={color}>
        <path d="M-40 700 L180 470 L330 610 L470 500 L640 700 Z" opacity="0.5" />
        <path d="M980 700 L1140 520 L1270 620 L1420 460 L1660 700 Z" opacity="0.5" />
        <path d="M-40 700 H1660 V900 H-40 Z" opacity="0.62" />
      </g>
    );
  }

  if (form === "cliffs") {
    return (
      <g fill={color}>
        <path d="M-40 700 L120 700 L120 430 L250 430 L250 700 Z" opacity="0.42" />
        <path d="M1180 700 L1180 400 L1310 400 L1310 700 Z" opacity="0.42" />
        <path d="M-40 700 H1660 V900 H-40 Z" opacity="0.58" />
      </g>
    );
  }

  if (form === "skyline") {
    const towers: [number, number, number][] = [
      [40, 560, 70],
      [130, 620, 54],
      [200, 500, 46],
      [258, 596, 62],
      [330, 640, 50],
      [1210, 612, 58],
      [1280, 520, 44],
      [1336, 588, 66],
      [1414, 636, 52],
      [1478, 548, 74],
    ];
    return (
      <g fill={color}>
        {towers.map(([x, y, w]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={900 - y} opacity="0.5" />
        ))}
        <path d="M-40 700 H1660 V900 H-40 Z" opacity="0.6" />
      </g>
    );
  }

  return (
    <g fill={color}>
      <path d="M-40 700 Q 260 604 620 676 T 1240 660 T 1660 700 V900 H-40 Z" opacity="0.5" />
      <path d="M-40 780 Q 420 706 900 772 T 1660 760 V900 H-40 Z" opacity="0.62" />
    </g>
  );
}

/* --------------------------------- السقف --------------------------------- */

function RoofDetail({ scene, uid }: { scene: StadiumScene; uid: string }) {
  const spokes = Array.from({ length: scene.ribs }, (_, i) => {
    const deg = (i * 360) / scene.ribs;
    const a = onRing(deg, IRX, IRY, ICY);
    const b = onRing(deg);
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }).join(" ");

  const peaks = Math.round(scene.ribs / 2);

  return (
    <g clipPath={`url(#roof-${uid})`}>
      <path d={spokes} stroke="#ffffff" strokeWidth={1.1} opacity="0.16" fill="none" />

      {scene.roof === "tent" &&
        Array.from({ length: peaks }, (_, i) => {
          const deg = (i * 360) / peaks;
          const l = onRing(deg - 7);
          const r = onRing(deg + 7);
          const t = onRing(deg, IRX, IRY, ICY);
          return (
            <path
              key={deg}
              d={`M ${l.x} ${l.y} L ${t.x} ${t.y} L ${r.x} ${r.y} Z`}
              fill="#ffffff"
              opacity="0.13"
            />
          );
        })}

      {scene.roof === "wave" && (
        <path
          d={`M ${CX - RX} ${CY - 40} Q ${CX - RX / 2} ${CY - 116} ${CX} ${CY - 46} T ${CX + RX} ${CY - 40}`}
          fill="none"
          stroke={scene.light}
          strokeWidth={7}
          opacity="0.4"
        />
      )}

      {scene.roof === "blade" && (
        <path
          d={
            `M ${CX - RX} ${CY - 6} Q ${CX} ${CY - 190} ${CX + RX} ${CY - 6} ` +
            `L ${CX + RX} ${CY + 26} Q ${CX} ${CY - 140} ${CX - RX} ${CY + 26} Z`
          }
          fill={scene.light}
          opacity="0.24"
        />
      )}
    </g>
  );
}

/* --------------------------------- المشهد --------------------------------- */

export default function StadiumArt({
  scene,
  uid,
  className,
}: {
  scene: StadiumScene;
  uid: string;
  className?: string;
}) {
  /* الكشّافات على النصف العلوي من الحلقة، ومنها تنزل الأعمدة الضوئية */
  const masts = [206, 240, 274, 306, 340].map((deg) => {
    const p = onRing(deg);
    return { deg, x: p.x, y: p.y, tip: p.y - 74 };
  });

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.sky[0]} />
          <stop offset="52%" stopColor={scene.sky[1]} />
          <stop offset="100%" stopColor={scene.sky[2]} />
        </linearGradient>

        <radialGradient id={`glow-${uid}`} cx="50%" cy="62%" r="52%">
          <stop offset="0%" stopColor={scene.glow} stopOpacity="0.55" />
          <stop offset="60%" stopColor={scene.glow} stopOpacity="0.14" />
          <stop offset="100%" stopColor={scene.glow} stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`beam-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.light} stopOpacity="0.34" />
          <stop offset="100%" stopColor={scene.light} stopOpacity="0" />
        </linearGradient>

        <radialGradient id={`pitch-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="55%" stopColor={scene.light} stopOpacity="0.75" />
          <stop offset="100%" stopColor={scene.light} stopOpacity="0.18" />
        </radialGradient>

        <linearGradient id={`shell-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.shellLit} />
          <stop offset="100%" stopColor={scene.shell} />
        </linearGradient>

        <linearGradient id={`haze-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.sky[2]} stopOpacity="0" />
          <stop offset="100%" stopColor={scene.sky[0]} stopOpacity="0.92" />
        </linearGradient>

        <clipPath id={`roof-${uid}`}>
          <path d={ROOF} clipRule="evenodd" />
        </clipPath>
        <clipPath id={`bowl-${uid}`}>
          <ellipse cx={CX} cy={ICY} rx={IRX} ry={IRY} />
        </clipPath>
      </defs>

      <rect width="1600" height="900" fill={`url(#sky-${uid})`} />

      <g className="gate-stars">
        {STARS.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#ffffff" opacity="0.55" />
        ))}
      </g>

      <Land form={scene.land} color={scene.sky[0]} />

      {/* المجموعة كلّها تتقلّص على الشاشات الطويلة — انظر gate-scene في الأنماط */}
      <g className="gate-scene">
      <ellipse cx={CX} cy={CY - 20} rx={760} ry={420} fill={`url(#glow-${uid})`} />

      {/* الأعمدة الضوئية قبل الجسم كي تبدو خلف حافّته الأمامية */}
      <g className="gate-beams">
        {masts.map((m) => (
          <path
            key={m.deg}
            d={`M ${m.x - 7} ${m.tip} L ${m.x + 7} ${m.tip} L ${CX + 210} ${ICY + 54} L ${CX - 210} ${ICY + 54} Z`}
            fill={`url(#beam-${uid})`}
          />
        ))}
      </g>

      {/* الجسم */}
      <path d={FACADE} fill={`url(#shell-${uid})`} />
      <g>
        {Array.from({ length: 56 }, (_, i) => {
          const deg = 180 + (i * 180) / 55;
          const p = onRing(deg);
          return (
            <line
              key={deg}
              x1={p.x}
              y1={p.y + 4}
              x2={p.x}
              y2={p.y + DEPTH}
              stroke={scene.light}
              strokeWidth={1}
              opacity={0.16}
            />
          );
        })}
      </g>

      {/* الداخل: المدرّجات ثم أرض الملعب */}
      <g clipPath={`url(#bowl-${uid})`}>
        <ellipse cx={CX} cy={ICY} rx={IRX} ry={IRY} fill={scene.shell} />
        {[0.92, 0.78, 0.64].map((k, i) => (
          <ellipse
            key={k}
            cx={CX}
            cy={ICY + 8 + i * 6}
            rx={r2(IRX * k)}
            ry={r2(IRY * k)}
            fill="none"
            stroke={scene.light}
            strokeWidth={1.2}
            opacity={0.2}
          />
        ))}
        <ellipse cx={CX} cy={ICY + 26} rx={186} ry={58} fill={`url(#pitch-${uid})`} />
        <ellipse
          cx={CX}
          cy={ICY + 26}
          rx={186}
          ry={58}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.4}
          opacity="0.5"
        />
        <line
          x1={CX}
          y1={ICY - 32}
          x2={CX}
          y2={ICY + 84}
          stroke="#ffffff"
          strokeWidth={1.2}
          opacity="0.4"
        />
      </g>

      {/* السقف */}
      <path d={ROOF} fillRule="evenodd" fill={`url(#shell-${uid})`} />
      <path
        d={ROOF}
        fillRule="evenodd"
        fill="none"
        stroke={scene.light}
        strokeWidth={1.6}
        opacity="0.35"
      />
      <RoofDetail scene={scene} uid={uid} />

      {/* الكشّافات */}
      <g className="gate-masts">
        {masts.map((m) => (
          <g key={m.deg}>
            <line x1={m.x} y1={m.y} x2={m.x} y2={m.tip} stroke={scene.shellLit} strokeWidth={3} />
            <rect x={m.x - 15} y={m.tip - 9} width="30" height="11" rx="3" fill={scene.light} />
            <circle cx={m.x} cy={m.tip - 4} r="17" fill={scene.light} opacity="0.28" />
          </g>
        ))}
      </g>
      </g>

      <rect y="640" width="1600" height="260" fill={`url(#haze-${uid})`} />
    </svg>
  );
}
