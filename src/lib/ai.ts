import type { CategoryId, Classification, Cluster, Report, SeverityId } from "./types";
import { ZONES, categoryById, zoneById } from "./taxonomy";

/* -------------------------------------------------------------------------- */
/*  محرك الفهم والمعالجة — النسخة المحلية                                       */
/*                                                                             */
/*  يصنّف البلاغ إلى «نوع فرعي» (subtype) مستقل عن اللغة، مثل                   */
/*  facilities:elevator، بدل الاكتفاء بفئة عامة. هذا يحقق أمرين معاً:           */
/*    ١. بلاغ عربي وآخر إنجليزي عن نفس المشكلة يحملان نفس النوع الفرعي          */
/*       فيتجمّعان — وهي ميزة النظام الأساسية.                                   */
/*    ٢. مشكلتان مختلفتان في نفس الفئة والموقع (مصعد معطل / مقاعد مكسورة)       */
/*       تحملان نوعين مختلفين فلا تندمجان خطأً.                                 */
/*                                                                             */
/*  في النسخة السحابية يتولى نموذج لغوي التصنيف (انظر lib/classify.ts)،         */
/*  ويبقى هذا الملف كخط دفاع يعمل بلا مفتاح ولا إنترنت.                          */
/* -------------------------------------------------------------------------- */

const stripDiacritics = (s: string) =>
  s
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه");

const normalize = (s: string) =>
  stripDiacritics(s.toLowerCase()).replace(/\s+/g, " ").trim();

/* ------------------------------- كشف اللغة ------------------------------- */

/** كشف اللغة اعتماداً على النظام الكتابي ثم على كلمات دالة */
export function detectLang(text: string): string {
  if (/[؀-ۿ]/.test(text)) {
    if (/[پچژگیک]/.test(text)) return "fa";
    return "ar";
  }
  // الكانا والهانغول تُفحص قبل الكانجي، فالنص الياباني يحوي كانجي أيضاً
  if (/[぀-ヿ]/.test(text)) return "ja";
  if (/[가-힯]/.test(text)) return "ko";
  if (/[一-鿿]/.test(text)) return "zh";
  if (/[Ѐ-ӿ]/.test(text)) return "ru";
  if (/[ऀ-ॿ]/.test(text)) return "hi";
  const t = text.toLowerCase();
  if (/\b(el|la|los|las|muy|esta|hay|gente|puerta|bano|agua)\b/.test(t)) return "es";
  if (/\b(le|les|tres|porte|toilettes|monde|eau)\b/.test(t)) return "fr";
  if (/\b(der|die|das|sehr|eingang|wasser)\b/.test(t)) return "de";
  return "en";
}

export const LANG_LABELS: Record<string, string> = {
  ar: "العربية",
  en: "الإنجليزية",
  es: "الإسبانية",
  fr: "الفرنسية",
  de: "الألمانية",
  ru: "الروسية",
  zh: "الصينية",
  ja: "اليابانية",
  ko: "الكورية",
  hi: "الهندية",
  fa: "الفارسية",
};

export const langLabel = (code: string) => LANG_LABELS[code] ?? code;

/* ----------------------------- الأنواع الفرعية ----------------------------- */

export interface SubtypeDef {
  /** معرّف مستقل عن اللغة، بصيغة category:subtype */
  id: string;
  label: string;
  category: CategoryId;
  terms: string[];
  /** الحد الأدنى لخطورة هذا النوع مهما كانت صياغة البلاغ */
  floor?: SeverityId;
}

