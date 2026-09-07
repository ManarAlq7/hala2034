/* لاعب يركض بالكرة نحو المرمى — رسمة الواجهة */

const SKIN = "#e9c49c";
const SKIN_DARK = "#d9ad80";
const HAIR = "#241c14";

export default function RunnerIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 440 360" className={className} aria-hidden="true">
      {/* ------------------------------ الأرضية ------------------------------ */}
      <ellipse cx="220" cy="326" rx="200" ry="26" fill="var(--brand-wash)" />
      <ellipse cx="196" cy="322" rx="62" ry="9" fill="var(--line)" opacity="0.7" />
      <ellipse cx="300" cy="320" rx="20" ry="5" fill="var(--line)" opacity="0.6" />

      {/* ------------------------------- المرمى ------------------------------- */}
      <g>
        {/* الشبكة */}
        <path d="M344 164 H430 V306 H344 Z" fill="var(--surface)" />
        <g stroke="var(--line)" strokeWidth="2" opacity="0.9">
          <path d="M366 164 V306 M388 164 V306 M410 164 V306" />
          <path d="M344 200 H430 M344 236 H430 M344 272 H430" />
        </g>
        {/* القوائم */}
        <g
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M344 306 V164 H430" />
        </g>
      </g>

      {/* ------------------------------- اللاعب ------------------------------- */}
      <g>
        {/* الساق الخلفية ممتدّة، والأمامية مرفوعة بركبة مثنيّة */}
        <g strokeLinecap="round" fill="none">
          <path d="M176 216 L138 250 L116 276" stroke={SKIN_DARK} strokeWidth="22" />
          <path d="M138 250 L116 276" stroke="var(--brand)" strokeWidth="22" />
          <path d="M108 280 L92 288" stroke="var(--text)" strokeWidth="15" />

          <path d="M196 214 L242 232 L258 268" stroke={SKIN} strokeWidth="23" />
          <path d="M242 232 L258 268" stroke="var(--brand)" strokeWidth="23" />
          <path d="M258 272 L276 282" stroke="var(--text)" strokeWidth="16" />
        </g>

        {/* الشورت */}
        <path
          d="M166 176 H206 Q214 176 213 185 L206 224 Q205 232 196 232 H186 Q178 232 178 224 L176 204 L170 224 Q168 232 160 232 H150 Q142 232 143 223 L158 184 Q160 176 166 176 Z"
          fill="var(--text)"
        />

        {/* القميص */}
        <path
          d="M170 106 Q180 100 190 100 Q202 100 210 106 L222 116 Q228 120 224 127 L214 142 Q210 148 204 145 L202 143 L206 184 Q207 192 199 192 H164 Q156 192 157 184 L163 143 L161 145 Q155 148 151 142 L141 127 Q137 120 143 116 Z"
          fill="var(--brand)"
        />
        {/* شريط الكتف */}
        <path d="M190 100 L196 190" stroke="var(--brand-strong)" strokeWidth="7" opacity="0.55" />

        {/* الذراعان */}
        <g strokeLinecap="round" fill="none">
          <path d="M152 132 L124 150 L108 138" stroke={SKIN} strokeWidth="17" />
          <path d="M214 130 L242 142 L252 122" stroke={SKIN} strokeWidth="17" />
        </g>

        {/* الرأس: شعرٌ خلف الوجه، فيُقرأ الشعر بلا رسم خصلات */}
        <circle cx="196" cy="72" r="30" fill={HAIR} />
        <circle cx="202" cy="78" r="26" fill={SKIN} />
        {/* الأذن */}
        <circle cx="182" cy="80" r="6" fill={SKIN_DARK} />
        {/* الرقبة */}
        <path d="M192 100 L196 108 L206 104 L204 96 Z" fill={SKIN_DARK} />
      </g>

      {/* -------------------------------- الكرة -------------------------------- */}
      <g>
        <circle cx="300" cy="300" r="19" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2.5" />
        <path
          d="M300 289 L309 295 L305 306 H294 L291 295 Z"
          fill="var(--brand)"
        />
      </g>
    </svg>
  );
}
