/* -------------------------------------------------------------------------- */
/*  مشاهد الملاعب                                                              */
/*                                                                             */
/*  كل ملعب هنا مرسوم على تصميمه المعلَن لا على شكل عامّ: بذرة الملك سلمان        */
/*  الغائرة في الأرض، ومكعّبات الأمير محمد بن سلمان المتدرّجة على جرف طويق،        */
/*  ودوّامة أرامكو بأشرعتها، ونيوم داخل «ذا لاين»، وموجة ساحل القدية، وجوهرة      */
/*  جدة المضلّعة، وخيمة الملك فهد، ومدرّج أبها الغربي بين الجبال.                  */
/*                                                                             */
/*  ولماذا رسم لا صورة: الرندرات الرسمية مملوكة لمكاتبها المعمارية، ولا تُنسخ     */
/*  في مشروع كهذا. الرسم يتتبّع الشكل المعماري المنشور ولا يزعم أنه الصورة.       */
/*                                                                             */
/*  وكل حساب هنا حتميّ ومقرّب: جيب الزاوية قد يختلف في آخر بت بين محرّك الخادم    */
/*  ومحرّك المتصفح، فيشكو React من عدم تطابق الترطيب.                            */
/* -------------------------------------------------------------------------- */

export type LandForm = "dunes" | "peaks" | "sea" | "skyline" | "cliffs" | "plateau";

/** الطراز المعماري لكل ملعب — واحد لكل ملعب، لا قالب مشترك */
export type FormKind =
  | "seed" /* الملك سلمان الدولي — بذرة تنبت من الأرض */
  | "tent" /* مدينة الملك فهد — خيمة نسيجية على منصّة */
  | "jewel" /* الملك عبدالله بجدة — الجوهرة المضيئة المضلّعة */
  | "dawwama" /* أرامكو بالخبر — دوّامة من أشرعة متراكبة */
  | "cliffcubes" /* الأمير محمد بن سلمان — مكعّبات على جرف طويق */
  | "line" /* نيوم — داخل «ذا لاين» على ارتفاع 350 متراً */
  | "ripple" /* ساحل القدية — موجة المشجعين المتموّجة */
  | "highland"; /* جامعة الملك خالد بأبها — مدرّج غربي بين الجبال */

export interface StadiumScene {
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
  /** لون ثانٍ يخصّ الطراز: أخضر البذرة، أرجوان الشاشة، فضّة المرايا */
  accent: string;
  land: LandForm;
  form: FormKind;
}

/**
 * الترتيب هو ترتيب العرض في البوابة، ويبدأ بأكبر الملاعب.
 */
