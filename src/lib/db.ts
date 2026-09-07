import { CLUSTER_WINDOW_MS, findOrCreateCluster } from "./ai";
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
  TimelineEntry,
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
  timeline: TimelineEntry[] | null;
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
  track_code: string | null;
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
  trackCode: row.track_code ?? undefined,
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

  /*
   * البلاغات مقصورة على فريق العمليات وعلى صاحبها. المشجّع الذي يفتح الصفحة
   * يُردّ بلا شيء، وهذا ليس عطلاً: المشكلات وحدها هي ما يحتاجه، فلا يُرفع خطأ
   * ولا تُعطَّل الصفحة لأجل ما لا يحقّ له أصلاً.
   */
  if (reportRes.error && reportRes.error.code !== "42501") throw reportRes.error;

  const reports = ((reportRes.data ?? []) as ReportRow[]).map(toReport);

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

  /*
   * المشكلة المقترحة تُحسب هنا لا في القاعدة: العنوان والجهة المسؤولة يأتيان
   * من تصنيف الأنواع في `taxonomy`، ونسخُه إلى SQL يعني نسختين تفترقان.
   * القاعدة تأخذ هذا الاقتراح ولا تستعمله إلا إن لم تجد مشكلة مفتوحة مطابقة.
   */
  const { cluster: proposed } = findOrCreateCluster([], classification, at, "new");

  const { data, error } = await db.rpc("submit_report", {
    p_report: {
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
    },
    p_new_cluster: { title: proposed.title, assigned_to: proposed.assignedTo },
    p_window_ms: CLUSTER_WINDOW_MS,
  });
  if (error) throw error;

  const payload = data as {
    report: ReportRow;
    cluster: ClusterRow;
    is_new: boolean;
    report_count: number;
  };

  const report = toReport(payload.report);
  const cluster = toCluster(payload.cluster, [report.id]);

  return {
    report,
    cluster,
    isNewCluster: payload.is_new,
    similarCount: payload.report_count,
  };
}

/**
 * تتبّع بلاغ برمزه.
 *
 * لم يعد المتصفح يقرأ جدول البلاغات، فالتتبّع يمرّ بدالّة تُرجع بلاغاً واحداً
 * ومشكلته. والبحث بالرمز العشوائي لا بالمعرّف المتسلسل: عدّ الأرقام من واحد
 * إلى ألف ليس اكتشافاً يُكافأ عليه أحد.
 */
export async function trackInDb(
  code: string,
): Promise<{ report: Report; cluster: Cluster; siblingCount: number } | null> {
  const { data, error } = await supabase().rpc("track_report", { p_code: code });
  if (error) throw error;
  if (!data) return null;

  const payload = data as { report: ReportRow; cluster: ClusterRow; report_count: number };
  const report = toReport(payload.report);
  return {
    report,
    cluster: toCluster(payload.cluster, [report.id]),
    siblingCount: payload.report_count,
  };
}

/** قراءة المشكلة قبل الإضافة إلى سجلّها — السجل يُلحق به ولا يُستبدل */
async function readCluster(id: string): Promise<ClusterRow> {
  const { data, error } = await supabase().from("clusters").select("*").eq("id", id).single();
  if (error) throw error;
  return data as ClusterRow;
}

/*
 * كتابات فريق العمليات تمرّ بدوالّ لا بأعمدة.
 *
 * منذ أن فُتح تسجيل الدخول للجمهور لم يعد «مسجَّل دخول» يعني «مشغّل». وحدود
 * الأعمدة في قاعدة البيانات لا تعرف من صاحب الجلسة، فنُقلت هذه الكتابات إلى
 * دوالّ تسأل عن العضوية أوّلاً وترفض بـ 42501 من ليس عضواً. المشجّع المسجَّل
 * لا يملك على المشكلات إلا الأعمدة الثلاثة التي يملكها الزائر.
 */
export async function setStatusInDb(clusterId: string, status: StatusId, entry: TimelineEntry) {
  const now = entry.at;
  const row = await readCluster(clusterId);

  const { error } = await supabase().rpc("ops_set_status", {
    p_cluster_id: clusterId,
    p_status: status,
    // زمن أول إجراء يُسجَّل مرة واحدة: إعادة الفتح لا تُعيد ضبط قياس الاستجابة
    p_first_action: status === "new" ? row.first_action_at : (row.first_action_at ?? iso(now)),
    p_resolved: status === "resolved" ? iso(now) : null,
    p_timeline: [...(row.timeline ?? []), entry],
  });
  if (error) throw error;
}

export async function addNoteInDb(clusterId: string, text: string) {
  const now = Date.now();
  const row = await readCluster(clusterId);

  const { error } = await supabase().rpc("ops_add_note", {
    p_cluster_id: clusterId,
    p_first_action: row.first_action_at ?? iso(now),
    p_timeline: [...(row.timeline ?? []), { at: now, text }],
  });
  if (error) throw error;
}

export async function saveSummaryInDb(clusterId: string, summary: ClusterSummary) {
  const { error } = await supabase().rpc("ops_save_summary", {
    p_cluster_id: clusterId,
    p_summary: summary,
  });
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
  await resetDb(state);
}

/**
 * مسح كل شيء ثم إعادة البذر.
 *
 * كانت تكتب على الجدولين مباشرة، وقد سُحبت تلك الصلاحية من المتصفح حين أُغلق
 * الإرسال في ممرّ واحد. فالعملية كلها الآن دالّة محروسة: تحذف وتُدرج داخل
 * معاملة واحدة، وترفض من ليس في فريق العمليات.
 */
export async function resetDb(state: DbState): Promise<void> {
  const { error } = await supabase().rpc("ops_replace_state", {
    p_clusters: state.clusters.map((c) => ({
      id: c.id,
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
    })),
    p_reports: state.reports.map((r) => ({
      cluster_id: r.clusterId,
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
    })),
  });
  if (error) throw error;
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
