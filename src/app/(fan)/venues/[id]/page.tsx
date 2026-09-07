"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo } from "react";
import LocationCard from "@/components/fan/LocationCard";
import PageHero from "@/components/fan/PageHero";
import StadiumArt, { sceneFor } from "@/components/fan/StadiumArt";
import {
  matchAway,
  matchHome,
  matchStage,
  useCatalog,
  venueCity,
  venueName,
  zoneCity,
  zoneName,
} from "@/lib/catalog";
import { matchDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

/**
 * ملعب واحد.
 *
 * الملاعب كانت بطاقات لا تُفتح، وكل ما يعرفه المشجّع عنها اسمها وسعتها. هنا
 * أين تقع، وكيف يصلها، وما يُلعب فيها، وأين يشاهد قربها إن لم يكن معه تذكرة.
 */
export default function VenuePage() {
  const params = useParams<{ id: string }>();
  const { t, locale } = useLocale();
  const { venues, matches, zones, status } = useCatalog();

  const venue = venues.find((v) => v.id === params.id);

  const venueMatches = useMemo(
    () => (venue ? matches.filter((m) => m.venueId === venue.id).slice(0, 6) : []),
    [venue, matches],
  );

  /* مناطق المشاهدة في المدينة نفسها: بديل من لا تذكرة معه */
  const cityZones = useMemo(
    () => (venue ? zones.filter((z) => z.cityEn === venue.cityEn) : []),
    [venue, zones],
  );

  if (status === "loading") {
    return <p className="py-24 text-center text-sm text-text-dim">{t("common.loading")}</p>;
  }

  if (!venue) notFound();

  const index = venues.findIndex((v) => v.id === venue.id);

  return (
    <div>
      <PageHero
        back={{ href: "/", label: t("land.venues") }}
        eyebrow={venueCity(venue, locale)}
        title={venueName(venue, locale)}
        pills={[
          {
            label: `${venue.capacity.toLocaleString("en-US")} · ${t("land.capacityApprox")}`,
            nums: true,
          },
          { label: t("vn.matchCount", { n: venueMatches.length }), nums: true },
        ]}
      />

      {/* رسم الملعب في إطاره: خلف النصّ كان يبتلعه، وهنا يُرى كاملاً */}
      <div className="mx-auto max-w-5xl px-5 pt-8">
        <div className="aspect-[21/8] overflow-hidden rounded-2xl border border-line bg-surface-3">
          <StadiumArt scene={sceneFor(venue.id, index)} uid={`venue-${venue.id}`} className="h-full w-full" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-12 px-5 py-12">
        <LocationCard
          lat={venue.lat}
          lng={venue.lng}
          label={venueCity(venue, locale)}
          precise={venue.precise}
          uid={`venue-${venue.id}`}
          others={venues
            .filter((v) => v.id !== venue.id && v.lat !== null && v.lng !== null)
            .map((v) => ({ id: v.id, lat: v.lat!, lng: v.lng!, label: venueCity(v, locale) }))}
        />

        {venueMatches.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-text">{t("vn.matches")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {venueMatches.map((m) => (
                <li key={m.id} className="card p-4">
                  <p className="text-[11px] text-text-dim">{matchStage(m, locale)}</p>
                  <p className="mt-1.5 font-bold text-text">
                    {matchHome(m, locale)} — {matchAway(m, locale)}
                  </p>
                  <p className="nums mt-1 text-[12px] text-text-muted">
                    {matchDateTime(m.kickoff, locale)}
                  </p>
                  <Link
                    href={`/matches/${m.id}`}
                    className="mt-2 inline-block text-[12px] font-semibold text-brand underline underline-offset-4"
                  >
                    {t("mt.open")} →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {cityZones.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-text">{t("vn.zonesNearby")}</h2>
            <p className="mt-1 text-sm text-text-muted">{t("vn.zonesNote")}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {cityZones.map((z) => (
                <li key={z.id}>
                  <Link href={`/fan-zones/${z.id}`} className="card card-link block h-full p-4">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-brand">
                      {zoneCity(z, locale)}
                    </p>
                    <p className="mt-1.5 font-bold leading-snug text-text">{zoneName(z, locale)}</p>
                    <p className="nums mt-2 text-[11px] text-text-dim">
                      {z.opensAt}–{z.closesAt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
