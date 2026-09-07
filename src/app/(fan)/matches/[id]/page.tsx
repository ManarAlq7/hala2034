"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  matchAway,
  matchHome,
  matchStage,
  useCatalog,
  venueCity,
  venueName,
} from "@/lib/catalog";
import { useNow } from "@/lib/clock";
import { countdown, matchDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import {
  ICONS,
  clockLabel,
  eventDetail,
  eventPlayer,
  fetchLineups,
  scoreOf,
  toggleFollow,
  useFollowing,
  useLiveEvents,
  type Lineup,
} from "@/lib/matchday";
import { askNotifyPermission } from "@/lib/notify";

/**
 * صفحة المباراة.
 *
 * ثلاثة أشياء يريدها من يتابع: النتيجة الآن، وما حدث بالترتيب، ومن يلعب.
 * والتنبيه اختيار صريح بزرّ — لا يُشترك أحد في إشعارات لأنه فتح صفحة.
 */
export default function MatchPage() {
  const params = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const { matches, venues, status } = useCatalog();
  const now = useNow();

  const match = matches.find((m) => m.id === params.id);
  const venue = match ? venues.find((v) => v.id === match.venueId) : undefined;

  const following = useFollowing(params.id);
  const { events, loaded } = useLiveEvents(params.id, following);
  const [lineups, setLineups] = useState<{ home: Lineup | null; away: Lineup | null }>({
    home: null,
    away: null,
  });

  useEffect(() => {
    let alive = true;
    void fetchLineups(params.id)
      .then((l) => {
        if (alive) setLineups(l);
      })
      .catch(() => {
        // لا تشكيلة معلنة بعد — الصفحة تعمل بدونها
      });
    return () => {
      alive = false;
    };
  }, [params.id]);

  if (status === "loading") {
    return <p className="py-24 text-center text-sm text-text-dim">{t("common.loading")}</p>;
  }

  if (!match) notFound();

  const score = scoreOf(events);
  const started = events.some((e) => e.kind === "kickoff");
  const ended = events.some((e) => e.kind === "full_time");
  const live = started && !ended;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <Link href="/tickets" className="text-[12px] font-semibold text-brand underline underline-offset-4">
        ← {t("land.upcoming")}
      </Link>

      {/* ------------------------------- النتيجة ------------------------------- */}
      <section className="card mt-4 overflow-hidden">
        <div className="border-b border-line bg-surface-2 px-5 py-3 text-center text-[11px] text-text-dim">
          {matchStage(match, locale)}
          {venue ? ` · ${venueName(venue, locale)} · ${venueCity(venue, locale)}` : ""}
        </div>

        <div className="grid grid-cols-3 items-center gap-3 p-6">
          <p className="text-center text-base font-bold leading-snug text-text sm:text-lg">
            {matchHome(match, locale)}
          </p>

          <div className="text-center">
            {started ? (
              <p className="nums text-4xl font-bold tracking-tight text-text">
                {score.home} – {score.away}
              </p>
            ) : (
              <p className="nums text-sm font-semibold text-text-muted">
                {countdown(match.kickoff, now, locale)}
              </p>
            )}
            {live && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                {t("mt.live")}
              </span>
            )}
            {ended && <p className="mt-2 text-[11px] font-semibold text-text-dim">{t("mt.ended")}</p>}
          </div>

          <p className="text-center text-base font-bold leading-snug text-text sm:text-lg">
            {matchAway(match, locale)}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="nums text-[12px] text-text-muted">{matchDateTime(match.kickoff, locale)}</p>
          <button
            type="button"
            onClick={async () => {
              const on = toggleFollow(params.id);
              // الإذن يُطلب عند الاشتراك لا عند فتح الصفحة
              if (on) await askNotifyPermission();
            }}
            className={following ? "btn btn-ghost" : "btn btn-primary"}
          >
            {following ? `🔕 ${t("mt.unfollow")}` : `🔔 ${t("mt.follow")}`}
          </button>
        </div>
      </section>

      {following && <p className="mt-2 text-center text-[11px] text-text-dim">{t("mt.followNote")}</p>}

      {/* -------------------------------- الأحداث -------------------------------- */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-text">{t("mt.timeline")}</h2>

        {!loaded && <p className="mt-3 text-sm text-text-dim">{t("common.loading")}</p>}

        {loaded && events.length === 0 && (
          <p className="card mt-3 p-8 text-center text-sm text-text-muted">{t("mt.noEvents")}</p>
        )}

        {events.length > 0 && (
          <ul className="mt-3 space-y-2">
            {[...events].reverse().map((e) => (
              <li key={e.id} className="card flex items-start gap-3 p-3.5">
                <span aria-hidden className="text-lg leading-none">
                  {ICONS[e.kind]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="nums text-[12px] font-bold text-brand">{clockLabel(e)}</span>
                    {eventPlayer(e, locale) && (
                      <span className="text-sm font-bold text-text">{eventPlayer(e, locale)}</span>
                    )}
                    {e.side && (
                      <span className="chip chip-neutral">
                        {e.side === "home" ? matchHome(match, locale) : matchAway(match, locale)}
                      </span>
                    )}
                  </span>
                  {eventDetail(e, locale) && (
                    <span className="mt-1 block text-[13px] leading-relaxed text-text-muted">
                      {eventDetail(e, locale)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------- التشكيلة ------------------------------- */}
      {(lineups.home || lineups.away) && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-text">{t("mt.lineups")}</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <LineupCard title={matchHome(match, locale)} lineup={lineups.home} />
            <LineupCard title={matchAway(match, locale)} lineup={lineups.away} />
          </div>
          <p className="mt-3 text-[11px] text-text-dim">{t("mt.lineupDemo")}</p>
        </section>
      )}
    </div>
  );
}

function LineupCard({ title, lineup }: { title: string; lineup: Lineup | null }) {
  const { t, locale } = useLocale();

  if (!lineup) {
    return (
      <div className="card p-4">
        <h3 className="font-bold text-text">{title}</h3>
        <p className="mt-2 text-sm text-text-dim">{t("mt.noLineup")}</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-bold text-text">{title}</h3>
        <span className="nums chip chip-brand">{lineup.formation}</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {lineup.players.map((p) => (
          <li key={p.n} className="flex items-baseline gap-2.5 text-sm">
            <span className="nums w-6 shrink-0 text-end font-bold text-text-dim">{p.n}</span>
            <span className="flex-1 text-text">{locale === "en" ? p.en : p.ar}</span>
            <span className="chip chip-neutral text-[10px]">{p.pos}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
