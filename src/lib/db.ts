import { absorbReport, findOrCreateCluster } from "./ai";
import { supabase } from "./supabase";
import type {
  CategoryId,
  ChannelId,
  Classification,
  Cluster,
  ClusterSummary,
  Report,
  SeverityId,
  SourceId,
  StatusId,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  التخزين المشترك                                                            */
/*                                                                             */
/*  يحوّل بين صفوف قاعدة البيانات ونماذج التطبيق، ويشترك مع التخزين المحلي في   */
/*  نفس منطق التجميع والتصعيد (findOrCreateCluster / absorbReport) — فالمسلك    */
/*  واحد أياً كان مكان الحفظ.                                                    */
/*                                                                             */
/*  الأزمنة: قاعدة البيانات تحفظ timestamptz، والتطبيق يعمل بملّي ثانية منذ      */
/*  الحقبة. التحويل يقع هنا وحده فلا يتسرّب أي تنسيق إلى الواجهات.               */
/* -------------------------------------------------------------------------- */

interface ClusterRow {
  id: string;
  title: string;
  subtype: string;
  category: string;
  zone_id: string;
  severity: string;
  status: string;
  first_seen: string;
  last_seen: string;
  assigned_to: string;
  first_action_at: string | null;
  resolved_at: string | null;
  timeline: { at: number; text: string }[] | null;
  summary: ClusterSummary | null;
}

interface ReportRow {
  id: string;
  cluster_id: string;
  text: string;
  text_ar: string | null;
  text_en: string | null;
  subtype: string;
  lang: string;
  channel: string;
  source: string;
  zone_id: string;
  category: string;
  severity: string;
  confidence: number;
  keywords: string[] | null;
  reporter_name: string | null;
  created_at: string;
}

const ms = (value: string) => new Date(value).getTime();
const iso = (at: number) => new Date(at).toISOString();

const toCluster = (row: ClusterRow, reportIds: string[]): Cluster => ({
  id: row.id,
  title: row.title,
  subtype: row.subtype,
  category: row.category as CategoryId,
  zoneId: row.zone_id,
  severity: row.severity as SeverityId,
  status: row.status as StatusId,
  reportIds,
  firstSeen: ms(row.first_seen),
  lastSeen: ms(row.last_seen),
  assignedTo: row.assigned_to,
  firstActionAt: row.first_action_at ? ms(row.first_action_at) : undefined,
  resolvedAt: row.resolved_at ? ms(row.resolved_at) : undefined,
  timeline: row.timeline ?? [],
  summary: row.summary ?? undefined,
});

const toReport = (row: ReportRow): Report => ({
  id: row.id,
  text: row.text,
  textAr: row.text_ar ?? undefined,
  textEn: row.text_en ?? undefined,
  subtype: row.subtype,
  lang: row.lang,
  channel: row.channel as ChannelId,
  source: row.source as SourceId,
  zoneId: row.zone_id,
  category: row.category as CategoryId,
  severity: row.severity as SeverityId,
  confidence: row.confidence,
  keywords: row.keywords ?? [],
  createdAt: ms(row.created_at),
  clusterId: row.cluster_id,
  reporterName: row.reporter_name ?? undefined,
});

/** صف مشكلة جاهز للإدراج — بلا `id` فقاعدة البيانات هي التي ترقّم */
const clusterInsert = (c: Cluster) => ({
  title: c.title,
  subtype: c.subtype,
  category: c.category,
  zone_id: c.zoneId,
  severity: c.severity,
  status: c.status,
  first_seen: iso(c.firstSeen),
  last_seen: iso(c.lastSeen),
  assigned_to: c.assignedTo,
  first_action_at: c.firstActionAt ? iso(c.firstActionAt) : null,
  resolved_at: c.resolvedAt ? iso(c.resolvedAt) : null,
  timeline: c.timeline,
  summary: c.summary ?? null,
});

/* --------------------------------- القراءة --------------------------------- */

export interface DbState {
  reports: Report[];
  clusters: Cluster[];
}

/** تحميل الحالة كاملةً: المشكلات وبلاغاتها، بالأحدث أولاً */
export async function fetchState(): Promise<DbState> {
  const db = supabase();

  const [clusterRes, reportRes] = await Promise.all([
    db.from("clusters").select("*").order("last_seen", { ascending: false }),
    db.from("reports").select("*").order("created_at", { ascending: false }),
  ]);

  if (clusterRes.error) throw clusterRes.error;
  if (reportRes.error) throw reportRes.error;

  const reports = (reportRes.data as ReportRow[]).map(toReport);

  // البلاغات مرتّبة بالأحدث أولاً، أما معرّفاتها داخل كل مشكلة فبالأقدم أولاً،
  // لأن السجل الزمني والملخّص يُقرآن بترتيب وقوع الأحداث
  const idsByCluster = new Map<string, string[]>();
  for (let i = reports.length - 1; i >= 0; i--) {
    const r = reports[i];
    const list = idsByCluster.get(r.clusterId);
    if (list) list.push(r.id);
    else idsByCluster.set(r.clusterId, [r.id]);
  }

  const clusters = (clusterRes.data as ClusterRow[]).map((row) =>
    toCluster(row, idsByCluster.get(row.id) ?? []),
  );

  return { reports, clusters };
}

/* --------------------------------- الكتابة --------------------------------- */

export interface DbSubmitInput {
  text: string;
  zoneId: string;
  channel: ChannelId;
  source: SourceId;
  reporterName?: string;
  at?: number;
}

export interface DbSubmitResult {
  report: Report;
  cluster: Cluster;
  isNewCluster: boolean;
  similarCount: number;
}

/**
 * استقبال بلاغ مصنَّف وضمّه إلى مشكلة.
 *
 * المشكلات المفتوحة تُقرأ من قاعدة البيانات لحظة الوصول لا من نسخة المتصفح،
 * فبلاغ أُرسل من جهاز آخر عن نفس المشكلة يُضَم إليها بدل إنشاء مشكلة ثانية.
 */
export async function submitToDb(
  input: DbSubmitInput,
  classification: Classification,
): Promise<DbSubmitResult> {
  const db = supabase();
  const at = input.at ?? Date.now();

  const { data: openRows, error: openErr } = await db
    .from("clusters")
    .select("*")
    .eq("subtype", classification.subtype)
    .eq("zone_id", classification.zoneId)
    .neq("status", "resolved")
    .order("last_seen", { ascending: false });
  if (openErr) throw openErr;

  const open = (openRows as ClusterRow[]).map((row) => toCluster(row, []));
  const { cluster: matched, isNew } = findOrCreateCluster(open, classification, at, "new");

  let clusterId = matched.id;
  let reportCount = 1;

  if (isNew) {
    const { data, error } = await db
      .from("clusters")
      .insert(clusterInsert(matched))
      .select("id")
      .single();
    if (error) throw error;
    clusterId = (data as { id: string }).id;
  } else {
    const { count, error } = await db
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("cluster_id", clusterId);
    if (error) throw error;
    reportCount = (count ?? 0) + 1;
  }

  const { data: reportRow, error: reportErr } = await db
    .from("reports")
    .insert({
      cluster_id: clusterId,
      text: input.text,
      text_ar: classification.textAr ?? null,
      text_en: classification.textEn ?? null,
      subtype: classification.subtype,
      lang: classification.lang,
      channel: input.channel,
      source: input.source,
      zone_id: classification.zoneId,
      category: classification.category,
      severity: classification.severity,
      confidence: classification.confidence,
      keywords: classification.keywords,
      reporter_name: input.reporterName ?? null,
      created_at: iso(at),
    })
    .select("*")
    .single();
  if (reportErr) throw reportErr;

  const { severity, timeline } = absorbReport(matched, classification, reportCount, at, isNew);

  const { data: updatedRow, error: updateErr } = await db
    .from("clusters")
    .update({ last_seen: iso(at), severity, timeline })
    .eq("id", clusterId)
    .select("*")
    .single();
  if (updateErr) throw updateErr;

  const report = toReport(reportRow as ReportRow);
  const cluster = toCluster(updatedRow as ClusterRow, [report.id]);

  return { report, cluster, isNewCluster: isNew, similarCount: reportCount };
}

/** قراءة المشكلة قبل الإضافة إلى سجلّها — السجل يُلحق به ولا يُستبدل */
async function readCluster(id: string): Promise<ClusterRow> {
  const { data, error } = await supabase().from("clusters").select("*").eq("id", id).single();
  if (error) throw error;
  return data as ClusterRow;
}

export async function setStatusInDb(clusterId: string, status: StatusId, note: string) {
  const now = Date.now();
  const row = await readCluster(clusterId);

  const { error } = await supabase()
    .from("clusters")
    .update({
      status,
      // زمن أول إجراء يُسجَّل مرة واحدة: إعادة الفتح لا تُعيد ضبط قياس الاستجابة
      first_action_at: status === "new" ? row.first_action_at : (row.first_action_at ?? iso(now)),
      resolved_at: status === "resolved" ? iso(now) : null,
      timeline: [...(row.timeline ?? []), { at: now, text: note }],
    })
    .eq("id", clusterId);
  if (error) throw error;
}

export async function addNoteInDb(clusterId: string, text: string) {
  const now = Date.now();
  const row = await readCluster(clusterId);

  const { error } = await supabase()
    .from("clusters")
    .update({
      first_action_at: row.first_action_at ?? iso(now),
      timeline: [...(row.timeline ?? []), { at: now, text }],
    })
    .eq("id", clusterId);
  if (error) throw error;
}

export async function saveSummaryInDb(clusterId: string, summary: ClusterSummary) {
  const { error } = await supabase().from("clusters").update({ summary }).eq("id", clusterId);
  if (error) throw error;
}

/* --------------------------- البيانات التجريبية --------------------------- */

/** هل قاعدة البيانات فارغة؟ يُسأل قبل البذر فلا تُبذر مرتين */
export async function isEmpty(): Promise<boolean> {
  const { count, error } = await supabase()
    .from("clusters")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return (count ?? 0) === 0;
}

/**
 * بذر حالة تجريبية جاهزة.
 *
 * المشكلات تُدرج أولاً لتمنحها قاعدة البيانات معرّفاتها، ثم تُدرج البلاغات
 * بالمعرّفات الجديدة — فمعرّفات البناء المحلي لا تعبر إلى قاعدة البيانات.
 */
export async function seedDb(state: DbState): Promise<void> {
  const db = supabase();
  if (state.clusters.length === 0) return;

  const { data, error } = await db
    .from("clusters")
    .insert(state.clusters.map(clusterInsert))
    .select("id");
  if (error) throw error;

  const newIds = (data as { id: string }[]).map((r) => r.id);
  const idByLocal = new Map(state.clusters.map((c, i) => [c.id, newIds[i]]));

  const rows = state.reports
    .map((r) => {
      const clusterId = idByLocal.get(r.clusterId);
      if (!clusterId) return null;
      return {
        cluster_id: clusterId,
        text: r.text,
        text_ar: r.textAr ?? null,
        text_en: r.textEn ?? null,
        subtype: r.subtype,
        lang: r.lang,
        channel: r.channel,
        source: r.source,
        zone_id: r.zoneId,
        category: r.category,
        severity: r.severity,
        confidence: r.confidence,
        keywords: r.keywords,
        reporter_name: r.reporterName ?? null,
        created_at: iso(r.createdAt),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length > 0) {
    const { error: reportErr } = await db.from("reports").insert(rows);
    if (reportErr) throw reportErr;
  }
}

/** مسح كل شيء ثم إعادة البذر — البلاغات تُحذف مع مشكلاتها بحكم المفتاح الأجنبي */
export async function resetDb(state: DbState): Promise<void> {
  const { error } = await supabase().from("clusters").delete().neq("id", "");
  if (error) throw error;
  await seedDb(state);
}

/* ------------------------------- البث اللحظي ------------------------------- */

/**
 * الاشتراك في تغيّرات الجدولين.
 *
 * لا يُمرَّر محتوى التغيير: أي حدث يستدعي إعادة تحميل الحالة كاملةً. هذا أبطأ
 * نظرياً وأصحّ عملياً — إذ لا يمكن أن تنحرف نسخة المتصفح عن قاعدة البيانات
 * بسبب حدث ضاع أثناء انقطاع قصير في الاتصال.
 */
export function subscribeToDb(onChange: () => void): () => void {
  const channel = supabase()
    .channel("hala2034")
    .on("postgres_changes", { event: "*", schema: "public", table: "clusters" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, onChange)
    .subscribe();

  return () => {
    void supabase().removeChannel(channel);
  };
}