/** الأكثر تحديداً أولاً — عند تساوي عدد المطابقات يفوز الأسبق */
export const SUBTYPES: SubtypeDef[] = [
  /* ------------------------------- طبي ------------------------------- */
  {
    id: "medical:emergency",
    label: "حالة طبية طارئة",
    category: "medical",
    floor: "critical",
    terms: [
      "اغماء", "اغمي", "ما يتنفس", "نزيف", "اسعاف", "مصاب", "اصابه", "نوبه", "فاقد الوعي",
      "ambulance", "unconscious", "not breathing", "bleeding", "injured", "injury", "fainted",
      "medical emergency", "collapsed", "herido", "blesse", "malaise", "ambulancia",
    ],
  },
  {
    id: "medical:heat",
    label: "إجهاد حراري",
    category: "medical",
    floor: "high",
    terms: ["ضربه شمس", "دوخه", "اعياء", "جفاف", "heat stroke", "heatstroke", "dizzy", "dehydrated", "faint"],
  },

  /* ------------------------------ سلامة وأمن ------------------------------ */
  {
    id: "safety:fire",
    label: "حريق أو دخان",
    category: "safety",
    floor: "critical",
    terms: ["حريق", "دخان", "شب النار", "fire", "smoke", "burning", "incendio", "fumee"],
  },
  {
    id: "safety:crush",
    label: "تدافع وخطر تكدّس",
    category: "safety",
    floor: "critical",
    terms: ["تدافع", "دهس", "تكدس خطير", "stampede", "crush", "trampled"],
  },
  {
    id: "safety:missing_person",
    label: "شخص مفقود",
    category: "safety",
    floor: "critical",
    terms: ["طفل ضايع", "طفل مفقود", "ولدي ضاع", "missing child", "lost child", "nino perdido"],
  },
  {
    id: "safety:fight",
    label: "مشاجرة",
    category: "safety",
    floor: "high",
    terms: ["مشاجره", "عراك", "تعارك", "شجار", "fight", "brawl", "altercation", "bagarre", "pelea"],
  },
  {
    id: "safety:theft",
    label: "سرقة",
    category: "safety",
    floor: "high",
    terms: ["سرقه", "سرقوا", "انسرق", "نشل", "theft", "stolen", "pickpocket", "robo", "vol"],
  },
  {
    id: "safety:harassment",
    label: "تحرّش أو مضايقة",
    category: "safety",
    floor: "high",
    terms: ["تحرش", "مضايقه", "harassment", "harassed", "acoso"],
  },
  {
    id: "safety:hazard",
    label: "خطر في الموقع",
    category: "safety",
    floor: "high",
    terms: ["سلك مكشوف", "تسرب", "زجاج مكسور", "ارضيه زلقه", "غير امن", "خطر", "unsafe", "hazard", "danger", "leak", "peligro"],
  },

  /* ------------------------------- ازدحام ------------------------------- */
  {
    // الطابور الطويل والتكدّس في نفس الموقع مشكلة تشغيلية واحدة تعالجها نفس
    // الجهة بنفس الإجراء، فتُجمَّع تحت نوع واحد بدل تجزئتها إلى تذكرتين.
    id: "crowding:congestion",
    label: "ازدحام وطوابير",
    category: "crowding",
    terms: [
      "طابور", "طوابير", "صف طويل", "الصف ما يتحرك", "واقفين", "الدور طويل",
      "زحمه", "زحام", "ازدحام", "تكدس", "مزدحم", "الناس كثير", "مافي مكان",
      "queue", "long line", "line is long", "waiting in line", "not moving",
      "crowd", "crowded", "packed", "too many people", "jam", "bottleneck",
      "cola", "no avanza", "file d attente",
      "mucha gente", "gente", "lleno", "multitud", "foule", "beaucoup de monde",
    ],
  },
  {
    id: "crowding:exits",
    label: "ضيق المخارج",
    category: "crowding",
    terms: ["مخرج", "مخارج", "منافذ خروج", "الخروج صعب", "exit", "exits", "no way out", "salida"],
  },

  /* ------------------------------ نقل ومواصلات ------------------------------ */
  {
    id: "transport:bus",
    label: "الحافلات المكوكية",
    category: "transport",
    terms: ["باص", "باصات", "حافله", "حافلات", "الباص ما وصل", "bus", "buses", "shuttle", "autobus", "navette"],
  },
  {
    id: "transport:train",
    label: "القطار والمترو",
    category: "transport",
    terms: ["قطار", "مترو", "المحطه", "train", "metro", "subway", "station", "tren", "gare"],
  },
  {
    id: "transport:parking",
    label: "المواقف",
    category: "transport",
    terms: ["مواقف", "الموقف", "موقف السياره", "ما فيه موقف", "parking", "car park", "aparcamiento"],
  },
  {
    id: "transport:taxi",
    label: "سيارات الأجرة",
    category: "transport",
    terms: ["تاكسي", "اجره", "توصيله", "كابتن", "taxi", "cab", "ride", "uber"],
  },

  /* ------------------------------ تذاكر ودخول ------------------------------ */
  {
    // عطل القارئ ومنع الدخول حادثة واحدة لدى نفس الجهة عند نفس البوابة
    id: "ticketing:entry",
    label: "التذاكر والدخول",
    category: "ticketing",
    terms: [
      "باركود", "الكود ما يقرا", "ما تنقرا", "جهاز مسح", "جهاز المسح", "قارئ التذاكر", "qr",
      "رفضوا يدخلوني", "رفض التذكره", "ما سمحوا", "تذكره", "تذاكر", "التحقق",
      "barcode", "will not scan", "does not scan", "scanner", "scan",
      "denied entry", "refused entry", "ticket", "validation", "entrada", "billete", "billet",
    ],
  },

  /* --------------------------------- نظافة --------------------------------- */
  {
    id: "cleanliness:odor",
    label: "روائح كريهة",
    category: "cleanliness",
    terms: ["رائحه", "ريحه كريهه", "ريحه", "bad smell", "stink", "odor", "odour", "mal olor"],
  },
  {
    id: "cleanliness:waste",
    label: "نفايات ومهملات",
    category: "cleanliness",
    terms: [
      "قمامه", "زباله", "مهملات", "بقايا", "نفايات", "سلة ممتلئه", "وسخ", "متسخ", "نظافه",
      "trash", "garbage", "litter", "rubbish", "bins full", "dirty", "unclean", "basura", "poubelle", "sucio",
    ],
  },

  /* ---------------------------- مرافق ودورات مياه ---------------------------- */
  {
    id: "facilities:toilet",
    label: "دورات المياه",
    category: "facilities",
    terms: [
      "دورات المياه", "دوره مياه", "حمام", "حمامات", "مغسله", "توالیت",
      "toilet", "toilets", "restroom", "bathroom", "washroom", "aseo", "bano", "toilettes",
    ],
  },
  {
    id: "facilities:water",
    label: "مياه الشرب",
    category: "facilities",
    terms: ["ماء الشرب", "ماي", "مياه", "برادات", "ما فيه ماء", "drinking water", "no water", "water fountain", "agua", "eau"],
  },
  {
    id: "facilities:elevator",
    label: "المصاعد",
    category: "facilities",
    terms: ["مصعد", "المصاعد", "السلم الكهربائي", "elevator", "lift", "escalator", "ascensor"],
  },
  {
    id: "facilities:seating",
    label: "المقاعد",
    category: "facilities",
    terms: ["مقعد", "مقاعد", "كرسي", "كراسي", "الجلوس", "seat", "seats", "seating", "chair", "asiento", "siege"],
  },
  {
    id: "facilities:climate",
    label: "التكييف والحرارة",
    category: "facilities",
    terms: [
      "مكيف", "التكييف", "حر شديد", "الحر", "مظلات", "تهويه",
      "air conditioning", "too hot", "no shade", "ventilation", "calor",
    ],
  },

  /* ------------------------------ طعام ومشروبات ------------------------------ */
  {
    id: "food:price",
    label: "غلاء الأسعار",
    category: "food",
    terms: ["غالي", "غاليه", "الاسعار", "سعر مبالغ", "expensive", "overpriced", "prices", "caro", "cher"],
  },
  {
    id: "food:availability",
    label: "نفاد الطعام والمشروبات",
    category: "food",
    terms: ["نفد", "خلص الاكل", "ما فيه اكل", "مقفل", "sold out", "ran out", "no food", "closed", "agotado"],
  },
  {
    id: "food:quality",
    label: "جودة الطعام",
    category: "food",
    terms: ["الاكل بارد", "جوده", "طعم", "غير صالح", "cold food", "quality", "stale", "undercooked"],
  },
  {
    id: "food:general",
    label: "خدمات الطعام",
    category: "food",
    terms: ["اكل", "طعام", "مطعم", "كافيه", "قهوه", "عصير", "مشروب", "food", "drink", "restaurant", "coffee", "comida", "bebida"],
  },

  /* ------------------------------ إرشاد وتوجيه ------------------------------ */
  {
    id: "wayfinding:signage",
    label: "نقص اللوحات الإرشادية",
    category: "wayfinding",
    terms: [
      "لوحه", "لوحات", "ارشاديه", "الاشارات", "غير واضحه", "ما فيه ارشاد",
      "sign", "signs", "signage", "confusing", "unclear", "senal", "panneau",
    ],
  },
  {
    id: "wayfinding:lost",
    label: "تيه وصعوبة الوصول",
    category: "wayfinding",
    terms: [
      "تايه", "ضايع", "ما الاقي", "ما اعرف وين", "وين", "خريطه", "ادور",
      "lost", "cannot find", "can not find", "where is", "map", "directions", "perdido", "perdu",
    ],
  },

  /* ------------------------------ شبكة واتصالات ------------------------------ */
  {
    id: "connectivity:network",
    label: "ضعف الشبكة",
    category: "connectivity",
    terms: [
      "الشبكه", "النت", "انترنت", "واي فاي", "تغطيه", "ما فيه شبكه", "بطيء",
      "network", "internet", "wifi", "wi-fi", "signal", "no service", "slow", "reseau", "connexion",
    ],
  },
  {
    id: "connectivity:app",
    label: "أعطال التطبيق",
    category: "connectivity",
    terms: ["التطبيق ما يفتح", "التطبيق", "الموقع ما يفتح", "app not working", "app crashes", "the app", "website down"],
  },
  {
    id: "connectivity:charging",
    label: "الشحن والبطارية",
    category: "connectivity",
    terms: ["شحن", "شاحن", "بطاريه", "charging", "charger", "battery", "power bank"],
  },
];