export const SCENES: StadiumScene[] = [
  {
    /* بوبيولوس: التضاريس والغطاء النباتي جزء من السقف، ومضمار مشي على القمّة */
    venueId: "VN-RUH1",
    sky: ["#080b1e", "#17224a", "#4a4064"],
    glow: "#c9a961",
    shell: "#1a2138",
    shellLit: "#33405c",
    light: "#ffe9b8",
    accent: "#6f9e63",
    land: "dunes",
    form: "seed",
  },
  {
    /* بوبيولوس: سقف نسيجي مستوحى من الخيمة، فوق منصّة */
    venueId: "VN-RUH3",
    sky: ["#0b0817", "#2a1839", "#77444d"],
    glow: "#e29358",
    shell: "#1d1428",
    shellLit: "#3d284b",
    light: "#fff0d8",
    accent: "#f2e3c8",
    land: "dunes",
    form: "tent",
  },
  {
    /* آروب: «الجوهرة المضيئة» — هندسة مضلّعة على شاطئ جدة */
    venueId: "VN-JED1",
    sky: ["#04101e", "#0c3050", "#227f84"],
    glow: "#63dcd0",
    shell: "#0e2033",
    shellLit: "#20455f",
    light: "#d6fbff",
    accent: "#8ef0e4",
    land: "sea",
    form: "jewel",
  },
  {
    /* فوستر وشركاه: «الدوّامة» — أشرعة متراكبة وموج الخليج */
    venueId: "VN-KHO1",
    sky: ["#061019", "#0f3350", "#2d7f8c"],
    glow: "#57b9d8",
    shell: "#0f2030",
    shellLit: "#1f4257",
    light: "#e0f6ff",
    accent: "#7fd4ea",
    land: "sea",
    form: "dawwama",
  },
  {
    /* بوبيولوس: مكعّبات معيارية تمتدّ من جرف طويق، وجدار شاشة عملاق */
    venueId: "VN-RUH2",
    sky: ["#0a0716", "#2b1436", "#6f3b63"],
    glow: "#c261b4",
    shell: "#1c1228",
    shellLit: "#3c2450",
    light: "#f5d9ff",
    accent: "#b25ce0",
    land: "cliffs",
    form: "cliffcubes",
  },
  {
    /* داخل «ذا لاين»: الملعب في الطابقين الرابع والخامس، والمدينة سقفه */
    venueId: "VN-NEO1",
    sky: ["#050a16", "#0f2244", "#2f5b8c"],
    glow: "#77b0ff",
    shell: "#0d1526",
    shellLit: "#20304d",
    light: "#e6f0ff",
    accent: "#9fc4ff",
    land: "plateau",
    form: "line",
  },
  {
    /* بوبيولوس: تموّج مستوحى من الماء وموجة المشجعين، بألوان صريحة */
    venueId: "VN-JED2",
    sky: ["#05101c", "#0e3348", "#2f8a80"],
    glow: "#4fd6a8",
    shell: "#0d2028",
    shellLit: "#1d424b",
    light: "#d8fff0",
    accent: "#ffb15c",
    land: "sea",
    form: "ripple",
  },
  {
    /* بوبيولوس: تحديث ملعب قائم بمدرّج غربي دائم، في حرم جبليّ */
    venueId: "VN-ABH1",
    sky: ["#070d15", "#182c34", "#4e7256"],
    glow: "#93d38c",
    shell: "#121d20",
    shellLit: "#263b35",
    light: "#e8ffdf",
    accent: "#a8d9a0",
    land: "peaks",
    form: "highland",
  },
];

export const sceneFor = (venueId: string, index: number): StadiumScene =>
  SCENES.find((s) => s.venueId === venueId) ?? SCENES[index % SCENES.length];

/* -------------------------------- الهندسة -------------------------------- */

const CX = 800;
const CY = 548;
const RX = 452;
const RY = 156;
const IRX = 306;
const IRY = 102;
const ICY = 534;
const DEPTH = 78;

const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * التقريب شرط صحّة لا تجميل: منزلتان أدقّ من بكسل، وتُلغيان فرق آخر بت بين
 * جيب الزاوية على الخادم وجيبها في المتصفح.
 */
const r2 = (n: number) => Math.round(n * 100) / 100;

const onRing = (deg: number, rx = RX, ry = RY, cy = CY) => ({
  x: r2(CX + rx * Math.cos(rad(deg))),
  y: r2(cy + ry * Math.sin(rad(deg))),
});

const ellipsePath = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

/** حلقة السقف: بيضة خارجية وفتحة داخلية، تُملأ بقاعدة evenodd */
const ringPath = (rx = RX, ry = RY, cy = CY, irx = IRX, iry = IRY, icy = ICY) =>
  `${ellipsePath(CX, cy, rx, ry)} ${ellipsePath(CX, icy, irx, iry)}`;

/** واجهة تحت الحلقة: القوس الأمامي مكرّراً على ارتفاعين */
const facadePath = (rx = RX, ry = RY, cy = CY, depth = DEPTH) =>
  `M ${CX - rx} ${cy} A ${rx} ${ry} 0 0 0 ${CX + rx} ${cy} ` +
  `L ${CX + rx} ${cy + depth} A ${rx} ${ry} 0 0 1 ${CX - rx} ${cy + depth} Z`;

