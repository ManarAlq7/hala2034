import type { FanZone } from "./catalog";
import type { Locale } from "./types";

/* -------------------------------------------------------------------------- */
/*  مزايا مناطق المشجعين                                                        */
/*                                                                             */
/*  المزايا مفاتيح لا نصوص: النصّ الحرّ لا يحمل أيقونة ولا يُترجم ولا يُقارَن،       */
/*  والمفتاح يفعل الثلاثة. وترتيبها هنا هو ترتيب عرضها — ما يقصده المشجّع أولاً    */
/*  (الشاشة والطعام) قبل ما يطمئنّه (إسعاف ومصلّى) قبل ما يوصله (مترو ومواقف).    */
/* -------------------------------------------------------------------------- */

export type AmenityGroup = "watch" | "comfort" | "access";

export interface Amenity {
  key: string;
  icon: string;
  group: AmenityGroup;
  ar: string;
  en: string;
  /** سطر يشرح ما يعنيه هذا للمشجّع فعلاً، لا تكراراً للاسم */
  noteAr: string;
  noteEn: string;
}

export const AMENITIES: Amenity[] = [
  {
    key: "giant_screen",
    icon: "📺",
    group: "watch",
    ar: "شاشة عملاقة",
    en: "Giant screen",
    noteAr: "كل المباريات تُنقل مباشرة على شاشة واحدة كبيرة.",
    noteEn: "Every match live on one large screen.",
  },
  {
    key: "screens",
    icon: "🖥️",
    group: "watch",
    ar: "شاشات موزّعة",
    en: "Screens throughout",
    noteAr: "شاشات في أنحاء الساحة، فلا يوجد مكان بلا رؤية.",
    noteEn: "Screens across the site, so no spot is a bad spot.",
  },
  {
    key: "stage",
    icon: "🎤",
    group: "watch",
    ar: "مسرح فعاليات",
    en: "Events stage",
    noteAr: "حفلات وفقرات بين المباريات وبعدها.",
    noteEn: "Live acts between and after matches.",
  },
  {
    key: "shows",
    icon: "🎆",
    group: "watch",
    ar: "عروض مسائية",
    en: "Evening shows",
    noteAr: "عرض يسبق كل مباراة مساءً.",
    noteEn: "A show before every evening match.",
  },
  {
    key: "ar_experience",
    icon: "🥽",
    group: "watch",
    ar: "تجارب واقع معزّز",
    en: "Augmented reality",
    noteAr: "تجارب تفاعلية بنظّارات ومساحات معزّزة.",
    noteEn: "Interactive AR experiences on site.",
  },
  {
    key: "games",
    icon: "⚽",
    group: "watch",
    ar: "ألعاب تفاعلية",
    en: "Interactive games",
    noteAr: "تحدّيات كرة قدم ومسابقات للزوّار.",
    noteEn: "Football challenges and visitor contests.",
  },
  {
    key: "heritage",
    icon: "🪘",
    group: "watch",
    ar: "فعاليات تراثية",
    en: "Heritage programme",
    noteAr: "عروض وحرف محلية بين المباريات.",
    noteEn: "Local crafts and performances between matches.",
  },
  {
    key: "seaview",
    icon: "🌊",
    group: "watch",
    ar: "إطلالة بحرية",
    en: "Waterfront setting",
    noteAr: "الساحة مفتوحة على الواجهة البحرية.",
    noteEn: "The site opens onto the waterfront.",
  },

  {
    key: "food",
    icon: "🍽️",
    group: "comfort",
    ar: "أسواق طعام",
    en: "Food market",
    noteAr: "عربات ومطاعم متنوّعة داخل الساحة.",
    noteEn: "Trucks and kitchens inside the zone.",
  },
  {
    key: "cafe",
    icon: "☕",
    group: "comfort",
    ar: "مقاهي",
    en: "Cafés",
    noteAr: "مقاهٍ للجلوس بين المباريات.",
    noteEn: "Places to sit between matches.",
  },
  {
    key: "family",
    icon: "👨‍👩‍👧",
    group: "comfort",
    ar: "ركن العائلات",
    en: "Family area",
    noteAr: "مساحة مخصّصة للعائلات بعيداً عن الزحام.",
    noteEn: "A dedicated family space away from the crush.",
  },
  {
    key: "kids",
    icon: "🎠",
    group: "comfort",
    ar: "ألعاب أطفال",
    en: "Kids' play",
    noteAr: "منطقة ألعاب مؤمّنة للصغار.",
    noteEn: "A supervised play area for children.",
  },
  {
    key: "shade",
    icon: "⛱️",
    group: "comfort",
    ar: "مظلات وتبريد",
    en: "Shade and cooling",
    noteAr: "مناطق مظلّلة ونقاط تبريد.",
    noteEn: "Shaded areas and cooling points.",
  },
  {
    key: "water",
    icon: "🚰",
    group: "comfort",
    ar: "مياه مجانية",
    en: "Free water",
    noteAr: "نقاط تعبئة مياه مجانية.",
    noteEn: "Free refill points.",
  },
  {
    key: "wifi",
    icon: "📶",
    group: "comfort",
    ar: "واي فاي مجاني",
    en: "Free Wi-Fi",
    noteAr: "شبكة مفتوحة داخل الساحة.",
    noteEn: "Open network across the zone.",
  },

  {
    key: "prayer",
    icon: "🕌",
    group: "access",
    ar: "مصلّى",
    en: "Prayer area",
    noteAr: "مصلّى للرجال والنساء.",
    noteEn: "Prayer space for men and women.",
  },
  {
    key: "restrooms",
    icon: "🚻",
    group: "access",
    ar: "دورات مياه",
    en: "Restrooms",
    noteAr: "دورات مياه موزّعة على الساحة.",
    noteEn: "Restrooms across the site.",
  },
  {
    key: "first_aid",
    icon: "⛑️",
    group: "access",
    ar: "إسعافات أولية",
    en: "First aid",
    noteAr: "نقطة إسعاف بطاقم طبي طوال العمل.",
    noteEn: "A staffed first-aid point during opening hours.",
  },
  {
    key: "accessible",
    icon: "♿",
    group: "access",
    ar: "مهيّأة لذوي الإعاقة",
    en: "Step-free access",
    noteAr: "مسارات ومواقف ودورات مياه مهيّأة.",
    noteEn: "Step-free routes, parking and restrooms.",
  },
  {
    key: "lost_found",
    icon: "🧭",
    group: "access",
    ar: "مفقودات",
    en: "Lost and found",
    noteAr: "نقطة للمفقودات ولمّ شمل التائهين.",
    noteEn: "A lost property and reunion point.",
  },
  {
    key: "metro",
    icon: "🚇",
    group: "access",
    ar: "محطة مترو",
    en: "Metro station",
    noteAr: "محطة مترو على مسافة مشي.",
    noteEn: "A metro station within walking distance.",
  },
  {
    key: "parking",
    icon: "🅿️",
    group: "access",
    ar: "مواقف",
    en: "Parking",
    noteAr: "مواقف مخصّصة للزوّار.",
    noteEn: "Visitor parking on site.",
  },
  {
    key: "self_driving",
    icon: "🚐",
    group: "access",
    ar: "نقل ذاتي القيادة",
    en: "Self-driving shuttle",
    noteAr: "مركبات ذاتية القيادة بين الساحة والملعب.",
    noteEn: "Driverless shuttles between the zone and the stadium.",
  },
];

