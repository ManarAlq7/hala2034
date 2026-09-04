import type { Cluster, ClusterSummary } from "./types";

/** أقصى عدد بلاغات يُرسل للتلخيص — البلاغات المتشابهة تتكرر، فالمزيد لا يضيف */
export const MAX_SUMMARY_INPUTS = 20;

/** لا معنى لتلخيص بلاغ أو بلاغين — العنوان القالبي يكفي حتى تتراكم صورة */
export const SUMMARY_MIN_REPORTS = 3;

/**
 * هل تحتاج هذه المشكلة ملخّصاً (أو تحديثاً لملخّصها)؟
 *
 * الملخّص يتقادم حين يتضاعف عدد البلاغات منذ توليده: ملخّص بُني على ٣ بلاغات
 * لم يعد يصف مشكلة صار فيها ٦. المضاعفة لا زيادة ثابتة، فمشكلة فيها ٤٠ بلاغاً
 * لا يتغيّر وصفها بوصول بلاغ واحد جديد.
 */
export function needsSummary(cluster: Cluster): boolean {
  const count = cluster.reportIds.length;
  if (count < SUMMARY_MIN_REPORTS) return false;
  if (!cluster.summary) return true;
  return count >= cluster.summary.basedOn * 2;
}

/**
 * توليد ملخّص المشكلة عبر الخادم.
 *
 * تعيد `null` عند أي فشل — غياب المفتاح، انقطاع الشبكة، أو تأخر الرد. لا يوجد
 * ارتداد محلي هنا: النظام يعرض عنوانه القالبي ويبقى صادقاً في أن لا ملخّص.
 */
export async function summarizeCluster(
  cluster: Cluster,
  texts: string[],
): Promise<ClusterSummary | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subtype: cluster.subtype,
        zoneId: cluster.zoneId,
        category: cluster.category,
        severity: cluster.severity,
        texts: texts.slice(-MAX_SUMMARY_INPUTS),
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Partial<ClusterSummary>;
    if (!data?.titleAr || !data.titleEn || !data.summaryAr || !data.summaryEn) return null;

    return {
      titleAr: data.titleAr,
      titleEn: data.titleEn,
      summaryAr: data.summaryAr,
      summaryEn: data.summaryEn,
      actionAr: data.actionAr ?? "",
      actionEn: data.actionEn ?? "",
      basedOn: data.basedOn ?? texts.length,
      at: Date.now(),
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
