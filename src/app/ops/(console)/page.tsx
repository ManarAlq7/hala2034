"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ClusterDetail from "@/components/ClusterDetail";
import HeatMap from "@/components/HeatMap";
import SurgeAlert from "@/components/SurgeAlert";
import TrendChart from "@/components/TrendChart";
import DistributionBars from "@/components/ops/DistributionBars";
import IssueTable from "@/components/ops/IssueTable";
import { EmptyState, PageHeader, SectionCard, StatCard } from "@/components/ops/Primitives";
import { zoneHeat } from "@/lib/ai";
import { detectSurges, slaMetrics } from "@/lib/analytics";
import { useNow } from "@/lib/clock";
import { relativeTime } from "@/lib/format";
import { reportText, useLocale } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { CATEGORIES, categoryLabel, zoneLabel } from "@/lib/taxonomy";
import type { SeverityId } from "@/lib/types";

const SEV_ORDER: SeverityId[] = ["low", "medium", "high", "critical"];

export default function OverviewPage() {
  const { ready, reports, clusters } = useApp();
  const { t, locale } = useLocale();
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);

  const heat = useMemo(() => zoneHeat(reports), [reports]);
  const zoneCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of reports) out[r.zoneId] = (out[r.zoneId] ?? 0) + 1;
    return out;
  }, [reports]);

  const sla = useMemo(() => slaMetrics(clusters, now), [clusters, now]);
  const surges = useMemo(
    () => (now ? detectSurges(clusters, reports, now) : []),
    [clusters, reports, now],
  );

  const open = clusters.filter((c) => c.status !== "resolved");
  const critical = open.filter((c) => c.severity === "critical" || c.severity === "high");

  // «أُغلقت اليوم» تُحسب من منتصف الليل المحلي لا من آخر ٢٤ ساعة: فريق المناوبة
  // يقيس يومه بالتقويم لا بنافذة متحركة
  const closedToday = useMemo(() => {
    if (!now) return 0;
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    return clusters.filter((c) => c.resolvedAt && c.resolvedAt >= midnight.getTime()).length;
  }, [clusters, now]);

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        key: c.id,
        label: categoryLabel(c.id, locale),
        value: reports.filter((r) => r.category === c.id).length,
      })),
    [reports, locale],
  );

  const topCritical = useMemo(
    () =>
      [...critical]
        .sort(
          (a, b) =>
            SEV_ORDER.indexOf(b.severity) - SEV_ORDER.indexOf(a.severity) || b.lastSeen - a.lastSeen,
        )
        .slice(0, 5),
    [critical],
  );

  const openCluster = clusters.find((c) => c.id === openId) ?? null;

  if (!ready || now === 0) {
    return <p className="py-20 text-center text-sm text-text-dim">{t("dash.loading")}</p>;
  }

  return (
    <>
      <PageHeader title={t("ov.title")} subtitle={t("ov.subtitle")} />

      <div className="space-y-6">
        <SurgeAlert surges={surges} breached={sla.breached} onOpen={setOpenId} />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label={t("ov.active")} value={open.length} />
          <StatCard
            label={t("ov.critical")}
            value={critical.length}
            tone={critical.length > 0 ? "danger" : "neutral"}
          />
          <StatCard label={t("ov.reports")} value={reports.length} />
          <StatCard label={t("ov.resolvedToday")} value={closedToday} tone="ok" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <TrendChart reports={reports} now={now} />
          <SectionCard title={t("ov.categories")}>
            <DistributionBars slices={byCategory} empty={t("an.noData")} />
          </SectionCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <SectionCard
            title={t("ov.criticalList")}
            action={{ href: "/ops/issues", label: t("ov.viewAll") }}
          >
            <IssueTable
              clusters={topCritical}
              now={now}
              onOpen={setOpenId}
              compact
              empty={t("ov.allClear")}
            />
          </SectionCard>

          <SectionCard title={t("ov.mapPreview")} action={{ href: "/ops/map", label: t("ov.openMap") }}>
            <div className="p-4">
              <HeatMap heat={heat} counts={zoneCounts} selected={null} onSelect={() => {}} bare />
            </div>
          </SectionCard>
        </div>

        <SectionCard title={t("ov.recent")} action={{ href: "/ops/reports", label: t("ov.viewAll") }}>
          {reports.length === 0 ? (
            <EmptyState>{t("raw.empty")}</EmptyState>
          ) : (
            <ul className="divide-y divide-line">
              {reports.slice(0, 6).map((r) => (
                <li key={r.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm text-text">{reportText(r, locale)}</p>
                    <span className="nums shrink-0 text-[11px] text-text-dim">
                      {relativeTime(r.createdAt, locale, now)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-text-dim">
                    <span className="nums">{r.id}</span> · {zoneLabel(r.zoneId, locale)} ·{" "}
                    <Link href="/ops/issues" className="transition hover:text-brand">
                      {r.clusterId}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {openCluster && (
        <ClusterDetail cluster={openCluster} reports={reports} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