const BY_KEY = new Map(AMENITIES.map((a) => [a.key, a]));

export const amenityByKey = (key: string): Amenity | undefined => BY_KEY.get(key);

export const amenityName = (a: Amenity, locale: Locale) => (locale === "ar" ? a.ar : a.en);
export const amenityNote = (a: Amenity, locale: Locale) => (locale === "ar" ? a.noteAr : a.noteEn);

/** مزايا المنطقة مرتّبةً بترتيب الفهرس أعلاه، لا بترتيب ما ورد من القاعدة */
export function zoneAmenities(zone: FanZone): Amenity[] {
  const set = new Set(zone.amenities ?? []);
  return AMENITIES.filter((a) => set.has(a.key));
}

export const GROUP_LABEL: Record<AmenityGroup, { ar: string; en: string }> = {
  watch: { ar: "المشاهدة والفعاليات", en: "Watching and events" },
  comfort: { ar: "الراحة والضيافة", en: "Comfort and hospitality" },
  access: { ar: "الخدمات والوصول", en: "Services and access" },
};

/* --------------------------------- التوقيت --------------------------------- */

const minutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * هل المنطقة مفتوحة الآن؟
 *
 * أغلبها يغلق بعد منتصف الليل، فالإغلاق قبل الافتتاح رقمياً — والمقارنة
 * المباشرة تقول «مغلقة» طوال الأمسية وهي في ذروتها.
 */
export function isOpenNow(zone: FanZone, now: number): boolean {
  const d = new Date(now);
  const nowMin = d.getHours() * 60 + d.getMinutes();
  const open = minutes(zone.opensAt);
  const close = minutes(zone.closesAt);

  return close > open ? nowMin >= open && nowMin < close : nowMin >= open || nowMin < close;
}

/** دقائق حتى الافتتاح، أو صفر إن كانت مفتوحة */
export function minutesUntilOpen(zone: FanZone, now: number): number {
  if (isOpenNow(zone, now)) return 0;
  const d = new Date(now);
  const nowMin = d.getHours() * 60 + d.getMinutes();
  const open = minutes(zone.opensAt);
  return open >= nowMin ? open - nowMin : 24 * 60 - nowMin + open;
}