/** حافّة متموّجة: نصف القطر يتذبذب مع الزاوية — رِمّ موجة المشجعين */
const wavyRing = (rx: number, ry: number, cy: number, amp: number, lobes: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 144; i++) {
    const deg = (i * 360) / 144;
    const k = 1 + (amp * Math.sin(rad(deg * lobes))) / 100;
    pts.push(`${r2(CX + rx * k * Math.cos(rad(deg)))} ${r2(cy + ry * k * Math.sin(rad(deg)))}`);
  }
  return `M ${pts.join(" L ")} Z`;
};

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

  /* جرف طويق: هضبة عالية ينقطع وجهها رأسياً */
  if (form === "cliffs") {
    return (
      <g fill={color}>
        <path d="M-40 618 H1660 V900 H-40 Z" opacity="0.66" />
        <path d="M-40 618 H620 L660 700 H-40 Z" opacity="0.38" />
        <path d="M980 618 H1660 V900 H980 Z" opacity="0.24" />
      </g>
    );
  }

  /* أرض نيوم: مستوية بعيدة، فالمدينة هي التي ترتفع لا الأرض */
  if (form === "plateau") {
    return (
      <g fill={color}>
        <path d="M-40 742 H1660 V900 H-40 Z" opacity="0.7" />
        <path d="M-40 742 Q 400 716 820 740 T 1660 738 V760 H-40 Z" opacity="0.4" />
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

/* ------------------------------ قطع مشتركة ------------------------------ */

/**
 * أرض الملعب.
 *
 * خضراء بخطوطها لا بقعة ضوء: العشب المضاء ليلاً هو ما يجعل الشكل يُقرأ ملعباً
 * من أول نظرة، ودائرة المنتصف وخط التماس يكفيان — ما دون ذلك يضيع في الحجم.
 */
function PitchOval({
  uid,
  cx,
  cy,
  rx,
  ry,
}: {
  uid: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}) {
  /* القصّ يخصّ هذه الأرض بذاتها: المشهد الواحد قد يرسم أكثر من ملعب بأبعاد مختلفة */
  const clip = `turf-${uid}-${cx}-${cy}`;

  return (
    <g>
      <clipPath id={clip}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      </clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#turf-${uid})`} />
      {/* شرائط الجزّ */}
      <g clipPath={`url(#${clip})`} opacity="0.28">
        {Array.from({ length: 7 }, (_, i) => (
          <rect
            key={i}
            x={r2(cx - rx + (i * 2 * rx) / 7)}
            y={r2(cy - ry)}
            width={r2(rx / 7)}
            height={r2(ry * 2)}
            fill="#ffffff"
            opacity={i % 2 === 0 ? 0.5 : 0}
          />
        ))}
      </g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#ffffff" strokeWidth={1.6} opacity="0.72" />
      <line x1={cx} y1={r2(cy - ry)} x2={cx} y2={r2(cy + ry)} stroke="#ffffff" strokeWidth={1.4} opacity="0.6" />
      <ellipse cx={cx} cy={cy} rx={r2(rx * 0.19)} ry={r2(ry * 0.3)} fill="none" stroke="#ffffff" strokeWidth={1.4} opacity="0.6" />
      {/* وهج الكشّافات على العشب */}
      <ellipse cx={cx} cy={cy} rx={r2(rx * 1.15)} ry={r2(ry * 1.5)} fill={`url(#pitch-${uid})`} opacity="0.5" />
    </g>
  );
}

/** الداخل: مدرّجات ثم أرض ملعب مضاءة، مقصوصة عند حافّة الفتحة */
function Pitch({
  uid,
  scene,
  irx = IRX,
  iry = IRY,
  icy = ICY,
}: {
  uid: string;
  scene: StadiumScene;
  irx?: number;
  iry?: number;
  icy?: number;
}) {
  return (
    <g clipPath={`url(#bowl-${uid})`}>
      <ellipse cx={CX} cy={icy} rx={irx} ry={iry} fill={scene.shell} />
      {[0.92, 0.78, 0.64].map((k, i) => (
        <ellipse
          key={k}
          cx={CX}
          cy={icy + 8 + i * 6}
          rx={r2(irx * k)}
          ry={r2(iry * k)}
          fill="none"
          stroke={scene.light}
          strokeWidth={1.2}
          opacity={0.2}
        />
      ))}
      <PitchOval uid={uid} cx={CX} cy={r2(icy + 26)} rx={r2(irx * 0.61)} ry={r2(iry * 0.57)} />
    </g>
  );
}

/** كشّافات على النصف العلوي من الحلقة، ومنها تنزل أعمدة الضوء */
function Floodlights({ uid, scene, ry = RY, cy = CY }: { uid: string; scene: StadiumScene; ry?: number; cy?: number }) {
  const masts = [206, 240, 274, 306, 340].map((deg) => {
    const p = onRing(deg, RX, ry, cy);
    return { deg, x: p.x, y: p.y, tip: r2(p.y - 74) };
  });

  return (
    <>
      <g className="gate-beams">
        {masts.map((m) => (
          <path
            key={m.deg}
            d={`M ${m.x - 7} ${m.tip} L ${m.x + 7} ${m.tip} L ${CX + 210} ${ICY + 54} L ${CX - 210} ${ICY + 54} Z`}
            fill={`url(#beam-${uid})`}
          />
        ))}
      </g>
      <g className="gate-masts">
        {masts.map((m) => (
          <g key={m.deg}>
            <line x1={m.x} y1={m.y} x2={m.x} y2={m.tip} stroke={scene.shellLit} strokeWidth={3} />
            <rect x={m.x - 15} y={r2(m.tip - 9)} width="30" height="11" rx="3" fill={scene.light} />
            <circle cx={m.x} cy={r2(m.tip - 4)} r="17" fill={scene.light} opacity="0.28" />
          </g>
        ))}
      </g>
    </>
  );
}

/* ------------------------------ الطُّرُز ------------------------------ */

/**
 * الملك سلمان الدولي — بوبيولوس.
 * بذرة تنبت من الأرض: التضاريس نفسها تصعد لتصير سقفاً، بمصاطب مزروعة
 * ومضمار مشي على القمّة يطلّ على الحديقة.
 */
function SeedForm({ uid, scene }: { uid: string; scene: StadiumScene }) {
  const terraces = [
    { rx: 548, ry: 190, cy: 574, depth: 30 },
    { rx: 496, ry: 172, cy: 560, depth: 28 },
    { rx: 442, ry: 152, cy: 546, depth: 26 },
    { rx: 382, ry: 130, cy: 534, depth: 24 },
  ];

  return (
    <g>
      {terraces.map((t, i) => (
        <g key={t.rx}>
          <path d={facadePath(t.rx, t.ry, t.cy, t.depth)} fill={`url(#shell-${uid})`} />
          <path
            d={ellipsePath(CX, t.cy, t.rx, t.ry)}
            fill={i % 2 === 0 ? scene.shellLit : scene.shell}
            opacity={0.9}
          />
          {/* الخضرة على حافّة كل مصطبة — الجدران الخضراء في التصميم */}
          <path
            d={`M ${CX - t.rx} ${t.cy} A ${t.rx} ${t.ry} 0 0 0 ${CX + t.rx} ${t.cy}`}
            fill="none"
            stroke={scene.accent}
            strokeWidth={5}
            opacity={0.34}
            strokeDasharray="3 9"
          />
        </g>
      ))}

      {/* مضمار المشي على القمّة */}
      <path
        d={ellipsePath(CX, 534, 382, 130)}
        fill="none"
        stroke={scene.light}
        strokeWidth={1.6}
        opacity="0.4"
        strokeDasharray="14 10"
      />

      <path d={ringPath(382, 130, 534)} fillRule="evenodd" fill={`url(#shell-${uid})`} opacity="0.9" />
      <Pitch uid={uid} scene={scene} />
      <Floodlights uid={uid} scene={scene} ry={130} cy={534} />
    </g>
  );
}

/**
 * مدينة الملك فهد الرياضية — بوبيولوس.
 * السقف النسيجي المستوحى من الخيمة: قِمم مشدودة إلى صوارٍ، وبينها تدلّ
 * الأقمشة، فوق منصّة مرتفعة.
 */
function TentForm({ uid, scene }: { uid: string; scene: StadiumScene }) {
  const peaks = 14;
  const points = Array.from({ length: peaks }, (_, i) => {
    const deg = (i * 360) / peaks;
    const outer = onRing(deg);
    const inner = onRing(deg, IRX, IRY, ICY);
    return { deg, outer, inner, apex: { x: outer.x, y: r2(outer.y - 92) } };
  });

  return (
    <g>
      {/* المنصّة */}
      <path d={facadePath(506, 176, 576, 46)} fill={scene.shell} opacity="0.85" />
      <path d={ellipsePath(CX, 576, 506, 176)} fill={scene.shellLit} opacity="0.55" />

      <path d={facadePath()} fill={`url(#shell-${uid})`} />
      <path d={ringPath()} fillRule="evenodd" fill={`url(#shell-${uid})`} />
      <Pitch uid={uid} scene={scene} />

      {/* القماش: بين كل صاريتين تدلّ قطعة ثم تُشدّ إلى القمّة */}
      <g>
        {points.map((p, i) => {
          const next = points[(i + 1) % peaks];
          return (
            <path
              key={p.deg}
              d={
                `M ${p.inner.x} ${p.inner.y} Q ${r2((p.apex.x + next.apex.x) / 2)} ${r2(
                  (p.apex.y + next.apex.y) / 2 + 44,
                )} ${next.inner.x} ${next.inner.y} ` +
                `L ${next.apex.x} ${next.apex.y} L ${p.apex.x} ${p.apex.y} Z`
              }
              fill={scene.accent}
              opacity={i % 2 === 0 ? 0.19 : 0.13}
            />
          );
        })}
      </g>

      {/* الصواري */}
      {points.map((p) => (
        <g key={`m-${p.deg}`}>
          <line x1={p.outer.x} y1={p.outer.y} x2={p.apex.x} y2={p.apex.y} stroke={scene.light} strokeWidth={2} opacity="0.6" />
          <circle cx={p.apex.x} cy={p.apex.y} r={4} fill={scene.light} opacity="0.85" />
        </g>
      ))}
    </g>
  );
}

/**
 * مدينة الملك عبدالله الرياضية بجدة — آروب.
 * «الجوهرة المضيئة»: هندسة مضلّعة لا منحنية، أوجه مثلّثة تتناوب إضاءتها
 * كأنها حجر مصقول.
 */
function JewelForm({ uid, scene }: { uid: string; scene: StadiumScene }) {
  const sides = 20;
  const facets = Array.from({ length: sides }, (_, i) => {
    const a = (i * 360) / sides;
    const b = ((i + 1) * 360) / sides;
    const o1 = onRing(a);
    const o2 = onRing(b);
    const i1 = onRing(a, IRX, IRY, ICY);
    const i2 = onRing(b, IRX, IRY, ICY);
    return {
      i,
      upper: `M ${o1.x} ${o1.y} L ${o2.x} ${o2.y} L ${i1.x} ${i1.y} Z`,
      lower: `M ${o2.x} ${o2.y} L ${i2.x} ${i2.y} L ${i1.x} ${i1.y} Z`,
      skirt: `M ${o1.x} ${o1.y} L ${o2.x} ${o2.y} L ${o2.x} ${r2(o2.y + DEPTH)} L ${o1.x} ${r2(o1.y + DEPTH)} Z`,
    };
  });

  return (
    <g>
      {facets.map((f) => (
        <path key={`s-${f.i}`} d={f.skirt} fill={f.i % 2 === 0 ? scene.shellLit : scene.shell} />
      ))}
      <Pitch uid={uid} scene={scene} />
      {facets.map((f) => (
        <g key={f.i}>
          <path d={f.upper} fill={scene.shellLit} opacity={f.i % 3 === 0 ? 0.95 : 0.72} />
          <path d={f.lower} fill={scene.shell} opacity={f.i % 2 === 0 ? 0.9 : 0.66} />
        </g>
      ))}
      {/* الحدود بين الأوجه هي ما يجعلها تلمع */}
      {facets.map((f) => (
        <path
          key={`e-${f.i}`}
          d={f.upper}
          fill="none"
          stroke={scene.accent}
          strokeWidth={1}
          opacity="0.42"
        />
      ))}
      <Floodlights uid={uid} scene={scene} />
    </g>
  );
}

/**
 * ملعب أرامكو بالخبر — فوستر وشركاه.
 * «الدوّامة»: أشرعة متراكبة تدور حول الحوض، مستوحاة من دوّامة الخليج
 * وحركة الموج.
 */
function DawwamaForm({ uid, scene }: { uid: string; scene: StadiumScene }) {
  const sails = 9;

  return (
    <g>
      <path d={facadePath()} fill={`url(#shell-${uid})`} />
      <path d={ringPath()} fillRule="evenodd" fill={`url(#shell-${uid})`} />
      <Pitch uid={uid} scene={scene} />

      {/* كل شراع قطعة منحنية، والدوران هو ما يصنع الدوّامة */}
      <g>
        {Array.from({ length: sails }, (_, i) => {
          const deg = r2((i * 360) / sails);
          return (
            <path
              key={deg}
              transform={`rotate(${deg} ${CX} ${CY})`}
              d={`M ${CX - 452} ${CY} Q ${CX - 250} ${CY - 178} ${CX + 40} ${CY - 116} Q ${CX - 180} ${CY - 60} ${CX - 306} ${CY} Z`}
              fill={scene.accent}
              opacity={0.14}
            />
          );
        })}
      </g>

      {/* حافّة كل شراع تلمع فتُقرأ الدوّامة */}
      <g>
        {Array.from({ length: sails }, (_, i) => {
          const deg = r2((i * 360) / sails);
          return (
            <path
              key={`e-${deg}`}
              transform={`rotate(${deg} ${CX} ${CY})`}
              d={`M ${CX - 452} ${CY} Q ${CX - 250} ${CY - 178} ${CX + 40} ${CY - 116}`}
              fill="none"
              stroke={scene.light}
              strokeWidth={1.6}
              opacity="0.34"
            />
          );
        })}
      </g>

      <Floodlights uid={uid} scene={scene} />
    </g>
  );
}

/**
 * ملعب الأمير محمد بن سلمان بالقدية — بوبيولوس.
 * مكعّبات معيارية تمتدّ من جرف طويق وتتدرّج عليه، ومدرّج ثلاثيّ الأضلاع
 * مفتوح على الجرف، وجدار شاشة عملاق ينزلق.
 */
function CliffCubesForm({ uid, scene }: { uid: string; scene: StadiumScene }) {
  const cols = 11;
  const rows = 5;
  const cw = 74;
  const ch = 46;
  const x0 = CX - (cols * cw) / 2;
  const y0 = 356;

  /* بعض المكعّبات مفتوحة: هي «البوّابات» التي تطلّ على المدينة */
  const portals = new Set(["1-3", "2-6", "3-1", "0-8", "4-9", "2-2"]);

  return (
    <g>
      {/* كتلة الجرف تحت الملعب */}
      <path d={`M ${x0 - 40} 604 H ${x0 + cols * cw + 40} L ${x0 + cols * cw - 30} 900 H ${x0 + 10} Z`} fill={scene.shell} opacity="0.9" />

      {/* المكعّبات */}
      <g>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const key = `${r}-${c}`;
            /* التدرّج: الصفوف العليا أضيق فتبدو الكتلة نازلة على الجرف */
            const inset = r2(Math.abs(c - (cols - 1) / 2) * 3 + r * 2);
            const x = r2(x0 + c * cw + inset / 2);
            const y = r2(y0 + r * ch);
            const open = portals.has(key);
            return (
              <rect
                key={key}
                x={x}
                y={y}
                width={r2(cw - 6 - inset)}
                height={ch - 6}
                rx="3"
                fill={open ? scene.accent : r % 2 === 0 ? scene.shellLit : scene.shell}
                opacity={open ? 0.5 : 0.92}
                stroke={scene.light}
                strokeWidth={0.8}
                strokeOpacity={0.18}
              />
            );
          }),
        )}
      </g>

      {/* المدرّج مفتوح من جهة، والملعب يُرى من الفتحة */}
      <g clipPath={`url(#cube-${uid})`}>
        <rect x={x0 + 120} y={y0 + 52} width={cols * cw - 240} height={150} fill={scene.shell} />
        <PitchOval uid={uid} cx={CX} cy={y0 + 128} rx={230} ry={52} />
      </g>

      {/* جدار الشاشة: شريط مضيء بخطوط مسح */}
      <g>
        <rect x={x0 + 96} y={y0 - 44} width={r2(cols * cw - 192)} height="40" rx="4" fill={scene.accent} opacity="0.42" />
        {Array.from({ length: 9 }, (_, i) => (
          <rect
            key={i}
            x={r2(x0 + 108 + i * ((cols * cw - 216) / 9))}
            y={y0 - 38}
            width={r2((cols * cw - 216) / 9 - 8)}
            height="28"
            fill={scene.light}
            opacity={i % 3 === 0 ? 0.34 : 0.16}
          />
        ))}
      </g>
    </g>
  );
}

