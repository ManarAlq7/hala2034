import type { CategoryId, ChannelId, Locale, SeverityId, StatusId } from "./types";

/* -------------------------------------------------------------------------- */
/*  المصطلحات: الفئات، المواقع، القنوات، درجات الخطورة، الحالات                  */
/*                                                                             */
/*  كل مصطلح يحمل تسميتيه العربية والإنجليزية معاً. التسمية تُختار لحظة العرض    */
/*  لا لحظة الحفظ، فتبديل لغة الواجهة يغيّر كل ما هو معروض على الشاشة فوراً       */
/*  بما في ذلك بيانات محفوظة منذ زمن.                                            */
/* -------------------------------------------------------------------------- */

/** اختيار التسمية بلغة العرض */
export const pick = (locale: Locale, ar: string, en: string) => (locale === "en" ? en : ar);

export interface CategoryDef {
  id: CategoryId;
  label: string;
  labelEn: string;
  icon: string;
  /** الجهة المختصة التي تُحوَّل لها المشكلة */
  owner: string;
  ownerEn: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "crowding", label: "ازدحام وتكدّس", labelEn: "Crowding", icon: "👥", owner: "إدارة تنظيم الحشود", ownerEn: "Crowd Management" },
  { id: "transport", label: "نقل ومواصلات", labelEn: "Transport", icon: "🚌", owner: "الهيئة العامة للنقل", ownerEn: "Transport Authority" },
  { id: "ticketing", label: "تذاكر ودخول", labelEn: "Ticketing", icon: "🎫", owner: "إدارة التذاكر والدخول", ownerEn: "Ticketing & Access" },
  { id: "cleanliness", label: "نظافة", labelEn: "Cleanliness", icon: "🧹", owner: "خدمات الموقع", ownerEn: "Venue Services" },
  { id: "facilities", label: "مرافق ودورات مياه", labelEn: "Facilities", icon: "🚻", owner: "خدمات الموقع", ownerEn: "Venue Services" },
  { id: "food", label: "طعام ومشروبات", labelEn: "Food & Beverage", icon: "🥤", owner: "إدارة الضيافة", ownerEn: "Hospitality" },
  { id: "safety", label: "سلامة وأمن", labelEn: "Safety & Security", icon: "🛡️", owner: "الأمن العام", ownerEn: "Public Security" },
  { id: "medical", label: "حالة طبية", labelEn: "Medical", icon: "🚑", owner: "الهلال الأحمر", ownerEn: "Red Crescent" },
  { id: "wayfinding", label: "إرشاد وتوجيه", labelEn: "Wayfinding", icon: "🧭", owner: "خدمة الجماهير", ownerEn: "Fan Services" },
  { id: "connectivity", label: "شبكة واتصالات", labelEn: "Connectivity", icon: "📶", owner: "التشغيل التقني", ownerEn: "Technical Operations" },
  { id: "other", label: "أخرى", labelEn: "Other", icon: "💬", owner: "مركز العمليات", ownerEn: "Operations Centre" },
];

export const categoryById = (id: CategoryId): CategoryDef =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

export const categoryLabel = (id: CategoryId, locale: Locale) =>
  pick(locale, categoryById(id).label, categoryById(id).labelEn);

/** الجهة المختصة — تُشتق من الفئة عند العرض لا تُقرأ من نص محفوظ */
export const categoryOwner = (id: CategoryId, locale: Locale) =>
  pick(locale, categoryById(id).owner, categoryById(id).ownerEn);

export interface ZoneDef {
  id: string;
  label: string;
  labelEn: string;
  /** الموقع على الخريطة الحرارية بالنسبة المئوية */
  x: number;
  y: number;
  venue: string;
  venueEn: string;
}

const STADIUM = { venue: "الاستاد", venueEn: "Stadium" };
const OUTSIDE = { venue: "خارج الاستاد", venueEn: "Outside the stadium" };