const SUBTYPE_BY_ID = new Map(SUBTYPES.map((s) => [s.id, s]));

/** النوع الفرعي الافتراضي حين لا يطابق البلاغ أي قاموس */
export const GENERAL_SUBTYPE = "other:general";

export function subtypeLabel(id: string): string {
  if (id === GENERAL_SUBTYPE) return "ملاحظة عامة";
  return SUBTYPE_BY_ID.get(id)?.label ?? id;
}

export function subtypeCategory(id: string): CategoryId {
  return SUBTYPE_BY_ID.get(id)?.category ?? "other";
}

/* -------------------------------- الخطورة -------------------------------- */

const CRITICAL_TERMS = [
  "خطر", "عاجل جدا", "انقذونا", "حاله حرجه",
  "emergency", "critical", "life threatening",
];
const HIGH_TERMS = [
  "جدا", "شديد", "ساعه", "ساعتين", "خطير", "عاجل", "بسرعه", "مستحيل",
  "very", "extremely", "urgent", "an hour", "hours", "severe", "immediately", "serious",
  "muy", "urgente", "tres",
];
const LOW_TERMS = ["بسيط", "شوي", "اقتراح", "ملاحظه", "minor", "small", "suggestion", "slightly"];

const SEV_ORDER: SeverityId[] = ["low", "medium", "high", "critical"];
const bumpSeverity = (s: SeverityId, by: number): SeverityId =>
  SEV_ORDER[Math.min(SEV_ORDER.length - 1, Math.max(0, SEV_ORDER.indexOf(s) + by))];