/**
 * ملعب نيوم — داخل «ذا لاين».
 * لا حوض قائم على الأرض: الملعب مغروس في الطابقين الرابع والخامس من
 * المدينة الخطّية على ارتفاع 350 متراً، وسقفه هو المدينة نفسها.
 */
function LineForm({ uid, scene }: { uid: string; scene: StadiumScene }) {
  const top = 96;
  const bottom = 742;
  const tiers = [96, 226, 356, 486, 616];

  return (
    <g>
      {/* الكتلة المرآتية تمتدّ خارج الإطار من الجهتين */}
      <rect x={-40} y={top} width={1680} height={r2(bottom - top)} fill={`url(#mirror-${uid})`} />

      {/* الطوابق الخمسة */}
      {tiers.map((y) => (
        <line key={y} x1={-40} y1={y} x2={1660} y2={y} stroke={scene.light} strokeWidth={1} opacity="0.16" />
      ))}

      {/* انعكاسات رأسية على الواجهة */}
      {Array.from({ length: 34 }, (_, i) => (
        <line
          key={i}
          x1={r2(-40 + i * 50)}
          y1={top}
          x2={r2(-40 + i * 50)}
          y2={bottom}
          stroke={scene.light}
          strokeWidth={i % 4 === 0 ? 1.4 : 0.6}
          opacity={i % 4 === 0 ? 0.14 : 0.07}
        />
      ))}

      {/* الملعب: فتحة في الواجهة بين الطابقين الرابع والخامس */}
      <g>
        <rect x={CX - 300} y={330} width={600} height={230} rx="10" fill={scene.shell} />
        <rect
          x={CX - 300}
          y={330}
          width={600}
          height={230}
          rx="10"
          fill="none"
          stroke={scene.accent}
          strokeWidth={2}
          opacity="0.5"
        />
        <g clipPath={`url(#slot-${uid})`}>
          {[0.9, 0.74].map((k, i) => (
            <ellipse
              key={k}
              cx={CX}
              cy={r2(452 + i * 10)}
              rx={r2(268 * k)}
              ry={r2(86 * k)}
              fill="none"
              stroke={scene.light}
              strokeWidth={1.2}
              opacity="0.22"
            />
          ))}
          <PitchOval uid={uid} cx={CX} cy={470} rx={176} ry={52} />
        </g>
      </g>

      {/* أعمدة تحمل المدينة، وتحتها فراغ 350 متراً */}
      {[120, 420, 1180, 1480].map((x) => (
        <rect key={x} x={x} y={bottom} width="26" height={r2(742 + 30 - bottom)} fill={scene.shell} opacity="0.7" />
      ))}
    </g>
  );
}