export const ZONES: ZoneDef[] = [
  { id: "gate_a", label: "البوابة A", labelEn: "Gate A", x: 18, y: 22, ...STADIUM },
  { id: "gate_b", label: "البوابة B", labelEn: "Gate B", x: 50, y: 14, ...STADIUM },
  { id: "gate_c", label: "البوابة C", labelEn: "Gate C", x: 82, y: 22, ...STADIUM },
  { id: "stands_north", label: "المدرج الشمالي", labelEn: "North Stand", x: 50, y: 38, ...STADIUM },
  { id: "stands_south", label: "المدرج الجنوبي", labelEn: "South Stand", x: 50, y: 62, ...STADIUM },
  { id: "concourse", label: "الممرات الداخلية", labelEn: "Concourse", x: 22, y: 50, ...STADIUM },
  { id: "food_court", label: "منطقة المطاعم", labelEn: "Food Court", x: 78, y: 50, ...STADIUM },
  { id: "fan_zone", label: "منطقة المشجعين", labelEn: "Fan Zone", x: 16, y: 78, ...OUTSIDE },
  { id: "parking", label: "المواقف", labelEn: "Parking", x: 50, y: 86, ...OUTSIDE },
  { id: "metro", label: "محطة القطار", labelEn: "Metro Station", x: 84, y: 78, ...OUTSIDE },
];

export const zoneById = (id: string): ZoneDef => ZONES.find((z) => z.id === id) ?? ZONES[0];

export const zoneLabel = (id: string, locale: Locale) =>
  pick(locale, zoneById(id).label, zoneById(id).labelEn);

export const zoneVenue = (id: string, locale: Locale) =>
  pick(locale, zoneById(id).venue, zoneById(id).venueEn);

export const CHANNELS: { id: ChannelId; label: string; labelEn: string; icon: string }[] = [
  { id: "app", label: "تطبيق الجوال", labelEn: "Mobile app", icon: "📱" },
  { id: "web", label: "الموقع الإلكتروني", labelEn: "Website", icon: "🌐" },
  { id: "kiosk", label: "المراكز الاستشارية", labelEn: "Help desk", icon: "🎧" },
  { id: "social", label: "وسائل التواصل", labelEn: "Social media", icon: "🔗" },
];

export const channelLabel = (id: ChannelId, locale: Locale) => {
  const c = CHANNELS.find((x) => x.id === id);
  return c ? pick(locale, c.label, c.labelEn) : id;
};

/** نغمة اللون في نظام التصميم — الشارات كلها تُبنى منها فلا يخترع كل مكوّن لوناً */
export type Tone = "neutral" | "info" | "warn" | "danger" | "ok" | "brand";

export const SEVERITIES: {
  id: SeverityId;
  label: string;
  labelEn: string;
  weight: number;
  tone: Tone;
  /** لون النقطة على الخريطة */
  color: string;
}[] = [
  { id: "low", label: "منخفض", labelEn: "Low", weight: 1, tone: "neutral", color: "var(--text-dim)" },
  { id: "medium", label: "متوسط", labelEn: "Medium", weight: 2, tone: "info", color: "var(--info)" },
  { id: "high", label: "عالي", labelEn: "High", weight: 3, tone: "warn", color: "var(--warn)" },
  { id: "critical", label: "حرج", labelEn: "Critical", weight: 4, tone: "danger", color: "var(--danger)" },
];

export const severityDef = (id: SeverityId) => SEVERITIES.find((s) => s.id === id) ?? SEVERITIES[0];

export const severityLabel = (id: SeverityId, locale: Locale) =>
  pick(locale, severityDef(id).label, severityDef(id).labelEn);

export const STATUSES: { id: StatusId; label: string; labelEn: string; tone: Tone }[] = [
  { id: "new", label: "جديد", labelEn: "New", tone: "danger" },
  { id: "in_progress", label: "قيد المعالجة", labelEn: "In progress", tone: "warn" },
  { id: "resolved", label: "تم الإغلاق", labelEn: "Resolved", tone: "ok" },
];

export const statusDef = (id: StatusId) => STATUSES.find((s) => s.id === id) ?? STATUSES[0];

export const statusLabel = (id: StatusId, locale: Locale) =>
  pick(locale, statusDef(id).label, statusDef(id).labelEn);
