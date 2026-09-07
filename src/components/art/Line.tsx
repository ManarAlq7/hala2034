/* -------------------------------------------------------------------------- */
/*  رسوم خطّية                                                                 */
/*                                                                             */
/*  هوية كرة قدم بخطٍّ واحد: لا صور واقعية ولا رسوم كرتونية. كلها مفرّغة          */
/*  بلا تعبئة، بعرض خطّ واحد ونهايات مدوّرة، وبلون `currentColor` — فتأخذ لون      */
/*  محيطها ولا تفرض لوناً على النظام.                                            */
/*                                                                             */
/*  والقاعدة في استعمالها: قليلة. الرسم هنا يعطي المشروع هويةً، ولا ينافس        */
/*  البيانات. لوحة عمليات مزدحمة بالرسوم تفقد ما بُنيت له.                        */
/*                                                                             */
/*  ولا شيء منها مأخوذ عن علامة رسمية — لا فيفا ولا كأس العالم. أشكال عامة       */
/*  لكرة القدم، والهوية لهلا وحدها.                                             */
/* -------------------------------------------------------------------------- */

interface ArtProps {
  className?: string;
  /** عرض الخط — يُرفع للرسوم الصغيرة ويُخفض للكبيرة الخافتة */
  weight?: number;
}

const base = (weight = 4) => ({
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: weight,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/* ---------------------------- لاعب يركض بالكرة ---------------------------- */

export function PlayerRunning({ className, weight = 4 }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g {...base(weight)}>
        <circle cx="120" cy="36" r="14" />
        {/* الجذع مائل للأمام — الميل هو ما يجعل الوقفة ركضاً لا وقوفاً */}
        <path d="M116 52 L102 104" />
        {/* الذراعان: أمامية مرفوعة وخلفية ممتدة */}
        <path d="M110 66 L142 76 L152 58" />
        <path d="M110 66 L80 82 L70 64" />
        {/* الساقان في خطوة */}
        <path d="M102 104 L126 128 L142 152" />
        <path d="M102 104 L78 124 L58 112" />
        {/* الكرة عند القدم الأمامية */}
        <circle cx="164" cy="164" r="18" />
        <path d="M156 158 L168 152 L174 162" />
      </g>
    </svg>
  );
}

/* ------------------------------ لاعب يسدّد ------------------------------ */

export function PlayerShooting({ className, weight = 4 }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g {...base(weight)}>
        <circle cx="92" cy="34" r="14" />
        <path d="M92 48 L86 100" />
        {/* الذراعان مفتوحتان للتوازن */}
        <path d="M88 62 L58 54" />
        <path d="M88 62 L116 74" />
        {/* الساق الضاربة ممتدة، والثابتة تحمل */}
        <path d="M86 100 L120 112 L152 106" />
        <path d="M86 100 L74 132 L78 162" />
        <circle cx="174" cy="112" r="16" />
        {/* خطّا حركة: الكرة انطلقت للتوّ */}
        <path d="M150 88 L162 82" opacity="0.55" />
        <path d="M154 136 L166 142" opacity="0.55" />
      </g>
    </svg>
  );
}

/* -------------------------------- المرمى -------------------------------- */

export function Goal({ className, weight = 4 }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <g {...base(weight)}>
        <path d="M24 116 L24 34 L176 34 L176 116" />
        {/* الشبكة: خطوط قليلة تكفي — الشبكة الكاملة تصير نسيجاً لا رسماً */}
        <g opacity="0.45" strokeWidth={weight * 0.55}>
          <path d="M62 34 L62 116 M100 34 L100 116 M138 34 L138 116" />
          <path d="M24 62 L176 62 M24 90 L176 90" />
        </g>
        <path d="M8 116 L192 116" />
      </g>
    </svg>
  );
}

/* ----------------------------- خطوط الملعب ----------------------------- */

export function PitchLines({ className, weight = 3 }: ArtProps) {
  return (
    <svg viewBox="0 0 400 120" className={className} aria-hidden="true" preserveAspectRatio="none">
      <g {...base(weight)}>
        <path d="M0 10 L400 10 M0 110 L400 110" />
        <path d="M200 10 L200 110" />
        <circle cx="200" cy="60" r="34" />
        <path d="M0 34 L44 34 L44 86 L0 86" />
        <path d="M400 34 L356 34 L356 86 L400 86" />
      </g>
    </svg>
  );
}

/* ------------------------------- المدرّجات ------------------------------- */

