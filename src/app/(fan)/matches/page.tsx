"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PageHero from "@/components/fan/PageHero";
import {
  matchAway,
  matchHome,
  matchStage,
  useCatalog,
  venueCity,
  venueName,
} from "@/lib/catalog";
import { matchDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

/**
 * جدول المباريات كاملاً.
 *
 * الرئيسية تعرض أقرب أربع مباريات فقط. هنا كل ما في الدليل، ويُصفّى بالمدينة
 * وباليوم، ويُجمع حسب اليوم ليقرأه المشجّع كجدول لا كقائمة طويلة.
 */

const ALL = "all";

/** مفتاح اليوم بتوقيت المملكة، ثابتاً مهما كان توقيت جهاز الزائر */
const dayKey = (ts: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date(ts));

const dayLabel = (ts: number, locale: string) =>
  new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
    timeZone: "Asia/Riyadh",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(ts));

export default function MatchesPage() {
  const { locale } = useLocale();
  const ar = locale === "ar";
  const { venues, matches, status } = useCatalog();

  const [city, setCity] = useState<string>(ALL);
  const [day, setDay] = useState<string>(ALL);

  const venueById = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);

  /* مدن الدليل بترتيب ظهورها، لكل مدينة وجهها بلغة العرض */
  const cities = useMemo(() => {
    const seen = new Map<string, string>();
    for (const v of venues) if (!seen.has(v.cityEn)) seen.set(v.cityEn, venueCity(v, locale));
    return [...seen.entries()].map(([key, label]) => ({ key, label }));
  }, [venues, locale]);

  const sorted = useMemo(() => [...matches].sort((a, b) => a.kickoff - b.kickoff), [matches]);

  /* المدينة تُصفّي الأيام أيضاً، فلا يُعرض يوم لا مباراة فيه بعد التصفية */
  const inCity = useMemo(
    () =>
      sorted.filter((m) => city === ALL || venueById.get(m.venueId)?.cityEn === city),
    [sorted, city, venueById],
  );

  const days = useMemo(() => {
    const seen = new Map<string, number>();
    for (const m of inCity) {
      const k = dayKey(m.kickoff);
      if (!seen.has(k)) seen.set(k, m.kickoff);
    }
    return [...seen.entries()].map(([key, ts]) => ({ key, ts }));
  }, [inCity]);

  const shown = useMemo(
    () => inCity.filter((m) => day === ALL || dayKey(m.kickoff) === day),
    [inCity, day],
  );

  const groups = useMemo(() => {
    const out: { key: string; ts: number; items: typeof shown }[] = [];
    for (const m of shown) {
      const k = dayKey(m.kickoff);
      const last = out[out.length - 1];
      if (last && last.key === k) last.items.push(m);
      else out.push({ key: k, ts: m.kickoff, items: [m] });
    }
    return out;
  }, [shown]);

  const chip = (on: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
      on
        ? "border-brand bg-brand text-white"
        : "border-line bg-surface text-text-muted hover:border-brand hover:text-brand"
    }`;

  return (
    <>
      <PageHero
        back={{ href: "/", label: ar ? "الرئيسية" : "Home" }}
        eyebrow={ar ? "الجدول" : "Schedule"}
        title={ar ? "جدول المباريات" : "Match schedule"}
        lead={
          ar
            ? "كل المباريات في المدن المستضيفة. صفّيها بالمدينة أو باليوم، وافتح أي مباراة لحجز تذكرتك."
            : "Every fixture across the host cities. Filter by city or day, and open any match to book."
        }
        pills={
          status === "ready"
            ? [{ label: ar ? `${matches.length} مباراة` : `${matches.length} matches`, nums: true }]
            : []
        }
      />

      <div className="mx-auto max-w-5xl space-y-6 px-5 py-10">
        {status === "loading" && (
          <p className="py-10 text-center text-sm text-text-dim">{ar ? "جارٍ التحميل…" : "Loading…"}</p>
        )}
        {status === "unavailable" && (
          <p className="py-10 text-center text-sm text-text-dim">
            {ar ? "الجدول غير متاح الآن." : "The schedule isn't available right now."}
          </p>
        )}

        {status === "ready" && (
          <>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label={ar ? "المدينة" : "City"}>
                <button
                  type="button"
                  className={chip(city === ALL)}
                  aria-pressed={city === ALL}
                  onClick={() => {
                    setCity(ALL);
                    setDay(ALL);
                  }}
                >
                  {ar ? "كل المدن" : "All cities"}
                </button>
                {cities.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={chip(city === c.key)}
                    aria-pressed={city === c.key}
                    onClick={() => {
                      setCity(c.key);
                      setDay(ALL);
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2" role="group" aria-label={ar ? "اليوم" : "Day"}>
                <button
                  type="button"
                  className={chip(day === ALL)}
                  aria-pressed={day === ALL}
                  onClick={() => setDay(ALL)}
                >
                  {ar ? "كل الأيام" : "All days"}
                </button>
                {days.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={`${chip(day === d.key)} nums`}
                    aria-pressed={day === d.key}
                    onClick={() => setDay(d.key)}
                  >
                    {new Intl.DateTimeFormat(ar ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB", {
                      timeZone: "Asia/Riyadh",
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    }).format(new Date(d.ts))}
                  </button>
                ))}
              </div>
            </div>

            {groups.length === 0 && (
              <p className="py-10 text-center text-sm text-text-dim">
                {ar ? "لا مباريات بهذه التصفية." : "No matches for this filter."}
              </p>
            )}

            {groups.map((g) => (
              <section key={g.key}>
                <h2 className="mb-3 text-sm font-bold text-text">{dayLabel(g.ts, locale)}</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {g.items.map((m) => {
                    const venue = venueById.get(m.venueId);
                    return (
                      <li key={m.id}>
                        <Link href={`/matches/${m.id}`} className="card card-link block h-full p-4">
                          <div className="flex items-center justify-between gap-2 text-[11px] text-text-dim">
                            <span>
                              {matchStage(m, locale)}
                              {m.group ? ` · ${m.group}` : ""}
                            </span>
                            <span className="nums">{matchDateTime(m.kickoff, locale)}</span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3 text-sm font-bold">
                            <span>{matchHome(m, locale)}</span>
                            <span className="text-xs text-text-dim">—</span>
                            <span>{matchAway(m, locale)}</span>
                          </div>
                          {venue && (
                            <p className="mt-3 border-t border-line pt-3 text-[11px] text-text-muted">
                              {venueName(venue, locale)} · {venueCity(venue, locale)}
                            </p>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </>
  );
}
