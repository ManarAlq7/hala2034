"use client";

import { useMemo, useState } from "react";
import ClusterDetail from "@/components/ClusterDetail";
import IssueTable from "@/components/ops/IssueTable";
import { PageHeader, Pill } from "@/components/ops/Primitives";
import { IconSearch } from "@/components/ops/Icons";
import { clusterHeading } from "@/lib/ai";
import { useNow } from "@/lib/clock";
import { useLocale } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { CATEGORIES, STATUSES, categoryLabel, statusLabel } from "@/lib/taxonomy";
import type { CategoryId, SeverityId, StatusId } from "@/lib/types";

const SEV_ORDER: SeverityId[] = ["low", "medium", "high", "critical"];

export default function IssuesPage() {
  const { ready, reports, clusters } = useApp();
  const { t, locale } = useLocale();
  const now = useNow();

  const [status, setStatus] = useState<StatusId | "all">("all");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clusters
      .filter((c) => (status === "all" ? true : c.status === status))
      .filter((c) => (category === "all" ? true : c.category === category))
      .filter((c) => {
        if (!q) return true;
        if (clusterHeading(c, locale).toLowerCase().includes(q)) return true;
        if (c.id.toLowerCase().includes(q)) return true;
        // البحث يشمل نصوص البلاغات: المشرف يتذكّر عبارة قالها مشجّع لا رقم مشكلة
        return reports.some((r) => r.clusterId === c.id && r.text.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        const openFirst = Number(a.status === "resolved") - Number(b.status === "resolved");
        if (openFirst !== 0) return openFirst;
        const sev = SEV_ORDER.indexOf(b.severity) - SEV_ORDER.indexOf(a.severity);
        if (sev !== 0) return sev;
        return b.lastSeen - a.lastSeen;
      });
  }, [clusters, reports, status, category, query, locale]);

  const openCluster = clusters.find((c) => c.id === openId) ?? null;
  const present = CATEGORIES.filter((c) => clusters.some((cl) => cl.category === c.id));

  if (!ready || now === 0) {
    return <p className="py-20 text-center text-sm text-text-dim">{t("dash.loading")}</p>;
  }

  return (
    <>
      <PageHeader
        title={t("issues.title")}
        subtitle={t("issues.subtitle")}
        actions={
          <span className="chip chip-neutral">{t("issues.count", { n: filtered.length })}</span>
        }
      />

      <div className="card mb-4 space-y-3 p-4">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-text-dim">
            <IconSearch className="h-4 w-4" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("issues.search")}
            className="input ps-9"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Pill active={status === "all"} onClick={() => setStatus("all")}>
            {t("dash.allStatuses")}
          </Pill>
          {STATUSES.map((s) => (
            <Pill key={s.id} active={status === s.id} onClick={() => setStatus(s.id)}>
              {statusLabel(s.id, locale)}
            </Pill>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Pill active={category === "all"} onClick={() => setCategory("all")}>
            {t("dash.allCategories")}
          </Pill>
          {present.map((c) => (
            <Pill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              <span aria-hidden className="me-1">
                {c.icon}
              </span>
              {categoryLabel(c.id, locale)}
            </Pill>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <IssueTable
          clusters={filtered}
          now={now}
          onOpen={setOpenId}
          empty={t("issues.empty")}
        />
      </div>

      {openCluster && (
        <ClusterDetail cluster={openCluster} reports={reports} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
