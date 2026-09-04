"use client";

import { useMemo } from "react";
import DistributionBars from "@/components/ops/DistributionBars";
import { PageHeader, SectionCard, StatCard } from "@/components/ops/Primitives";
import { langLabel } from "@/lib/ai";
import { RESPONSE_TARGET_MIN, slaMetrics } from "@/lib/analytics";
import { useNow } from "@/lib/clock";
import { formatMinutes } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  CATEGORIES,
  SEVERITIES,
  ZONES,
  categoryLabel,
  severityDef,
  severityLabel,
  zoneLabel,
} from "@/lib/taxonomy";
import type { SeverityId } from "@/lib/types";

export default function AnalyticsPage() {
  const { ready, reports, clusters } = useApp();
  const { t, locale } = useLocale();
  const now = useNow();

  const sla = useMemo(() => slaMetrics(clusters, now), [clusters, now]);

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        key: c.id,
        label: categoryLabel(c.id, locale),
        value: reports.filter((r) => r.category === c.id).length,
      })),
    [reports, locale],
  );

  const byZone = useMemo(
    () =>
      ZONES.map((z) => ({
        key: z.id,
        label: zoneLabel(z.id, locale),
        value: reports.filter((r) => r.zoneId === z.id).length,
      })),
    [reports, locale],
  );

  const byLanguage = useMemo(() => {
    const codes = Array.from(new Set(reports.map((r) => r.lang)));
    return codes.map((code) => ({
      key: code,
      label: langLabel(code, locale),
      value: reports.filter((r) => r.lang === code).length,
    }));
  }, [reports, locale]);

  const bySeverity = useMemo(
    () =>
      SEVERITIES.map((s) => ({
        key: s.id,
        label: severityLabel(s.id, locale),
        value: reports.filter((r) => r.severity === s.id).length,
        color: s.color,
      })),
    [reports, locale],
  );

  if (!ready || now === 0) {
    return <p className="py-20 text-center text-sm text-text-dim">{t("dash.loading")}</p>;
  }

  return (
    <>
      <PageHeader title={t("an.title")} subtitle={t("an.subtitle")} />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label={t("an.avgResponse")} value={formatMinutes(sla.avgResponseMin, locale)} />
          <StatCard label={t("an.avgResolve")} value={formatMinutes(sla.avgResolveMin, locale)} />
          <StatCard
            label={t("an.resolvedRate")}
            value={`${Math.round(sla.resolvedRate * 100)}%`}
            tone="ok"
          />
          <StatCard
            label={t("an.breached")}
            value={sla.breached}
            tone={sla.breached > 0 ? "danger" : "neutral"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title={t("an.byCategory")}>
            <DistributionBars slices={byCategory} empty={t("an.noData")} />
          </SectionCard>
          <SectionCard title={t("an.byZone")}>
            <DistributionBars slices={byZone} empty={t("an.noData")} />
          </SectionCard>
          <SectionCard title={t("an.byLanguage")}>
            <DistributionBars slices={byLanguage} empty={t("an.noData")} />
          </SectionCard>
          <SectionCard title={t("an.bySeverity")}>
            <DistributionBars slices={bySeverity} empty={t("an.noData")} />
          </SectionCard>
        </div>

        {/* المهل المستهدفة — الأساس الذي تُقاس عليه «تجاوزت المهلة» في كل مكان */}
        <SectionCard title={t("an.targets")}>
          <ul className="divide-y divide-line">
            {(Object.keys(RESPONSE_TARGET_MIN) as SeverityId[]).map((sev) => (
              <li key={sev} className="flex items-center justify-between px-4 py-3">
                <span className="inline-flex items-center gap-2 text-sm text-text">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: severityDef(sev).color }}
                  />
                  {severityLabel(sev, locale)}
                </span>
                <span className="nums text-sm font-bold text-text-muted">
                  {formatMinutes(RESPONSE_TARGET_MIN[sev], locale)}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </>
  );
}