/**
 * ملعب ساحل القدية — بوبيولوس.
 * تموّج مستوحى من حركة الماء ومن «موجة المشجعين»: الرِّمّ نفسه يعلو ويهبط،
 * بألوان صريحة لا رمادية.
 */
function RippleForm({ uid, scene }: { uid: string; scene: StadiumScene }) {
  const bands = [
    { rx: 470, ry: 164, cy: 560, amp: 9, lobes: 7, color: scene.accent, o: 0.3 },
    { rx: 436, ry: 152, cy: 552, amp: 8, lobes: 7, color: scene.light, o: 0.22 },
    { rx: 398, ry: 138, cy: 545, amp: 7, lobes: 7, color: scene.glow, o: 0.3 },
    { rx: 356, ry: 122, cy: 539, amp: 6, lobes: 7, color: scene.accent, o: 0.24 },
  ];

  return (
    <g>
      <path d={facadePath(470, 164, 560, 84)} fill={`url(#shell-${uid})`} />

      {/* الحلقات المتموّجة من الخارج إلى الداخل — الموجة مجمّدة في لحظة */}
      {bands.map((b) => (
        <g key={b.rx}>
          <path d={wavyRing(b.rx, b.ry, b.cy, b.amp, b.lobes)} fill={b.color} opacity={b.o} />
          <path
            d={wavyRing(b.rx, b.ry, b.cy, b.amp, b.lobes)}
            fill="none"
            stroke={scene.light}
            strokeWidth={1.2}
            opacity="0.28"
          />
        </g>
      ))}

      <path d={ellipsePath(CX, ICY, IRX, IRY)} fill={scene.shell} />
      <Pitch uid={uid} scene={scene} />
      <Floodlights uid={uid} scene={scene} />
    </g>
  );
}

