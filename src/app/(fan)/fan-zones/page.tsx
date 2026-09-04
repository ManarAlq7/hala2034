"use client";

import {
  useCatalog,
  zoneAbout,
  zoneCity,
  zoneFeatures,
  zoneName,
} from "@/lib/catalog";
import { useLocale } from "@/lib/i18n";

/**
 * مناطق المشجعين خارج الملاعب.
 *
 * صفحة قراءة فقط: المشجّع يقرّر أين يذهب، فالمطلوب المدينة والتوقيت والسعة
 * وما يجده هناك — لا أكثر.
 */
export default function FanZonesPage() {
  const { t, locale } = useLocale();
  const { zones, status } = useCatalog();

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
        {zones.map((z) => (
          <li key={z.id} className="card flex flex-col p-5">
            <p className="text-[11px] uppercase tracking-[0.12em] text-brand">
              {zoneCity(z, locale)}
            </p>
            <h2 className="mt-1.5 text-lg font-bold leading-snug text-text">{zoneName(z, locale)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{zoneAbout(z, locale)}</p>

            <ul className="mt-4 flex flex-wrap gap-1.5">
              {zoneFeatures(z, locale).map((f) => (
                <li key={f} className="chip chip-neutral">
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-4 text-[11px] text-text-dim">
              <span className="nums">
                {t("fz.opens")} {z.opensAt}–{z.closesAt}
              </span>
              <span className="nums">
                {t("fz.capacity")} {z.capacity.toLocaleString("en-US")} {t("fz.person")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
