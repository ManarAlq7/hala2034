"use client";

import Link from "next/link";
import Football from "@/components/fan/Football";
import { zoneCity, zoneName, venueName, type FanZone, type Venue } from "@/lib/catalog";
import { useLocale } from "@/lib/i18n";
import {
  ICONS,
  clockLabel,
  eventDetail,
  eventPlayer,
  type MatchEvent,
} from "@/lib/matchday";

/* -------------------------------------------------------------------------- */
/*  مشاهدة المباراة                                                            */
/*                                                                             */
/*  مكان البثّ في أعلى الصفحة، وإلى جانبه التعليق الحيّ.                          */
/*                                                                             */
/*  ولا يُضمَّن هنا بثّ لا نملك حقّه: حقوق كأس العالم مملوكة لجهات بعينها.          */
/*  الحقل يبقى فارغاً حتى يضع صاحب الحقّ رابطه المصرّح به من غرفة يوم المباراة،    */
/*  وحتى ذلك الحين تُعرض الإجابة الحقيقية لسؤال «وين أشوف؟»: الملعب ومناطق       */
/*  المشجعين في المدينة.                                                        */
/*                                                                             */
/*  والتعليق لا ينتظر ذلك: هو أحداث المباراة التي يبثّها فريق العمليات، تصل       */
/*  لحظتها وتُقرأ سطراً سطراً.                                                    */
/* -------------------------------------------------------------------------- */

export default function MatchWatch({
  streamUrl,
  streamLabel,
  events,
  live,
  venue,
  zones,
}: {
  streamUrl: string | null;
  streamLabel: string | null;
  events: MatchEvent[];
  live: boolean;
  venue?: Venue;
  zones: FanZone[];
}) {
  const { t, locale } = useLocale();

  /* التعليق: الأحدث أوّلاً، فما وقع الآن هو أوّل ما يُقرأ */
  const feed = [...events].reverse();

  return (
    <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
      {/* --------------------------- مكان البثّ --------------------------- */}
      <div className="card overflow-hidden">
        <div className="relative aspect-video bg-[#0d0f18]">
          {streamUrl ? (
            <iframe
              src={streamUrl}
              title={streamLabel ?? t("watch.title")}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <Football
                uid="watch"
                className="h-16 w-16 opacity-90"
                patch="#ffffff"
                seam="rgba(255,255,255,0.5)"
                spin
              />
              <p className="max-w-sm text-[13px] leading-relaxed text-white/70">
                {t("watch.noStream")}
              </p>
            </div>
          )}

          {live && (
            <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-danger px-2.5 py-1 text-[11px] font-bold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              {t("mt.live")}
            </span>
          )}
        </div>

        {/* أين تُشاهَد على الأرض — الجواب الحقيقي ما دام البثّ غير متاح */}
        {!streamUrl && (venue || zones.length > 0) && (
          <div className="border-t border-line p-4">
            <h3 className="text-sm font-bold text-text">{t("watch.whereTitle")}</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {venue && (
                <li>
                  <Link href={`/venues/${venue.id}`} className="chip chip-brand">
                    🏟 {venueName(venue, locale)}
                  </Link>
                </li>
              )}
              {zones.slice(0, 3).map((z) => (
                <li key={z.id}>
                  <Link href={`/fan-zones/${z.id}`} className="chip chip-neutral">
                    📺 {zoneName(z, locale)} · {zoneCity(z, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* --------------------------- التعليق الحيّ --------------------------- */}
      <div className="card flex max-h-[26rem] flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-3">
          <h3 className="text-sm font-bold text-text">{t("watch.commentary")}</h3>
          {live && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-danger">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-danger" />
              {t("mt.live")}
            </span>
          )}
        </header>

        {feed.length === 0 ? (
          <p className="p-6 text-center text-[13px] text-text-dim">{t("mt.noEvents")}</p>
        ) : (
          <ol className="flex-1 divide-y divide-line overflow-y-auto">
            {feed.map((e) => (
              <li key={e.id} className="flex items-start gap-2.5 px-4 py-3">
                <span aria-hidden className="text-base leading-none">
                  {ICONS[e.kind]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="nums text-[11px] font-bold text-brand">{clockLabel(e)}</span>
                  {eventPlayer(e, locale) && (
                    <span className="ms-2 text-[13px] font-bold text-text">
                      {eventPlayer(e, locale)}
                    </span>
                  )}
                  {eventDetail(e, locale) && (
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-text-muted">
                      {eventDetail(e, locale)}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
