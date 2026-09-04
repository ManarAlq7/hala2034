import type { CategoryId, ChannelId, SeverityId, StatusId } from "./types";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  labelEn: string;
  icon: string;
  /** الجهة المختصة التي تُحوَّل لها المشكلة */
  owner: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "crowding", label: "ازدحام وتكدّس", labelEn: "Crowding", icon: "👥", owner: "إدارة تنظيم الحشود" },
  { id: "transport", label: "نقل ومواصلات", labelEn: "Transport", icon: "🚌", owner: "الهيئة العامة للنقل" },
  { id: "ticketing", label: "تذاكر ودخول", labelEn: "Ticketing", icon: "🎫", owner: "إدارة التذاكر والدخول" },
  { id: "cleanliness", label: "نظافة", labelEn: "Cleanliness", icon: "🧹", owner: "خدمات الموقع" },
  { id: "facilities", label: "مرافق ودورات مياه", labelEn: "Facilities", icon: "🚻", owner: "خدمات الموقع" },
  { id: "food", label: "طعام ومشروبات", labelEn: "Food & Beverage", icon: "🥤", owner: "إدارة الضيافة" },
  { id: "safety", label: "سلامة وأمن", labelEn: "Safety & Security", icon: "🛡️", owner: "الأمن العام" },
  { id: "medical", label: "حالة طبية", labelEn: "Medical", icon: "🚑", owner: "الهلال الأحمر" },
  { id: "wayfinding", label: "إرشاد وتوجيه", labelEn: "Wayfinding", icon: "🧭", owner: "خدمة الجماهير" },
  { id: "connectivity", label: "شبكة واتصالات", labelEn: "Connectivity", icon: "📶", owner: "التشغيل التقني" },
  { id: "other", label: "أخرى", labelEn: "Other", icon: "💬", owner: "مركز العمليات" },
];

export const categoryById = (id: CategoryId): CategoryDef =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export interface ZoneDef {
  id: string;
  label: string;
  /** الموقع على الخريطة الحرارية بالنسبة المئوية */
  x: number;
  y: number;
  venue: string;
}

export const ZONES: ZoneDef[] = [
  { id: "gate_a", label: "البوابة A", x: 18, y: 22, venue: "الاستاد" },
  { id: "gate_b", label: "البوابة B", x: 50, y: 14, venue: "الاستاد" },
  { id: "gate_c", label: "البوابة C", x: 82, y: 22, venue: "الاستاد" },
  { id: "stands_north", label: "المدرج الشمالي", x: 50, y: 38, venue: "الاستاد" },
  { id: "stands_south", label: "المدرج الجنوبي", x: 50, y: 62, venue: "الاستاد" },
  { id: "concourse", label: "الممرات الداخلية", x: 22, y: 50, venue: "الاستاد" },
  { id: "food_court", label: "منطقة المطاعم", x: 78, y: 50, venue: "الاستاد" },
  { id: "fan_zone", label: "منطقة المشجعين", x: 16, y: 78, venue: "خارج الاستاد" },
  { id: "parking", label: "المواقف", x: 50, y: 86, venue: "خارج الاستاد" },
  { id: "metro", label: "محطة القطار", x: 84, y: 78, venue: "خارج الاستاد" },
];

export const zoneById = (id: string): ZoneDef =>
  ZONES.find((z) => z.id === id) ?? ZONES[0];

export const CHANNELS: { id: ChannelId; label: string; icon: string }[] = [
  { id: "app", label: "تطبيق الجوال", icon: "📱" },
  { id: "web", label: "الموقع الإلكتروني", icon: "🌐" },
  { id: "kiosk", label: "المراكز الاستشارية", icon: "🎧" },
  { id: "social", label: "وسائل التواصل", icon: "🔗" },
];

export const channelLabel = (id: ChannelId) =>
  CHANNELS.find((c) => c.id === id)?.label ?? id;

export const SEVERITIES: {
  id: SeverityId;
  label: string;
  weight: number;
  chip: string;
  dot: string;
}[] = [
  { id: "low", label: "منخفض", weight: 1, chip: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
  { id: "medium", label: "متوسط", weight: 2, chip: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  { id: "high", label: "عالي", weight: 3, chip: "bg-orange-50 text-orange-800 ring-orange-200", dot: "bg-orange-500" },
  { id: "critical", label: "حرج", weight: 4, chip: "bg-red-50 text-red-800 ring-red-200", dot: "bg-red-600" },
];

export const severityDef = (id: SeverityId) =>
  SEVERITIES.find((s) => s.id === id) ?? SEVERITIES[0];

export const STATUSES: { id: StatusId; label: string; chip: string }[] = [
  { id: "new", label: "جديد", chip: "bg-red-50 text-red-700 ring-red-200" },
  { id: "in_progress", label: "قيد المعالجة", chip: "bg-amber-50 text-amber-800 ring-amber-200" },
  { id: "resolved", label: "تم الإغلاق", chip: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
];

export const statusDef = (id: StatusId) =>
  STATUSES.find((s) => s.id === id) ?? STATUSES[0];
