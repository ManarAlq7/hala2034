import type { ChannelId, SourceId } from "./types";

/** مولد أرقام شبه عشوائي بمُدخل ثابت — يضمن بيانات تجريبية متطابقة في كل تشغيل */
export function makeRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SeedInput {
  text: string;
  zoneId: string;
  channel: ChannelId;
  source: SourceId;
  reporterName?: string;
  /** قبل كم دقيقة من الآن ورد البلاغ */
  minutesAgo: number;
}

/** نصوص بلاغات واقعية بلغات مختلفة — تمر على نفس محرك التصنيف */
const TEXTS: { text: string; zoneId: string }[] = [
  { text: "الزحمة شديدة جداً عند البوابة B وواقفين من نص ساعة والصف ما يتحرك", zoneId: "gate_b" },
  { text: "الطابور طويل مره عند البوابة B وفيه تدافع بين الناس", zoneId: "gate_b" },
  { text: "The queue at gate B is extremely long, no staff directing anyone", zoneId: "gate_b" },
  { text: "Hay mucha gente en la puerta B, la cola no avanza", zoneId: "gate_b" },
  { text: "زحام عند البوابة B والوضع صار مزعج للعوائل", zoneId: "gate_b" },
  { text: "ازدحام شديد في البوابة B ونحتاج تنظيم عاجل", zoneId: "gate_b" },

  { text: "دورات المياه في الممرات وسخة والرائحة مزعجة", zoneId: "concourse" },
  { text: "الحمامات ما فيها ماء ولا صابون", zoneId: "concourse" },
  { text: "Toilets near the concourse are dirty and out of paper", zoneId: "concourse" },
  { text: "بقايا ومهملات على الأرض في الممرات ومحتاجة نظافة", zoneId: "concourse" },

  { text: "التذكرة ما تنقرأ الباركود ورفضوا يدخلوني من البوابة A", zoneId: "gate_a" },
  { text: "My ticket QR code will not scan at the entrance", zoneId: "gate_a" },
  { text: "جهاز مسح التذاكر معطل في البوابة A", zoneId: "gate_a" },

  { text: "ما فيه باصات في المواقف ومنتظرين من ساعة", zoneId: "parking" },
  { text: "No shuttle buses at the parking area, waiting for an hour", zoneId: "parking" },
  { text: "المواقف ممتلئة وما فيه توجيه للسيارات", zoneId: "parking" },
  { text: "الباص ما وصل والزحمة كبيرة في الموقف", zoneId: "parking" },

  { text: "الأسعار غالية جداً في منطقة المطاعم وقارورة الماء بعشرة", zoneId: "food_court" },
  { text: "خلص الأكل في أغلب المطاعم والطوابير طويلة", zoneId: "food_court" },
  { text: "Food is sold out and prices are very expensive here", zoneId: "food_court" },

  { text: "الشبكة ضعيفة جداً في المدرج الشمالي والتطبيق ما يفتح", zoneId: "stands_north" },
  { text: "No internet signal in the north stand, the app is not working", zoneId: "stands_north" },
  { text: "الواي فاي بطيء ولا أقدر أفتح التذكرة", zoneId: "stands_north" },

  { text: "شخص أُغمي عليه في المدرج الجنوبي ونحتاج إسعاف بسرعة", zoneId: "stands_south" },
  { text: "حالة إصابة في المدرج الجنوبي والشخص ما يتنفس زين", zoneId: "stands_south" },

  { text: "ما ألقى اللوحات الإرشادية وضايع ما أعرف وين مقعدي", zoneId: "concourse" },
  { text: "Signage is confusing, cannot find my section", zoneId: "concourse" },
  { text: "الخريطة في التطبيق غير واضحة وما أعرف وين البوابة", zoneId: "concourse" },

  { text: "فيه مشاجرة بين مجموعة في منطقة المشجعين", zoneId: "fan_zone" },
  { text: "سرقة جوال في منطقة المشجعين والوضع غير آمن", zoneId: "fan_zone" },
  { text: "الزحمة كبيرة في منطقة المشجعين وما فيه منافذ خروج واضحة", zoneId: "fan_zone" },

  { text: "محطة القطار مزدحمة جداً بعد نهاية المباراة", zoneId: "metro" },
  { text: "The metro station is packed, we have been waiting a long time", zoneId: "metro" },
  { text: "القطار متأخر والناس متكدسة في المحطة", zoneId: "metro" },

  { text: "الحر شديد في البوابة C وما فيه مظلات ولا ماء", zoneId: "gate_c" },
  { text: "المكيف معطل عند مدخل البوابة C", zoneId: "gate_c" },

  { text: "المقاعد في المدرج الشمالي مكسورة في الصف الأخير", zoneId: "stands_north" },
  { text: "المصعد معطل وما نقدر نوصل للدور الثاني", zoneId: "concourse" },

  { text: "التنظيم ممتاز بس اقتراح بسيط: زيدوا لوحات إرشادية عند المواقف", zoneId: "parking" },
  { text: "ملاحظة بسيطة، الموسيقى عالية شوي في منطقة المشجعين", zoneId: "fan_zone" },
];

const CHANNELS: ChannelId[] = ["app", "app", "app", "web", "kiosk", "social"];
const NAMES = [
  "زائر مجهول",
  "Ahmed K.",
  "Maria L.",
  "زائر مجهول",
  "عبدالله ع.",
  "Yuki T.",
  "زائر مجهول",
  "نورة س.",
];

/** يبني قائمة بلاغات تجريبية موزّعة على آخر ٦ ساعات */
export function buildSeedInputs(): SeedInput[] {
  const rand = makeRandom(20342034);
  return TEXTS.map((t, i) => {
    const r = rand();
    return {
      text: t.text,
      zoneId: t.zoneId,
      channel: CHANNELS[Math.floor(rand() * CHANNELS.length)],
      source: rand() > 0.72 ? ("voice" as SourceId) : ("text" as SourceId),
      reporterName: NAMES[Math.floor(rand() * NAMES.length)],
      // البلاغات الأحدث في آخر القائمة
      minutesAgo: Math.round(340 - i * 7.5 - r * 12),
    };
  }).sort((a, b) => b.minutesAgo - a.minutesAgo);
}
