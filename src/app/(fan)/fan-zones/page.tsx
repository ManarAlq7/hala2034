"use client";

import Link from "next/link";
import ZoneArt, { zoneSceneFor } from "@/components/fan/ZoneArt";
import { useCatalog, zoneAbout, zoneCity, zoneName } from "@/lib/catalog";
import { useNow } from "@/lib/clock";
import { useLocale } from "@/lib/i18n";
import { amenityName, isOpenNow, minutesUntilOpen, zoneAmenities } from "@/lib/zones";

/**
 * مناطق المشجعين خارج الملاعب.
 *
 * البطاقة تجيب سؤال الاختيار وحده: أين، ومفتوحة الآن أم لا، وأبرز ما فيها.
 * والتفصيل خلف نقرة — من لم يختر بعد لا يريد قائمة مزايا ستّ مناطق دفعةً واحدة.
 */
export default function FanZonesPage() {
  const { t, locale } = useLocale();
  const { zones, status } = useCatalog();
  const now = useNow();

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-text sm:text-3xl">{t("fz.title")}</h1>
      <p className="mb-6 mt-2 max-w-xl text-sm leading-relaxed text-text-muted">{t("fz.subtitle")}</p>

      {status === "loading" && (
        <p className="py-16 text-center text-sm text-text-dim">{t("common.loading")}</p>
      )}

      {status !== "loading" && zones.length === 0 && (
        <p className="card p-8 text-center text-sm text-text-muted">{t("fz.empty")}</p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {zones.map((z, i) => {
          const open = isOpenNow(z, now);
          const untilOpen = minutesUntilOpen(z, now);
          const amenities = zoneAmenities(z);

          return (
            <li key={z.id}>
              <Link
                href={`/fan-zones/${z.id}`}
                className="card card-link flex h-full flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/7] overflow-hidden border-b border-line">
                  <ZoneArt scene={zoneSceneFor(z.id, i)} uid={`card-${z.id}`} className="h-full w-full" />
                  {/* شارة على أرضية الموقع لا لون مصمت: الأخضر الصارخ كان ينطّ من الصفحة */}
                  <span
                    className={`absolute end-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold backdrop-blur ${
                      open
                        ? "border-ok/25 bg-ok-wash/95 text-ok"
                        : "border-line bg-surface/90 text-text-muted"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-ok" : "bg-text-dim"}`} />
                    {open ? t("fz.openNow") : t("fz.opensIn", { n: Math.round(untilOpen / 60) })}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-brand">
                    {zoneCity(z, locale)}
                  </p>
                  <h2 className="mt-1.5 text-lg font-bold leading-snug text-text">
                    {zoneName(z, locale)}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">
                    {zoneAbout(z, locale)}
                  </p>

                  {/* أبرز ثلاث مزايا فقط — البقية خلف النقرة */}
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {amenities.slice(0, 3).map((a) => (
                      <li key={a.key} className="chip chip-neutral">
                        <span aria-hidden className="me-1">
                          {a.icon}
                        </span>
                        {amenityName(a, locale)}
                      </li>
                    ))}
                    {amenities.length > 3 && (
                      <li className="chip chip-brand">+{amenities.length - 3}</li>
                    )}
                  </ul>

                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-4 text-[11px] text-text-dim">
                    <span className="nums">
                      {t("fz.opens")} {z.opensAt}–{z.closesAt}
                    </span>
                    <span className="nums">
                      {t("fz.capacity")} {z.capacity.toLocaleString("en-US")} {t("fz.person")}
                    </span>
                    <span className="ms-auto font-semibold text-brand">{t("fz.more")} →</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
