"use client";

import type { Surge } from "@/lib/analytics";
import { clusterHeading } from "@/lib/ai";
import { useLocale } from "@/lib/i18n";
import { zoneLabel } from "@/lib/taxonomy";
import { IconAlert } from "./ops/Icons";

interface Props {
  surges: Surge[];
  breached: number;
  onOpen: (clusterId: string) => void;
}

/**
 * تنبيه استباقي: بدل انتظار المشرف حتى يلاحظ الأرقام، يبرز النظام المشكلات
 * التي تتصاعد الآن والمشكلات التي تجاوزت مهلة الاستجابة.
 */
export default function SurgeAlert({ surges, breached, onOpen }: Props) {
  const { t, locale, isRtl } = useLocale();

  if (surges.length === 0 && breached === 0) return null;

  return (
    <div
      className={`rise rounded-xl border border-danger/35 bg-danger-wash p-4 ${
        isRtl ? "border-r-2 border-r-danger" : "border-l-2 border-l-danger"
      }`}
    >
      <div className="flex items-center gap-2 text-danger">
        <IconAlert className="h-4 w-4" />
        <h2 className="text-sm font-bold">{t("surge.title")}</h2>
      </div>

      <ul className="mt-3 space-y-1.5">
        {surges.map((s) => (
          <li key={s.cluster.id}>
            <button
              onClick={() => onOpen(s.cluster.id)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-start text-xs transition hover:border-danger/50"
            >
              <span className="font-bold text-text">
                {t("surge.spikeIn", { zone: zoneLabel(s.cluster.zoneId, locale) })}
              </span>{" "}
              <span className="text-text-muted">
                {t("surge.detail", {
                  n: s.recentCount,
                  title: clusterHeading(s.cluster, locale),
                  min: s.windowMin,
                })}
              </span>
            </button>
          </li>
        ))}

        {breached > 0 && (
          <li className="rounded-lg border border-line bg-surface px-3 py-2 text-xs">
            <span className="font-bold text-text">
              {breached === 1 ? t("surge.breachedOne") : t("surge.breached", { n: breached })}
            </span>{" "}
            <span className="text-text-muted">{t("surge.noAction")}</span>
          </li>
        )}
      </ul>
    </div>
  );
}