/**
 * ملعب جامعة الملك خالد بأبها — بوبيولوس.
 * ملعب قائم يُحدَّث: مدرّج غربي دائم جديد أعلى من بقية المدرّجات، في حرم
 * جبليّ، فالصورة غير متناظرة عمداً.
 */
function HighlandForm({ uid, scene }: { uid: string; scene: StadiumScene }) {
  /* الجهة الغربية من الحلقة: من مقدّمة اليسار إلى مؤخّرتها */
  const STEPS = 24;
  const base: { x: number; y: number }[] = [];
  const crest: { x: number; y: number }[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const deg = 120 + (i * 120) / STEPS;
    const p = onRing(deg);
    /*
     * الحافّة العليا قوس من العائلة نفسها لا خطّ مرفوع رأسياً: الحلقة ترتفع
     * على الشاشة كلّما دارت إلى الخلف، فالرفع الرأسي يقطعها بدل أن يوازيها.
     */
    const raised = onRing(deg, RX + 26, RY + 14, CY - 96);
    const t = Math.sin(rad((i * 180) / STEPS));
    base.push(p);
    crest.push({
      x: r2(p.x + t * (raised.x - p.x)),
      y: r2(p.y + t * (raised.y - p.y)),
    });
  }
  const westStand =
    `M ${base.map((p) => `${p.x} ${p.y}`).join(" L ")} ` +
    `L ${[...crest].reverse().map((p) => `${p.x} ${p.y}`).join(" L ")} Z`;
  const westRibs = base
    .filter((_, i) => i % 3 === 0)
    .map((p, i) => ({ x: p.x, y: p.y, top: crest[i * 3].y }));

  return (
    <g>
      <path d={facadePath()} fill={`url(#shell-${uid})`} />
      <path d={ringPath()} fillRule="evenodd" fill={`url(#shell-${uid})`} />
      <Pitch uid={uid} scene={scene} />

      {/* المدرّج الغربي الدائم: كتلة مصمتة تعلو على ثلث الحلقة وتنحدر عند طرفيها */}
      <path d={westStand} fill={scene.shellLit} />
      <path d={westStand} fill="none" stroke={scene.accent} strokeWidth={2} opacity="0.5" />
      {/* أعمدة الواجهة تحت المدرّج */}
      {westRibs.map((p) => (
        <line
          key={p.x}
          x1={p.x}
          y1={p.y}
          x2={p.x}
          y2={p.top}
          stroke={scene.light}
          strokeWidth={1.1}
          opacity="0.2"
        />
      ))}

      <Floodlights uid={uid} scene={scene} />
    </g>
  );
}