export function Crowd({ className, weight = 4 }: ArtProps) {
  const rows = [
    { y: 108, r: 9, gap: 30, offset: 16 },
    { y: 84, r: 8, gap: 28, offset: 30 },
    { y: 62, r: 7, gap: 26, offset: 18 },
  ];

  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <g {...base(weight)}>
        {rows.map((row) => (
          <g key={row.y} opacity={row.y === 108 ? 1 : 0.6}>
            {Array.from({ length: Math.floor((200 - row.offset) / row.gap) + 1 }, (_, i) => {
              const x = row.offset + i * row.gap;
              return (
                <g key={x}>
                  <circle cx={x} cy={row.y} r={row.r * 0.5} />
                  <path
                    d={`M${x - row.r} ${row.y + row.r * 1.9} a ${row.r} ${row.r} 0 0 1 ${row.r * 2} 0`}
                  />
                </g>
              );
            })}
          </g>
        ))}
        {/* حافّة المدرّج */}
        <path d="M4 128 L196 128" />
      </g>
    </svg>
  );
}

/* -------------------------------- الأعلام -------------------------------- */

export function Flags({ className, weight = 4 }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <g {...base(weight)}>
        {/* أعلام عامّة بلا انتماء: الشكل وحده، فلا يُنسب الرسم لدولة */}
        <path d="M44 128 L44 24" />
        <path d="M44 30 L104 44 L44 62" />
        <path d="M120 128 L120 44" />
        <path d="M120 50 L166 60 L120 76" />
        <path d="M20 128 L180 128" />
      </g>
    </svg>
  );
}

/* -------------------------------- التذكرة -------------------------------- */

export function Ticket({ className, weight = 4 }: ArtProps) {
  return (
    <svg viewBox="0 0 200 120" className={className} aria-hidden="true">
      <g {...base(weight)}>
        {/* القصّتان هما ما يجعل المستطيل تذكرة */}
        <path d="M20 24 L128 24 L128 40 a 10 10 0 0 0 0 40 L128 96 L20 96 L20 80 a 10 10 0 0 0 0 -40 Z" />
        <path d="M128 24 L180 24 L180 96 L128 96" />
        <path d="M148 44 L162 44 M148 60 L166 60 M148 76 L158 76" opacity="0.6" />
        <circle cx="74" cy="60" r="16" />
        <path d="M64 54 L78 48 L86 60" />
      </g>
    </svg>
  );
}

/* ----------------------------- بوابة الاستاد ----------------------------- */

export function StadiumGate({ className, weight = 4 }: ArtProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true">
      <g {...base(weight)}>
        {/* قوس الاستاد */}
        <path d="M16 124 L16 72 a 84 60 0 0 1 168 0 L184 124" />
        {/* البوابة نفسها */}
        <path d="M74 124 L74 82 a 26 26 0 0 1 52 0 L126 124" />
        {/* البوّابات الدوّارة على الجانبين */}
        <path d="M38 124 L38 100 M52 112 L24 112" opacity="0.6" />
        <path d="M162 124 L162 100 M176 112 L148 112" opacity="0.6" />
        <path d="M4 124 L196 124" />
      </g>
    </svg>
  );
}

/* --------------------------- مسار المنصّة --------------------------- */

/** المشجّع — رأس وكتفان، وأصغر من أن يُقرأ صورةً شخصية */
export function IconFan({ className, weight = 5 }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g {...base(weight)}>
        <circle cx="50" cy="34" r="16" />
        <path d="M20 82 a 30 30 0 0 1 60 0" />
      </g>
    </svg>
  );
}

/** البلاغ — فقاعة كلام فيها سطران */
export function IconFeedback({ className, weight = 5 }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g {...base(weight)}>
        <path d="M18 26 h64 a 8 8 0 0 1 8 8 v34 a 8 8 0 0 1 -8 8 H44 L28 88 V76 H18 a 8 8 0 0 1 -8 -8 V34 a 8 8 0 0 1 8 -8 Z" />
        <path d="M28 44 h44 M28 58 h30" opacity="0.6" />
      </g>
    </svg>
  );
}

/** الذكاء — عُقد تتصل ببعضها، لا دماغ ولا شرارة */
export function IconAI({ className, weight = 5 }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g {...base(weight)}>
        <circle cx="50" cy="24" r="9" />
        <circle cx="22" cy="70" r="9" />
        <circle cx="78" cy="70" r="9" />
        <circle cx="50" cy="52" r="9" />
        <path d="M50 33 L50 43 M43 58 L29 64 M57 58 L71 64" opacity="0.7" />
      </g>
    </svg>
  );
}

/** العمليات — لوحة فيها عمود بياني، فالمخرَج قرار لا رسالة */
export function IconOps({ className, weight = 5 }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g {...base(weight)}>
        <path d="M14 18 h72 a 6 6 0 0 1 6 6 v52 a 6 6 0 0 1 -6 6 H14 a 6 6 0 0 1 -6 -6 V24 a 6 6 0 0 1 6 -6 Z" />
        <path d="M28 66 V50 M50 66 V36 M72 66 V56" />
      </g>
    </svg>
  );
}
