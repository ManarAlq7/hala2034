"use client";

import { useMemo, useState } from "react";
import HeatMap from "@/components/HeatMap";
import ClusterDetail from "@/components/ClusterDetail";
import TrendChart from "@/components/TrendChart";
import SurgeAlert from "@/components/SurgeAlert";
import { CategoryChip, SeverityBadge, StatusBadge } from "@/components/Badges";
import { CATEGORIES, STATUSES, channelLabel, zoneById } from "@/lib/taxonomy";
import { langLabel, zoneHeat } from "@/lib/ai";
import { relativeTime } from "@/lib/format";
import { detectSurges, formatMinutes, isBreached, slaMetrics } from "@/lib/analytics";
import { useNow } from "@/lib/clock";
import { useApp } from "@/lib/store";
import type { CategoryId, Cluster, SeverityId, StatusId } from "@/lib/types";

const SEV_ORDER: SeverityId[] = ["low", "medium", "high", "critical"];

export default function DashboardPage() {
  const { ready, reports, clusters, reset } = useApp();
  const [status, setStatus] = useState<StatusId | "all">("all");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [zone, setZone] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // ساعة مشتركة تتقدّم كل دقيقة حتى تبقى الأزمنة النسبية ومؤشرات المهلة صحيحة
  const now = useNow();

  const heat = useMemo(() => zoneHeat(reports), [reports]);
  const zoneCounts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of reports) out[r.zoneId] = (out[r.zoneId] ?? 0) + 1;
    return out;
  }, [reports]);

  const openClusters = clusters.filter((c) => c.status !== "resolved");
  const criticalCount = openClusters.filter(
    (c) => c.severity === "critical" || c.severity === "high",
  ).length;
  const langCount = new Set(reports.map((r) => r.lang)).size;
  const ratio = clusters.length ? reports.length / clusters.length : 0;

  const sla = useMemo(() => slaMetrics(clusters, now), [clusters, now]);
  const surges = useMemo(
    () => (now ? detectSurges(clusters, reports, now) : []),
    [clusters, reports, now],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clusters
      .filter((c) => (status === "all" ? true : c.status === status))
      .filter((c) => (category === "all" ? true : c.category === category))
      .filter((c) => (zone ? c.zoneId === zone : true))
      .filter((c) => {
        if (!q) return true;
        if (c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) return true;
        return reports.some((r) => r.clusterId === c.id && r.text.toLowerCase().includes(q));
      })
      .sort((a, b) => {
        const openDiff = Number(a.status === "resolved") - Number(b.status === "resolved");
        if (openDiff !== 0) return openDiff;
        const sev = SEV_ORDER.indexOf(b.severity) - SEV_ORDER.indexOf(a.severity);
        if (sev !== 0) return sev;
        return b.lastSeen - a.lastSeen;
      });
  }, [clusters, reports, status, category, zone, query]);

  const openCluster = clusters.find((c) => c.id === openId) ?? null;

  if (!ready || now === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center text-sm text-ink-muted">
        جارٍ تحميل بيانات مركز العمليات…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">لوحة المتابعة</h1>
          <p className="mt-1 text-sm text-ink-muted">
            صورة لحظية لبلاغات الجماهير بعد تصنيفها وتجميعها في مشكلات قابلة للمعالجة.
          </p>
        </div>
        <button
          onClick={reset}
          className="rounded-xl border border-hairline bg-surface px-3.5 py-2 text-xs font-semibold text-ink-muted transition hover:bg-brand-50 hover:text-brand-700"
        >
          إعادة تعيين البيانات التجريبية
        </button>
      </div>

      {/* المؤشرات */}
      <SurgeAlert surges={surges} breached={sla.breached} onOpen={setOpenId} />

      <div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Kpi label="إجمالي البلاغات" value={reports.length} icon="📥" />
        <Kpi label="مشكلات مفتوحة" value={openClusters.length} icon="📋" />
        <Kpi label="عالية وحرجة" value={criticalCount} icon="🔴" tone="danger" />
        <Kpi label="لغات مستقبَلة" value={langCount} icon="🌐" />
        <Kpi label="بلاغ لكل مشكلة" value={ratio.toFixed(1)} icon="🧩" tone="brand" />
        <Kpi label="متوسط الاستجابة" value={formatMinutes(sla.avgResponseMin)} icon="⏱" tone="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="space-y-6">
          <TrendChart reports={reports} now={now} />
          <HeatMap heat={heat} counts={zoneCounts} selected={zone} onSelect={setZone} />
          <LiveFeed />
        </div>

        <div className="space-y-4">
          {/* المرشّحات */}
          <div className="card space-y-3 p-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث في المشكلات ونصوص البلاغات…"
              className="w-full rounded-xl border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <div className="flex flex-wrap gap-1.5">
              <FilterPill active={status === "all"} onClick={() => setStatus("all")}>
                كل الحالات
              </FilterPill>
              {STATUSES.map((s) => (
                <FilterPill key={s.id} active={status === s.id} onClick={() => setStatus(s.id)}>
                  {s.label}
                </FilterPill>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill active={category === "all"} onClick={() => setCategory("all")}>
                كل الأنواع
              </FilterPill>
              {CATEGORIES.filter((c) => clusters.some((cl) => cl.category === c.id)).map((c) => (
                <FilterPill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
                  <span aria-hidden className="ml-1">
                    {c.icon}
                  </span>
                  {c.label}
                </FilterPill>
              ))}
            </div>
            {zone && (
              <p className="text-xs text-ink-muted">
                مُصفّى على الموقع:{" "}
                <span className="font-semibold text-brand-700">{zoneById(zone).label}</span>
              </p>
            )}
          </div>

          {/* قائمة المشكلات */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-ink">
                المشكلات (<span className="nums">{filtered.length}</span>)
              </h2>
              <span className="text-xs text-ink-muted">مرتّبة حسب الخطورة ثم الأحدث</span>
            </div>

            {filtered.length === 0 ? (
              <p className="card p-8 text-center text-sm text-ink-muted">
                لا توجد مشكلات مطابقة للمرشّحات الحالية.
              </p>
            ) : (
              filtered.map((c) => (
                <ClusterRow key={c.id} cluster={c} now={now} onOpen={() => setOpenId(c.id)} />
              ))
            )}
          </div>
        </div>
      </div>

      {openCluster && (
        <ClusterDetail cluster={openCluster} reports={reports} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}

/* --------------------------------- عناصر --------------------------------- */

function Kpi({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: string;
  tone?: "default" | "danger" | "brand";
}) {
  const toneCls =
    tone === "danger"
      ? "text-red-600"
      : tone === "brand"
        ? "text-brand-600"
        : "text-ink";
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-muted">{label}</span>
        <span aria-hidden className="text-base opacity-70">
          {icon}
        </span>
      </div>
      <p className={`nums mt-1.5 text-2xl font-bold ${toneCls}`}>{value}</p>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition ${
        active
          ? "bg-brand-700 text-white ring-brand-700"
          : "bg-white text-ink-muted ring-hairline hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}

function ClusterRow({
  cluster,
  now,
  onOpen,
}: {
  cluster: Cluster;
  now: number;
  onOpen: () => void;
}) {
  const n = cluster.reportIds.length;
  const breached = isBreached(cluster, now);
  return (
    <button
      onClick={onOpen}
      className="card w-full p-4 text-right transition hover:border-brand-500/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="nums text-[11px] text-ink-muted">{cluster.id}</p>
          <h3 className="truncate font-bold text-ink">{cluster.title}</h3>
        </div>
        <span className="shrink-0 rounded-xl bg-brand-50 px-2.5 py-1.5 text-center ring-1 ring-brand-100">
          <span className="nums block text-base font-bold leading-none text-brand-700">{n}</span>
          <span className="block text-[10px] text-ink-muted">بلاغ</span>
        </span>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <SeverityBadge id={cluster.severity} />
        <StatusBadge id={cluster.status} />
        <CategoryChip id={cluster.category} />
        {breached && (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
            تجاوز المهلة
          </span>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
        <span>📍 {zoneById(cluster.zoneId).label}</span>
        <span>🏛 {cluster.assignedTo}</span>
        <span>🕒 آخر بلاغ {relativeTime(cluster.lastSeen)}</span>
      </div>
    </button>
  );
}

function LiveFeed() {
  const { reports } = useApp();
  const latest = reports.slice(0, 8);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold text-ink">أحدث البلاغات الواردة</h2>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
          مباشر
        </span>
      </div>
      <ul className="thin-scroll max-h-[340px] space-y-2 overflow-y-auto pl-1">
        {latest.map((r) => (
          <li key={r.id} className="rounded-xl border border-hairline bg-white p-3">
            <p className="line-clamp-2 text-sm text-ink">{r.text}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-muted">
              <span>{r.source === "voice" ? "🎙" : "⌨️"}</span>
              <span>{channelLabel(r.channel)}</span>
              <span>{langLabel(r.lang)}</span>
              <span>📍 {zoneById(r.zoneId).label}</span>
              <span>{relativeTime(r.createdAt)}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
