"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";
import LocationCard from "@/components/fan/LocationCard";
import ZoneArt, { zoneSceneFor } from "@/components/fan/ZoneArt";
import {
  matchAway,
  matchHome,
  matchStage,
  useCatalog,
  venueCity,
  venueName,
  zoneAbout,
  zoneCity,
  zoneName,
} from "@/lib/catalog";
import { useNow } from "@/lib/clock";
import { matchDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import {
  GROUP_LABEL,
  amenityName,
  amenityNote,
  isOpenNow,
  minutesUntilOpen,
  zoneAmenities,
  type AmenityGroup,
} from "@/lib/zones";

const GROUPS: AmenityGroup[] = ["watch", "comfort", "access"];

/**
 * منطقة مشجعين واحدة.
 *
 * البطاقة في القائمة تجيب «أين أذهب؟»، وهذه الصفحة تجيب ما بعده: ماذا أجد
 * هناك، ومتى تفتح، وما الذي يُعرض اليوم في هذه المدينة — والمباريات هنا ليست
 * زينة: من يختار منطقة يختارها لمباراة.
 */
export default function FanZonePage() {
  const params = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const { zones, matches, venues, status } = useCatalog();
  const now = useNow();

  const zone = zones.find((z) => z.id === params.id);

  /* مباريات هذه المدينة: المنطقة تعرضها، فهي ما يجعل الذهاب إليها قراراً */
  const cityMatches = useMemo(() => {
    if (!zone) return [];
    const venueById = new Map(venues.map((v) => [v.id, v]));
    return matches
      .filter((m) => {
        const venue = venueById.get(m.venueId);
        return venue?.cityEn === zone.cityEn;
      })
      .slice(0, 4)
      .map((m) => ({ match: m, venue: venueById.get(m.venueId) }));
  }, [zone, matches, venues]);

  if (status === "loading") {
    return <p className="py-24 text-center text-sm text-text-dim">{t("common.loading")}</p>;
  }

  if (!zone) notFound();

  const open = isOpenNow(zone, now);
  const untilOpen = minutesUntilOpen(zone, now);
  const amenities = zoneAmenities(zone);
  const index = zones.findIndex((z) => z.id === zone.id);

  return (
    <div>
      {/* ------------------------------- الواجهة ------------------------------- */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="absolute inset-0 -z-10">
          <ZoneArt scene={zoneSceneFor(zone.id, index)} uid={`hero-${zone.id}`} className="h-full w-full" />
          {/* الحجاب يثقل عند الأسفل حيث النصّ، ويخفّ عند الأعلى كي تُرى اللوحة */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        </div>

        <div className="mx-auto max-w-5xl px-5 py-14 text-white sm:py-20">
          <Link
            href="/fan-zones"
            className="text-[12px] font-semibold text-white/70 underline underline-offset-4 transition hover:text-white"
          >
            ← {t("fz.title")}
          </Link>

          <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-white/70">
            {zoneCity(zone, locale)}
          </p>
          <h1 className="mt-1.5 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
            {zoneName(zone, locale)}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
            {zoneAbout(zone, locale)}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold ${
                open ? "bg-ok text-white" : "bg-white/15 text-white/85 backdrop-blur"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-white" : "bg-white/60"}`} />
              {open ? t("fz.openNow") : t("fz.opensIn", { n: Math.round(untilOpen / 60) })}
            </span>
            <span className="nums rounded-full bg-white/12 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur">
              {zone.opensAt} – {zone.closesAt}
            </span>
            <span className="nums rounded-full bg-white/12 px-3 py-1.5 text-[12px] text-white/85 backdrop-blur">
              {t("fz.capacity")} {zone.capacity.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-5 py-12">
        {/* -------------------------------- المزايا -------------------------------- */}
        <section>
          <h2 className="text-lg font-bold text-text">{t("fz.amenities")}</h2>
          <p className="mt-1 text-sm text-text-muted">{t("fz.amenitiesNote", { n: amenities.length })}</p>

          <div className="mt-6 space-y-8">
            {GROUPS.map((group) => {
              const items = amenities.filter((a) => a.group === group);
              if (items.length === 0) return null;

              return (
                <div key={group}>
                  <h3 className="label">{locale === "en" ? GROUP_LABEL[group].en : GROUP_LABEL[group].ar}</h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((a) => (
                      <li key={a.key} className="card flex gap-3 p-4">
                        <span aria-hidden className="text-xl leading-none">
                          {a.icon}
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-text">
                            {amenityName(a, locale)}
                          </span>
                          <span className="mt-1 block text-[12px] leading-relaxed text-text-muted">
                            {amenityNote(a, locale)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* -------------------------------- الموقع -------------------------------- */}
        <LocationCard
          lat={zone.lat}
          lng={zone.lng}
          label={zoneCity(zone, locale)}
          precise={zone.precise}
          uid={`zone-${zone.id}`}
          others={zones
            .filter((z) => z.id !== zone.id && z.lat !== null && z.lng !== null)
            .map((z) => ({ id: z.id, lat: z.lat!, lng: z.lng!, label: zoneCity(z, locale) }))}
        />

        {/* ---------------------------- مباريات المدينة ---------------------------- */}
        {cityMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-text">
              {t("fz.matchesHere", { city: zoneCity(zone, locale) })}
            </h2>
            <p className="mt-1 text-sm text-text-muted">{t("fz.matchesNote")}</p>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {cityMatches.map(({ match, venue }) => (
                <li key={match.id} className="card p-4">
                  <p className="text-[11px] text-text-dim">
                    {matchStage(match, locale)}
                    {venue ? ` · ${venueCity(venue, locale)}` : ""}
                  </p>
                  <p className="mt-1.5 font-bold text-text">
                    {matchHome(match, locale)} — {matchAway(match, locale)}
                  </p>
                  <p className="nums mt-1 text-[12px] text-text-muted">
                    {matchDateTime(match.kickoff, locale)}
                  </p>
                  {venue && (
                    <p className="mt-1 text-[11px] text-text-dim">{venueName(venue, locale)}</p>
                  )}
                </li>
              ))}
            </ul>

            <Link
              href="/tickets"
              className="mt-4 inline-block text-sm font-semibold text-brand underline underline-offset-4"
            >
              {t("land.ctaTickets")} →
            </Link>
          </section>
        )}

        {/* ------------------------------ شيء يحتاج تدخّلاً ------------------------------ */}
        <section className="card flex flex-col gap-3 bg-surface-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-text">{t("fz.reportTitle")}</h2>
            <p className="mt-1 text-sm text-text-muted">{t("fz.reportBody")}</p>
          </div>
          <Link href="/report" className="btn btn-primary shrink-0">
            {t("land.ctaReport")}
          </Link>
        </section>
      </div>
    </div>
  );
}