const FORMS: Record<FormKind, (p: { uid: string; scene: StadiumScene }) => React.JSX.Element> = {
  seed: SeedForm,
  tent: TentForm,
  jewel: JewelForm,
  dawwama: DawwamaForm,
  cliffcubes: CliffCubesForm,
  line: LineForm,
  ripple: RippleForm,
  highland: HighlandForm,
};

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
  const Form = FORMS[scene.form];

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
          <stop offset="0%" stopColor={scene.light} stopOpacity="0.5" />
          <stop offset="60%" stopColor={scene.light} stopOpacity="0.18" />
          <stop offset="100%" stopColor={scene.light} stopOpacity="0" />
        </radialGradient>

        {/* العشب تحت الكشّافات: أخضر مضاء في الوسط يعتم عند الحواف */}
        <radialGradient id={`turf-${uid}`} cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor="#7fd97a" />
          <stop offset="55%" stopColor="#3f9c52" />
          <stop offset="100%" stopColor="#1d5c38" />
        </radialGradient>

        <linearGradient id={`shell-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.shellLit} />
          <stop offset="100%" stopColor={scene.shell} />
        </linearGradient>

        {/* واجهة «ذا لاين» المرآتية: السماء تنعكس عليها فتتدرّج رأسياً */}
        <linearGradient id={`mirror-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.sky[1]} stopOpacity="0.96" />
          <stop offset="45%" stopColor={scene.shellLit} stopOpacity="0.9" />
          <stop offset="100%" stopColor={scene.sky[2]} stopOpacity="0.82" />
        </linearGradient>

        <linearGradient id={`haze-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={scene.sky[2]} stopOpacity="0" />
          <stop offset="100%" stopColor={scene.sky[0]} stopOpacity="0.92" />
        </linearGradient>

        <clipPath id={`bowl-${uid}`}>
          <ellipse cx={CX} cy={ICY} rx={IRX} ry={IRY} />
        </clipPath>
        <clipPath id={`cube-${uid}`}>
          <rect x={CX - 280} y={392} width={560} height={150} />
        </clipPath>
        <clipPath id={`slot-${uid}`}>
          <rect x={CX - 296} y={334} width={592} height={222} rx="8" />
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
        <Form uid={uid} scene={scene} />
      </g>

      <rect y="640" width="1600" height="260" fill={`url(#haze-${uid})`} />
    </svg>
  );
}
