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
  text: string;
  /** النوع الفرعي المستقل عن اللغة، مثل facilities:elevator */
  subtype: string;
  /** النص الأصلي كما ورد إن كان بلغة غير العربية */
  originalText?: string;
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

export interface Cluster {
  id: string;
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
  /** أي محرك أنتج هذا التصنيف */
  source: "local" | "claude";
}
