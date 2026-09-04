import { classifyLocal } from "./ai";
import type { Classification } from "./types";

/**
 * واجهة التصنيف الموحّدة التي يستدعيها التطبيق.
 *
 * تحاول أولاً التصنيف بالنموذج اللغوي عبر الخادم، وترتد إلى المحرك المحلي عند
 * أي فشل — انقطاع شبكة، بطء، أو غياب مفتاح API. النتيجة تحمل الحقل `source`
 * الذي يبيّن أي محرك أنتجها.
 */
export async function classifyReport(text: string, zoneId: string): Promise<Classification> {
  // مهلة قصيرة: تجربة المستخدم أهم من انتظار استجابة متأخرة
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, zoneId }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as Partial<Classification>;
    if (!data?.subtype || !data.severity || !data.zoneId) throw new Error("رد غير مكتمل");

    return data as Classification;
  } catch {
    return classifyLocal(text, zoneId);
  } finally {
    clearTimeout(timer);
  }
}
