"use client";

import Link from "next/link";
import { useMemo } from "react";
import HeroMap from "@/components/fan/HeroMap";
import StadiumArt, { sceneFor } from "@/components/fan/StadiumArt";
import StadiumGate from "@/components/fan/StadiumGate";
import {
  matchAway,
  matchHome,
  matchStage,
  remaining,
  useCatalog,
  venueCity,
  venueName,
  zoneCity,
  zoneName,
  type Match,
  type Venue,
} from "@/lib/catalog";
import { useNow } from "@/lib/clock";
import { countdown, matchDate, matchDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

/**
 * واجهة الحدث.
 *
 * ترتيب الصفحة يتبع ما يسأل عنه المشجّع بالترتيب: متى المباراة، أين ألعب،
 * أين أشاهد مع الناس، وكيف أبلّغ إن حدث شيء. البلاغ آخر القائمة لا أولها —
 * فأكثر من يفتح الصفحة جاء لحضور مباراة لا للشكوى.
 */
export default function LandingPage() {
  const { t, locale } = useLocale();
  const { venues, matches, tiers, zones, status } = useCatalog();
  const now = useNow();

  const venueById = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);
  const upcoming = useMemo(() => matches.slice(0, 8), [matches]);
  const cities = useMemo(() => new Set(venues.map((v) => v.cityEn)).size, [venues]);
  const flags = useMemo(
    () => [
      ...new Set(
        matches
          .flatMap((m) => [m.homeFlag, m.awayFlag])
          .filter((f) => /^\p{Regional_Indicator}{2}$/u.test(f)),
      ),
    ],
    [matches],
  );

  const seatsLeft = useMemo(
    () => tiers.reduce((total, tier) => total + remaining(tier), 0),
    [tiers],
  );

  return (
    <div className="landing-bg">
      {/* البوابة تسبق كل شيء، وتنزاح عن الصفحة بعد أوّل تفاعل */}
      <StadiumGate venues={venues} />

      {/* ------------------------------- الواجهة ------------------------------- */}
      <section className="hero-night relative overflow-hidden border-b border-line text-[#2b1b4d]">
        <div className="hero-night-lines" aria-hidden="true" />
        {/* كثبان ثلاث طبقات تنزل بالأسفل */}
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 w-full"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 120 C220 60 420 150 700 100 C980 50 1200 130 1440 80 V180 H0 Z" fill="#ecd9b4" opacity="0.6" />
          <path d="M0 150 C260 100 480 170 760 130 C1040 90 1240 160 1440 120 V180 H0 Z" fill="#e4cd9f" opacity="0.85" />
          <path d="M0 172 C300 140 560 180 820 160 C1080 140 1260 176 1440 156 V180 H0 Z" fill="#f2e6d2" />
        </svg>
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <span className="chip border-[#2b1b4d]/25 bg-white/50 text-[#2b1b4d]">{t("land.badge")}</span>
            <h1 className="mt-5 max-w-4xl text-[2.15rem] font-bold leading-[1.08] tracking-tight text-[#2b1b4d] sm:text-6xl lg:text-6xl">
              {t("land.title")}
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#2b1b4d]/75 sm:text-lg">
              {t("land.subtitle")}
            </p>

            <div className="mt-9 flex flex-wrap gap-2.5">
              <Link href="/tickets" className="btn btn-primary px-5 py-3">
                {t("land.ctaTickets")}
              </Link>
              <Link href="/report" className="btn px-5 py-3 border border-[#2b1b4d]/35 text-[#2b1b4d] hover:bg-white/40">
                {t("land.ctaReport")}
              </Link>
            </div>

            {status === "ready" && (
              <dl className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-[#2b1b4d]/15 border-t border-[#2b1b4d]/15 pt-7 rtl:divide-x-reverse">
                <Stat value={matches.length} label={t("land.upcoming")} light />
                <Stat value={venues.length} label={t("land.venues")} light />
                <Stat value={cities} label={t("land.cities")} light />
              </dl>
            )}
          </div>

          {/* المدن المستضيفة على خريطة المملكة، لكل مدينة رمزها */}
          {status === "ready" && <HeroMap venues={venues} matches={matches} />}
        </div>

        {/* أعلام المنتخبات: المونديال للعالم كله، والمملكة تستضيفه */}
        {flags.length > 0 && (
          <div className="relative py-4">
            <div className="marquee-hold marquee-mask overflow-hidden">
              <div className="marquee-track gap-6">
                {[0, 1].map((pass) => (
                  <div key={pass} className="flex gap-6 pe-6" aria-hidden="true">
                    {flags.map((f) => (
                      <span
                        key={`${pass}-${f}`}
                        className="rounded-full border border-[#2b1b4d]/20 bg-white/45 px-4 py-1.5 text-lg font-semibold leading-none tracking-wide text-[#2b1b4d]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* --------------------------- شريط المباريات --------------------------- */}
      {upcoming.length > 0 && (
        <section className="border-b border-[#2b1b4d]/10 py-5">
          {/* عنوان صغير يجعل الشريط معلومةً لا زخرفةً متحرّكة */}
          <p className="mx-auto mb-3 max-w-5xl px-5 text-[10px] uppercase tracking-[0.16em] text-text-dim">
            {t("land.upcoming")}
          </p>
          <div className="marquee-hold marquee-mask overflow-hidden">
            <div className="marquee-track gap-3">
              {/* التكرار مرّتان هو ما يجعل الدورة متصلة بلا قفزة */}
              {[0, 1].map((pass) => (
                <div key={pass} className="flex gap-3 pe-3" aria-hidden={pass === 1}>
                  {upcoming.map((m) => (
                    <TickerCard
                      key={`${pass}-${m.id}`}
                      match={m}
                      venue={venueById.get(m.venueId)}
                      now={now}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-5xl space-y-14 px-5 py-14">
        {status === "loading" && (
          <p className="py-10 text-center text-sm text-text-dim">{t("common.loading")}</p>
        )}

        {/* ------------------------------ المباريات ------------------------------ */}
        {upcoming.length > 0 && (
          <section>
            <SectionHead
              title={t("land.upcoming")}
              note={t("land.demoData")}
              action={{ href: "/matches", label: t("land.viewAll") }}
            />
            <ul className="grid gap-3 sm:grid-cols-2">
              {upcoming.slice(0, 4).map((m) => {
                const venue = venueById.get(m.venueId);
                const left = countdown(m.kickoff, now, locale);
                const started = m.kickoff <= now;
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

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Side flag={m.homeFlag} name={matchHome(m, locale)} />
                      <span className="text-xs font-bold text-text-dim">—</span>
                      <Side flag={m.awayFlag} name={matchAway(m, locale)} align="end" />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[11px] text-text-muted">
                      <span>{venue ? venueName(venue, locale) : ""}</span>
                      <span className="chip chip-neutral">
                        {started ? (
                          t("land.started")
                        ) : left ? (
                          <>
                            {t("land.kickoffIn")} <span className="nums">{left}</span>
                          </>
                        ) : (
                          <span className="nums">{matchDate(m.kickoff, locale)}</span>
                        )}
                      </span>
                    </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ------------------------------- الملاعب ------------------------------- */}
        {venues.length > 0 && (
          <section>
            <SectionHead title={t("land.venues")} />
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {venues.map((v, i) => (
                <li key={v.id}>
                  <Link href={`/venues/${v.id}`} className="card card-link block h-full overflow-hidden">
                  {/* الرسم نفسه الذي ظهر في البوابة — كي تُعرف الملاعب حين تعود */}
                  <div className="aspect-[16/8] overflow-hidden border-b border-line bg-surface-3">
                    <StadiumArt
                      scene={sceneFor(v.id, i)}
                      uid={`card-${v.id}`}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-brand">
                      {venueCity(v, locale)}
                    </p>
                    <p className="mt-1.5 font-bold leading-snug text-text">{venueName(v, locale)}</p>
                    <p className="nums mt-2 text-[11px] text-text-dim">
                      {v.capacity.toLocaleString("en-US")} · {t("land.capacityApprox")}
                    </p>
                  </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --------------------------- مناطق المشجعين --------------------------- */}
        {zones.length > 0 && (
          <section>
            <SectionHead
              title={t("land.zones")}
              action={{ href: "/fan-zones", label: t("land.viewAll") }}
            />
            <ul className="grid gap-3 sm:grid-cols-3">
              {zones.slice(0, 3).map((z) => (
                <li key={z.id}>
                  {/* المنطقة تُفتح من هنا أيضاً: بطاقة لا تُنقر تُعلّم الزائر ألّا ينقر */}
                  <Link href={`/fan-zones/${z.id}`} className="card card-link block h-full p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-brand">
                      {zoneCity(z, locale)}
                    </p>
                    <p className="mt-1.5 font-bold leading-snug text-text">{zoneName(z, locale)}</p>
                    <p className="nums mt-2 text-[11px] text-text-dim">
                      {t("fz.opens")} {z.opensAt}–{z.closesAt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* -------------------------------- البلاغ -------------------------------- */}
        <section className="card overflow-hidden">
          <div className="aura p-6 sm:p-8">
            <h2 className="text-lg font-bold text-text sm:text-xl">{t("land.reportTitle")}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
              {t("land.reportBody")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/report" className="btn btn-primary">
                {t("land.ctaReport")}
              </Link>
              <Link href="/track" className="btn btn-ghost">
                {t("nav.track")}
              </Link>
            </div>
          </div>
        </section>

        {status === "ready" && seatsLeft > 0 && (
          <p className="text-center text-[11px] text-text-dim">{t("tk.demoNote")}</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- قطع الصفحة ------------------------------- */

function Stat({ value, label, light = false }: { value: number; label: string; light?: boolean }) {
  return (
    <div className="px-4 first:ps-0 last:pe-0">
      <dt className={`nums text-3xl font-bold tracking-tight sm:text-4xl ${light ? "text-[#2b1b4d]" : "text-text"}`}>{value}</dt>
      <dd className={`mt-1 text-[11px] uppercase tracking-[0.12em] ${light ? "text-[#2b1b4d]/60" : "text-text-dim"}`}>{label}</dd>
    </div>
  );
}

function Side({ flag, name, align = "start" }: { flag: string; name: string; align?: "start" | "end" }) {
  return (
    <span
      className={`flex min-w-0 flex-1 items-center gap-2 ${align === "end" ? "flex-row-reverse text-end" : ""}`}
    >
      <span aria-hidden className="text-2xl leading-none">
        {flag}
      </span>
      <span className="truncate text-[15px] font-bold leading-snug text-text">{name}</span>
    </span>
  );
}

function SectionHead({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <h2 className="text-xl font-bold tracking-tight text-text sm:text-2xl">{title}</h2>
        {note && <span className="chip chip-neutral">{note}</span>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-xs font-semibold text-text-muted transition hover:text-brand"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

function TickerCard({ match, venue, now }: { match: Match; venue?: Venue; now: number }) {
  const { t, locale } = useLocale();
  const left = countdown(match.kickoff, now, locale);
  const started = match.kickoff <= now;

  return (
    <div className="card-2 w-72 shrink-0 px-4 py-3.5">
      <p className="truncate text-[10px] uppercase tracking-[0.14em] text-brand">
        {venue ? venueCity(venue, locale) : ""} · {matchStage(match, locale)}
      </p>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-text">
        <span aria-hidden>{match.homeFlag}</span>
        <span className="truncate">{matchHome(match, locale)}</span>
        <span className="text-text-dim">·</span>
        <span aria-hidden>{match.awayFlag}</span>
        <span className="truncate">{matchAway(match, locale)}</span>
      </p>
      <p className="nums mt-1 text-[11px] text-text-muted">
        {started
          ? t("land.started")
          : left
            ? `${t("land.kickoffIn")} ${left}`
            : matchDateTime(match.kickoff, locale)}
      </p>
    </div>
  );
}
