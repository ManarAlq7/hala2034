"use client";

import { useMemo, useState } from "react";
import ClusterDetail from "@/components/ClusterDetail";
import HeatMap from "@/components/HeatMap";
import IssueTable from "@/components/ops/IssueTable";
import { EmptyState, PageHeader, SectionCard } from "@/components/ops/Primitives";
import { zoneHeat } from "@/lib/ai";
import { useNow } from "@/lib/clock";
import { useLocale } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { zoneLabel } from "@/lib/taxonomy";
import type { SeverityId } from "@/lib/types";

const SEV_ORDER: SeverityId[] = ["low", "medium", "high", "critical"];

export default function MapPage() {
  const { ready, reports, clusters } = useApp();
  const { t, locale } = useLocale();
  const now = useNow();

  const [zone, setZone] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const heat = useMemo(() => zoneHeat(reports), [reports]);
  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of reports) out[r.zoneId] = (out[r.zoneId] ?? 0) + 1;
    return out;
  }, [reports]);

  const zoneIssues = useMemo(() => {
    if (!zone) return [];
    return clusters
      .filter((c) => c.zoneId === zone && c.status !== "resolved")
      .sort(
        (a, b) =>
          SEV_ORDER.indexOf(b.severity) - SEV_ORDER.indexOf(a.severity) || b.lastSeen - a.lastSeen,
      );
  }, [clusters, zone]);

  const openCluster = clusters.find((c) => c.id === openId) ?? null;

  if (!ready || now === 0) {
    return <p className="py-20 text-center text-sm text-text-dim">{t("dash.loading")}</p>;
  }

  return (
    <>
      <PageHeader title={t("map.title")} subtitle={t("map.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <HeatMap heat={heat} counts={counts} selected={zone} onSelect={setZone} />

        <SectionCard
          title={zone ? t("map.issuesAt", { zone: zoneLabel(zone, locale) }) : t("map.title")}
        >
          {!zone ? (
            <EmptyState>{t("map.pickZone")}</EmptyState>
          ) : (
            <IssueTable
              clusters={zoneIssues}
              now={now}
              onOpen={setOpenId}
              compact
              empty={t("map.noIssues")}
            />
          )}
        </SectionCard>
      </div>

      {openCluster && (
        <ClusterDetail cluster={openCluster} reports={reports} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
