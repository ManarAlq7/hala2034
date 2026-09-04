import type { Cluster, Report } from "./types";
import { zoneById } from "./taxonomy";

/* -------------------------------------------------------------------------- */
/*  تحليلات تشغيلية: الاتجاه الزمني، مؤشرات الاستجابة، وكشف التصاعد            */
/* -------------------------------------------------------------------------- */

export interface Bucket {
  /** بداية الشريحة الزمنية */
  at: number;
  total: number;
  /** البلاغات العالية والحرجة داخل الشريحة */
  urgent: number;
}

/**
 * توزيع البلاغات على شرائح زمنية متساوية تنتهي عند اللحظة الحالية.
 * هذا ما يكشف حادثة تتصاعد — الأعداد المجمّعة وحدها لا تكشفها.
 */
export function timeSeries(
  reports: Report[],
  now: number,
  bucketMs = 15 * 60 * 1000,
  bucketCount = 24,
): Bucket[] {
  const end = Math.ceil(now / bucketMs) * bucketMs;
  const start = end - bucketCount * bucketMs;

  const buckets: Bucket[] = Array.from({ length: bucketCount }, (_, i) => ({
    at: start + i * bucketMs,
    total: 0,
    urgent: 0,
  }));

  for (const r of reports) {
    if (r.createdAt < start || r.createdAt >= end) continue;
    const idx = Math.floor((r.createdAt - start) / bucketMs);
    const b = buckets[idx];
    if (!b) continue;
    b.total += 1;
    if (r.severity === "high" || r.severity === "critical") b.urgent += 1;
  }

  return buckets;
}

export interface SlaMetrics {
  /** متوسط الدقائق حتى أول إجراء */
  avgResponseMin: number | null;
  /** متوسط الدقائق حتى الإغلاق */
  avgResolveMin: number | null;
  /** نسبة المشكلات المغلقة من الإجمالي */
  resolvedRate: number;
  /** عدد المشكلات المفتوحة التي تجاوزت المهلة دون أي إجراء */
  breached: number;
}

/** المهلة المستهدفة لأول إجراء بحسب درجة الخطورة (بالدقائق) */
export const RESPONSE_TARGET_MIN: Record<string, number> = {
  critical: 5,
  high: 15,
  medium: 45,
  low: 120,
};

export function slaMetrics(clusters: Cluster[], now: number): SlaMetrics {
  const responded = clusters.filter((c) => c.firstActionAt);
  const resolved = clusters.filter((c) => c.resolvedAt);

  const avg = (xs: number[]) =>
    xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null;

  const breached = clusters.filter((c) => {
    if (c.status === "resolved" || c.firstActionAt) return false;
    const target = RESPONSE_TARGET_MIN[c.severity] ?? 60;
    return (now - c.firstSeen) / 60000 > target;
  }).length;

  return {
    avgResponseMin: avg(responded.map((c) => (c.firstActionAt! - c.firstSeen) / 60000)),
    avgResolveMin: avg(resolved.map((c) => (c.resolvedAt! - c.firstSeen) / 60000)),
    resolvedRate: clusters.length ? resolved.length / clusters.length : 0,
    breached,
  };
}

/** هل تجاوزت هذه المشكلة مهلة الاستجابة المستهدفة؟ */
export function isBreached(cluster: Cluster, now: number): boolean {
  if (cluster.status === "resolved" || cluster.firstActionAt) return false;
  const target = RESPONSE_TARGET_MIN[cluster.severity] ?? 60;
  return (now - cluster.firstSeen) / 60000 > target;
}

export interface Surge {
  clusterId: string;
  title: string;
  zoneLabel: string;
  /** عدد البلاغات خلال نافذة الرصد */
  recentCount: number;
  windowMin: number;
}

/**
 * كشف التصاعد: مشكلة مفتوحة وصلها عدد بلاغات يتجاوز العتبة خلال نافذة قصيرة.
 * هذا تنبيه استباقي — لا ينتظر أن يلاحظ المشرف الرقم بنفسه.
 */
export function detectSurges(
  clusters: Cluster[],
  reports: Report[],
  now: number,
  windowMs = 15 * 60 * 1000,
  threshold = 3,
): Surge[] {
  const recentByCluster = new Map<string, number>();
  for (const r of reports) {
    if (now - r.createdAt > windowMs) continue;
    recentByCluster.set(r.clusterId, (recentByCluster.get(r.clusterId) ?? 0) + 1);
  }

  const surges: Surge[] = [];
  for (const c of clusters) {
    if (c.status === "resolved") continue;
    const recentCount = recentByCluster.get(c.id) ?? 0;
    if (recentCount < threshold) continue;
    surges.push({
      clusterId: c.id,
      title: c.title,
      zoneLabel: zoneById(c.zoneId).label,
      recentCount,
      windowMin: Math.round(windowMs / 60000),
    });
  }

  return surges.sort((a, b) => b.recentCount - a.recentCount);
}

/** صياغة مدة بالدقائق بصيغة عربية مقروءة */
export function formatMinutes(min: number | null): string {
  if (min === null) return "—";
  if (min < 60) return `${min} دقيقة`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} س ${m} د` : `${h} ساعة`;
}
