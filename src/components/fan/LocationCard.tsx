"use client";

import SaudiMap, { type MapPoint } from "@/components/fan/SaudiMap";
import { useLocale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/*  بطاقة الموقع                                                               */
/*                                                                             */
/*  الخريطة هنا للتوجيه، والزرّ للملاحة: يفتح خرائط الجهاز على الوجهة نفسها.      */
/*  ولا يُفتح شيء إلا بنقرة من المشجّع — الموقع يغادر إلى خدمة خارجية، وهذا       */
/*  قراره لا قرارنا.                                                            */
/* -------------------------------------------------------------------------- */

export default function LocationCard({
  lat,
  lng,
  label,
  precise,
  others = [],
  uid,
}: {
  lat: number | null;
  lng: number | null;
  label: string;
  precise: boolean;
  /** بقية المواقع تُرسم باهتة فيُعرف موضع هذا من بينها */
  others?: MapPoint[];
  uid: string;
}) {
  const { t, locale } = useLocale();

  if (lat === null || lng === null) return null;

  const points: MapPoint[] = [...others, { id: "active", lat, lng, label, active: true }];
  const coords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-line bg-surface-2 p-4">
        <SaudiMap points={points} uid={uid} className="mx-auto h-56 w-full max-w-sm" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h3 className="text-sm font-bold text-text">{t("loc.title")}</h3>
          <p className="nums mt-1 text-[12px] text-text-muted" dir="ltr">
            {coords}
          </p>
          {!precise && <p className="mt-1 text-[11px] text-text-dim">{t("loc.approx")}</p>}
        </div>

        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary shrink-0"
          lang={locale}
        >
          {t("loc.directions")} ↗
        </a>
      </div>
    </section>
  );
}
