export type CategoryId =
  | "crowding"
  | "cleanliness"
  | "safety"
  | "food"
  | "ticketing"
  | "transport"
  | "facilities"
  | "wayfinding"
  | "medical"
  | "connectivity"
  | "other";

export type SeverityId = "low" | "medium" | "high" | "critical";
export type ChannelId = "app" | "web" | "kiosk" | "social";
export type StatusId = "new" | "in_progress" | "resolved";
export type SourceId = "text" | "voice";

export interface Report {
  id: string;
  /** النص الأصلي كما ورد — يبقى مرجعاً لا يتغيّر */
  text: string;
  /** ترجمة النص للعربية (المسار السحابي) */
  textAr?: string;
  /** ترجمة النص للإنجليزية (المسار السحابي) */
  textEn?: string;
  /** النوع الفرعي المستقل عن اللغة، مثل facilities:elevator */
  subtype: string;
  lang: string;
  channel: ChannelId;
  source: SourceId;
  zoneId: string;
  category: CategoryId;
  severity: SeverityId;
  confidence: number;
  keywords: string[];
  createdAt: number;
  clusterId: string;
  reporterName?: string;
}

/**
 * ملخّص المشكلة المولَّد من مجموع بلاغاتها.
 *
 * `basedOn` هو عدد البلاغات التي استُخلص منها الملخّص. مقارنته بعدد البلاغات
 * الحالي هي ما يكشف أن الملخّص تقادم ويحتاج تحديثاً — بلا هذا الحقل لا سبيل
 * للتمييز بين ملخّص يصف المشكلة كاملةً وآخر يصف أول بلاغين منها فقط.
 */
export interface ClusterSummary {
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  /** الإجراء المقترح على فريق العمليات */
  actionAr: string;
  actionEn: string;
  basedOn: number;
  at: number;
}

export interface Cluster {
  id: string;
  /** عنوان قالبي من النوع والموقع — يُستخدم ما لم يوجد ملخّص مولَّد */
  title: string;
  /** النوع الفرعي الذي تُجمَّع البلاغات عليه */
  subtype: string;
  category: CategoryId;
  zoneId: string;
  severity: SeverityId;
  status: StatusId;
  reportIds: string[];
  firstSeen: number;
  lastSeen: number;
  assignedTo: string;
  /** لحظة أول إجراء من الجهة المختصة — أساس قياس زمن الاستجابة */
  firstActionAt?: number;
  /** لحظة الإغلاق — أساس قياس زمن المعالجة */
  resolvedAt?: number;
  /** سجل الإجراءات المتخذة */
  timeline: { at: number; text: string }[];
  /** الملخّص المولَّد بنموذج لغوي — يغيب حتى يُستدعى بنجاح */
  summary?: ClusterSummary;
}

export interface Classification {
  /** النوع الفرعي المستقل عن اللغة — أساس التجميع */
  subtype: string;
  category: CategoryId;
  severity: SeverityId;
  zoneId: string;
  keywords: string[];
  confidence: number;
  lang: string;
  /** ترجمة نص البلاغ للعربية — المسار السحابي فقط */
  textAr?: string;
  /** ترجمة نص البلاغ للإنجليزية — المسار السحابي فقط */
  textEn?: string;
  /** أي محرك أنتج هذا التصنيف */
  source: "local" | "claude";
}
