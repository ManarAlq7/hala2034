"use client";

import { CategoryChip, SeverityBadge, StatusBadge } from "@/components/Badges";
import { clusterHeading } from "@/lib/ai";
import { isBreached } from "@/lib/analytics";
import { relativeTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import { zoneLabel } from "@/lib/taxonomy";
import type { Cluster } from "@/lib/types";
import { EmptyState } from "./Primitives";

interface Props {
  clusters: Cluster[];
  now: number;
  onOpen: (clusterId: string) => void;
  /** نسخة مختصرة للنظرة العامة: العنوان والخطورة والعدد فقط */
  compact?: boolean;
  empty: string;
}

/**
 * قائمة المشكلات.
 *
 * جدول على الشاشات الواسعة وبطاقات على الضيقة — لا جدول يُمرَّر أفقياً على
 * جوّال، فالمشرف في الميدان يقرأ من جهازه أثناء الحدث لا من مكتب.
 */
export default function IssueTable({ clusters, now, onOpen, compact = false, empty }: Props) {
  const { t, locale } = useLocale();

  if (clusters.length === 0) return <EmptyState>{empty}</EmptyState>;

  return (
    <>
      {/* الشاشات الواسعة */}
      <div className="hidden overflow-x-auto md:block">
        <table className="table">
          <thead>
            <tr>
              <th>{t("issues.colIssue")}</th>
              {!compact && <th>{t("issues.colLocation")}</th>}
              {!compact && <th>{t("issues.colCategory")}</th>}
              <th>{t("issues.colSeverity")}</th>
              <th>{t("issues.colReports")}</th>
              {!compact && <th>{t("issues.colUpdated")}</th>}
              <th>{t("issues.colStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {clusters.map((c) => (
              <tr key={c.id} onClick={() => onOpen(c.id)} className="cursor-pointer">
                <td>
                  <span className="nums block text-[11px] text-text-dim">{c.id}</span>
                  <span className="block font-semibold text-text">{clusterHeading(c, locale)}</span>
                  {isBreached(c, now) && (
                    <span className="chip chip-danger mt-1.5">{t("dash.breached")}</span>
                  )}
                </td>
                {!compact && <td className="text-text-muted">{zoneLabel(c.zoneId, locale)}</td>}
                {!compact && (
                  <td>
                    <CategoryChip id={c.category} />
                  </td>
                )}
                <td>
                  <SeverityBadge id={c.severity} />
                </td>
                <td className="nums font-bold text-text">{c.reportIds.length}</td>
                {!compact && (
                  <td className="whitespace-nowrap text-text-dim">
                    {relativeTime(c.lastSeen, locale, now)}
                  </td>
                )}
                <td>
                  <StatusBadge id={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* الشاشات الضيقة */}
      <ul className="divide-y divide-line md:hidden">
        {clusters.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onOpen(c.id)}
              className="w-full px-4 py-3.5 text-start transition hover:bg-surface-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="nums block text-[11px] text-text-dim">{c.id}</span>
                  <span className="block truncate font-semibold text-text">
                    {clusterHeading(c, locale)}
                  </span>
                </div>
                <span className="nums shrink-0 rounded-lg bg-surface-3 px-2 py-1 text-sm font-bold text-text">
                  {c.reportIds.length}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <SeverityBadge id={c.severity} />
                <StatusBadge id={c.status} />
                {isBreached(c, now) && <span className="chip chip-danger">{t("dash.breached")}</span>}
              </div>
              <p className="mt-2 text-[11px] text-text-dim">
                {zoneLabel(c.zoneId, locale)} · {relativeTime(c.lastSeen, locale, now)}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
