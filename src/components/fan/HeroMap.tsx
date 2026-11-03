"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { OUTLINE_PATH, project } from "@/components/fan/SaudiMap";
import { venueCity, venueName, type Match, type Venue } from "@/lib/catalog";
import { useLocale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/*  خريطة الواجهة                                                              */
/*                                                                             */
/*  كل مدينة مستضيفة تحمل رمزاً يعرفه من زارها: برج المملكة للرياض، ونافورة      */
/*  الملك فهد لجدة، والداو للخبر (تراث الخليج وبحره)، وبيت عسير التراثي لأبها،    */
/*  و«ذا لاين» لنيوم. الرموز مرسومة هنا خطوطاً بسيطة لا صوراً منسوخة.            */
/* -------------------------------------------------------------------------- */

type Kind = "tower" | "fountain" | "dhow" | "house" | "line";

interface Landmark {
  match: string;
  kind: Kind;
  lat: number;
  lng: number;
  ar: string;
  en: string;
  color: string;
}

const LANDMARKS: Landmark[] = [
  { match: "riyadh", kind: "tower", lat: 24.71, lng: 46.67, ar: "برج المملكة", en: "Kingdom Centre", color: "#d99a1e" },
  { match: "jeddah", kind: "fountain", lat: 21.54, lng: 39.17, ar: "نافورة الملك فهد", en: "King Fahd's Fountain", color: "#0f9fb0" },
  { match: "khobar", kind: "dhow", lat: 26.28, lng: 50.2, ar: "الداو الخليجي", en: "The Gulf dhow", color: "#2f6fe0" },
  { match: "abha", kind: "house", lat: 18.22, lng: 42.5, ar: "بيت عسير التراثي", en: "Asiri heritage house", color: "#2e9d5b" },
  { match: "neom", kind: "line", lat: 28.0, lng: 35.2, ar: "ذا لاين", en: "The Line", color: "#7c4dff" },
];

const GOLD = "#8a5a1e";
const INK = "#2a0f45";

/** الرمز داخل صندوق −20..20 حول نقطة الصفر */
function Glyph({ kind, fill, cut }: { kind: Kind; fill: string; cut: string }) {
  switch (kind) {
    case "tower":
      return (
        <g>
          <path d="M-7 16 V-11 Q-7 -19 0 -19 Q7 -19 7 -11 V16 Z" fill={fill} />
          <path d="M-3.6 -10 Q0 -2 3.6 -10 Z" fill={cut} />
          <path d="M-7 -4 H7" stroke={cut} strokeWidth="1.4" />
        </g>
      );
    case "fountain":
      return (
        <g fill="none" stroke={fill} strokeLinecap="round">
          <path d="M0 14 V-15" strokeWidth="3" />
          <path d="M0 -15 Q-10 -13 -13 2" strokeWidth="2" />
          <path d="M0 -15 Q10 -13 13 2" strokeWidth="2" />
          <path d="M0 -15 Q-5 -9 -6.5 4" strokeWidth="2" />
          <path d="M0 -15 Q5 -9 6.5 4" strokeWidth="2" />
          <path d="M-16 15 q4 -4 8 0 t8 0 t8 0 t8 0" strokeWidth="2" />
        </g>
      );
    case "dhow":
      return (
        <g>
          <path d="M-16 7 H16 L11 14 H-11 Z" fill={fill} />
          <path d="M0 7 V-17" stroke={fill} strokeWidth="2" />
          <path d="M1.5 -16 L15 5 H1.5 Z" fill={fill} />
          <path d="M-1.5 -10 L-12 5 H-1.5 Z" fill={fill} />
        </g>
      );
    case "house":
      return (
        <g>
          <path d="M-14 16 V4 H14 V16 Z" fill={fill} />
          <path d="M-10 4 V-6 H10 V4 Z" fill={fill} />
          <path d="M-6 -6 V-14 H-3.5 V-16 H-1 V-14 H1 V-16 H3.5 V-14 H6 V-6 Z" fill={fill} />
          <path d="M-14 10 H14 M-10 -1 H10" stroke={cut} strokeWidth="1.3" />
          <rect x="-3.2" y="-12" width="2.4" height="3.6" fill={cut} />
          <rect x="1" y="-12" width="2.4" height="3.6" fill={cut} />
          <rect x="-1.2" y="9" width="2.4" height="7" fill={cut} />
        </g>
      );
    case "line":
      return (
        <g>
          <rect x="-14" y="-17" width="9" height="34" rx="1" fill={fill} />
          <rect x="5" y="-17" width="9" height="34" rx="1" fill={fill} />
          <path d="M-14 0 H-5 M5 0 H14" stroke={cut} strokeWidth="1.2" />
        </g>
      );
  }
}

interface City {
  key: string;
  lm: Landmark;
  venues: Venue[];
  matches: number;
}

export default function HeroMap({ venues, matches }: { venues: Venue[]; matches: Match[] }) {
  const { locale } = useLocale();
  const ar = locale === "ar";

  const cities = useMemo<City[]>(() => {
    const out: City[] = [];
    for (const lm of LANDMARKS) {
      const vs = venues.filter((v) => v.cityEn.toLowerCase().includes(lm.match));
      if (vs.length === 0) continue;
      const ids = new Set(vs.map((v) => v.id));
      out.push({
        key: lm.match,
        lm,
        venues: vs,
        matches: matches.filter((m) => ids.has(m.venueId)).length,
      });
    }
    return out;
  }, [venues, matches]);

  const [picked, setPicked] = useState<string | null>(null);
  const active = cities.find((c) => c.key === picked) ?? cities[0];

  if (cities.length === 0 || !active) return null;

  return (
    <div className="mx-auto w-full max-w-lg">
      <svg viewBox="-24 -14 488 408" className="h-auto w-full" role="group" aria-label={ar ? "خريطة المدن المستضيفة" : "Host cities map"}>
        <defs>
          <linearGradient id="hm-land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ecc891" />
            <stop offset="100%" stopColor="#c98f55" />
          </linearGradient>
          {/* الخريطة ملعبٌ في الأصل: خطوط الكرة تُقصّ على حدود المملكة */}
          <clipPath id="hm-clip">
            <path d={OUTLINE_PATH} />
          </clipPath>
          <filter id="hm-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#6b4b91" floodOpacity="0.4" />
          </filter>
        </defs>

        <path d={OUTLINE_PATH} fill="url(#hm-land)" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" filter="url(#hm-glow)" />
        <g clipPath="url(#hm-clip)" fill="none" stroke="#ffffff" strokeWidth="1.8" opacity="0.4">
          <line x1="226" y1="-10" x2="226" y2="390" />
          <circle cx="226" cy="190" r="58" />
          <circle cx="226" cy="190" r="3" fill="#ffffff" />
          <rect x="-10" y="110" width="78" height="160" />
          <rect x="384" y="110" width="78" height="160" />
        </g>

        {cities.map((c) => {
          const { x, y } = project(c.lm.lat, c.lm.lng);
          const on = c.key === active.key;
          const label = venueCity(c.venues[0], locale);
          return (
            <g
              key={c.key}
              transform={`translate(${x} ${y})`}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`${label} — ${ar ? c.lm.ar : c.lm.en}`}
              className="hero-pin"
              onClick={() => setPicked(c.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPicked(c.key);
                }
              }}
            >
              {on && <circle r="27" fill="none" stroke="#ffffff" strokeWidth="2.5" className="hero-pin-pulse" />}
              <circle r={on ? 31 : 27} fill={c.lm.color} stroke="#ffffff" strokeWidth={on ? 4 : 3} />
              <g transform={`scale(${on ? 0.86 : 0.76})`}>
                <Glyph kind={c.lm.kind} fill="#ffffff" cut={c.lm.color} />
              </g>
              <text
                y={on ? 54 : 48}
                textAnchor="middle"
                fontSize={on ? 20 : 18}
                fontWeight="800"
                fill="#2b1b4d"
                stroke="#ffffff"
                strokeWidth="4.5"
                paintOrder="stroke"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 rounded-2xl border border-white/80 bg-white/70 p-4 text-[#2b1b4d] shadow-[0_8px_30px_rgba(107,75,145,0.18)] backdrop-blur" aria-live="polite">
        <p className="text-[11px] uppercase tracking-[0.14em]" style={{ color: GOLD }}>
          {ar ? c(active).ar : c(active).en}
        </p>
        <p className="mt-1 text-lg font-bold">{venueCity(active.venues[0], locale)}</p>
        <p className="nums mt-1 text-xs text-[#2b1b4d]/70">
          {ar
            ? `${active.venues.length} ${active.venues.length === 1 ? "ملعب" : "ملاعب"} · ${active.matches} مباراة`
            : `${active.venues.length} ${active.venues.length === 1 ? "stadium" : "stadiums"} · ${active.matches} matches`}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {active.venues.map((v) => (
            <li key={v.id}>
              <Link
                href={`/venues/${v.id}`}
                className="inline-block rounded-full border border-[#2b1b4d]/25 px-3 py-1.5 text-xs font-semibold text-[#2b1b4d] transition hover:bg-white/60"
              >
                {venueName(v, locale)} ←
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const c = (city: City) => city.lm;