const maxSeverity = (a: SeverityId, b: SeverityId): SeverityId =>
  SEV_ORDER.indexOf(a) >= SEV_ORDER.indexOf(b) ? a : b;

/* --------------------------- استخراج الموقع --------------------------- */

const ZONE_TERMS: Record<string, string[]> = {
  gate_a: ["بوابه a", "gate a", "puerta a"],
  gate_b: ["بوابه b", "gate b", "puerta b"],
  gate_c: ["بوابه c", "gate c", "puerta c"],
  stands_north: ["المدرج الشمالي", "north stand"],
  stands_south: ["المدرج الجنوبي", "south stand"],
  concourse: ["الممرات", "الممر الداخلي", "concourse", "corridor"],
  food_court: ["منطقه المطاعم", "منطقه الاكل", "food court"],
  fan_zone: ["منطقه المشجعين", "فان زون", "fan zone", "fanzone"],
  parking: ["المواقف", "الموقف", "parking", "aparcamiento"],
  metro: ["محطه القطار", "المترو", "train station"],
};

function detectZone(norm: string): string | null {
  for (const zone of ZONES) {
    const terms = ZONE_TERMS[zone.id] ?? [];
    if (terms.some((t) => norm.includes(normalize(t)))) return zone.id;
  }
  return null;
}

/* -------------------------------- التصنيف -------------------------------- */

/**
 * تصنيف بلاغ واحد محلياً: النوع الفرعي، الفئة، الخطورة، الموقع، اللغة.
 */
export function classifyLocal(text: string, hintZone: string): Classification {
  const lang = detectLang(text);
  const norm = normalize(text);

  const scores: { def: SubtypeDef; hits: string[] }[] = [];
  for (const def of SUBTYPES) {
    const hits = def.terms.filter((t) => norm.includes(normalize(t)));
    if (hits.length) scores.push({ def, hits });
  }
  // الأكثر مطابقةً أولاً، ومع التساوي يفوز الأسبق في القائمة (الأكثر تحديداً)
  // الترتيب: الأكثر مطابقةً أولاً، ثم الأطول عبارةً — فـ«خلص الاكل» أدلّ من
  // «طوابير» على أن المشكلة نفاد الطعام لا الازدحام. ومع التعادل التام يفوز
  // الأسبق في القائمة (الأكثر تحديداً).
  const weight = (hits: string[]) => hits.reduce((a, t) => a + t.length, 0);
  scores.sort((a, b) => b.hits.length - a.hits.length || weight(b.hits) - weight(a.hits));

  const best = scores[0];
  const subtype = best?.def.id ?? GENERAL_SUBTYPE;
  const category: CategoryId = best?.def.category ?? "other";
  const keywords = best ? Array.from(new Set(best.hits)).slice(0, 4) : [];

  // درجة الثقة: قوة أفضل تطابق مقارنةً بأقرب منافس من فئة أخرى
  let confidence = 0.35;
  if (best) {
    const rival = scores.find((s) => s.def.category !== best.def.category)?.hits.length ?? 0;
    confidence = Math.min(0.97, 0.62 + best.hits.length * 0.12 - rival * 0.06);
  }

  let severity: SeverityId = "medium";
  if (CRITICAL_TERMS.some((t) => norm.includes(normalize(t)))) severity = "critical";
  else if (HIGH_TERMS.some((t) => norm.includes(normalize(t)))) severity = "high";
  else if (LOW_TERMS.some((t) => norm.includes(normalize(t)))) severity = "low";

  if (best?.def.floor) severity = maxSeverity(severity, best.def.floor);
  if (!best && severity === "medium") severity = "low";

  return {
    subtype,
    category,
    severity,
    zoneId: detectZone(norm) ?? hintZone,
    keywords,
    confidence: Number(confidence.toFixed(2)),
    lang,
    source: "local",
  };
}

/* -------------------------------- التجميع -------------------------------- */

/** نافذة التجميع: البلاغات المتشابهة خلال ٩٠ دقيقة تُعدّ مشكلة واحدة */
export const CLUSTER_WINDOW_MS = 90 * 60 * 1000;

export function clusterTitle(subtype: string, zoneId: string): string {
  return `${subtypeLabel(subtype)} — ${zoneById(zoneId).label}`;
}

/**
 * التجميع الذكي: يبحث عن مشكلة مفتوحة بنفس **النوع الفرعي** والموقع ضمن النافذة
 * الزمنية. المطابقة على النوع الفرعي لا الفئة العامة، فلا تندمج مشكلتان مختلفتان
 * لمجرد وقوعهما في نفس الفئة والمكان.
 */
export function findOrCreateCluster(
  clusters: Cluster[],
  c: Classification,
  at: number,
  idSuffix: string,
): { cluster: Cluster; isNew: boolean } {
  const match = clusters.find(
    (cl) =>
      cl.subtype === c.subtype &&
      cl.zoneId === c.zoneId &&
      cl.status !== "resolved" &&
      at - cl.lastSeen <= CLUSTER_WINDOW_MS,
  );
  if (match) return { cluster: match, isNew: false };

  const cluster: Cluster = {
    id: `CL-${idSuffix}`,
    title: clusterTitle(c.subtype, c.zoneId),
    subtype: c.subtype,
    category: c.category,
    zoneId: c.zoneId,
    severity: c.severity,
    status: "new",
    reportIds: [],
    firstSeen: at,
    lastSeen: at,
    assignedTo: categoryById(c.category).owner,
    timeline: [{ at, text: "أُنشئت المشكلة تلقائياً من أول بلاغ وأُحيلت للجهة المختصة" }],
  };
  return { cluster, isNew: true };
}

/**
 * تصعيد الخطورة مع تكرار البلاغات:
 * ٥ بلاغات ترفع درجة، و١٢ بلاغاً ترفع درجتين.
 */
export function escalate(base: SeverityId, reportCount: number): SeverityId {
  if (reportCount >= 12) return bumpSeverity(base, 2);
  if (reportCount >= 5) return bumpSeverity(base, 1);
  return base;
}

/* ------------------------------ تحليل المواقع ------------------------------ */

/** كثافة كل موقع للخريطة الحرارية (٠ إلى ١) مرجّحة بالخطورة */
export function zoneHeat(reports: Report[]): Record<string, number> {
  const weights: Record<SeverityId, number> = { low: 1, medium: 2, high: 4, critical: 7 };
  const raw: Record<string, number> = {};
  for (const z of ZONES) raw[z.id] = 0;
  for (const r of reports) raw[r.zoneId] = (raw[r.zoneId] ?? 0) + weights[r.severity];
  const max = Math.max(1, ...Object.values(raw));
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw)) out[k] = v / max;
  return out;
}
