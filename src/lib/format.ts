import type { Locale } from "./types";

/* -------------------------------------------------------------------------- */
/*  صياغة الوقت                                                                */
/*                                                                             */
/*  العربية تصرّف العدد (مفرد ومثنى وجمع)، والإنجليزية لا تفعل. لذا لكل لغة      */
/*  صياغتها هنا بدل قالب واحد يُملأ بالأرقام فيخرج ركيكاً في إحداهما.             */
/* -------------------------------------------------------------------------- */

function relativeAr(min: number): string {
  if (min < 1) return "الآن";
  if (min === 1) return "قبل دقيقة";
  if (min === 2) return "قبل دقيقتين";
  if (min < 11) return `قبل ${min} دقائق`;
  if (min < 60) return `قبل ${min} دقيقة`;
  const hr = Math.floor(min / 60);
  if (hr === 1) return "قبل ساعة";
  if (hr === 2) return "قبل ساعتين";
  if (hr < 11) return `قبل ${hr} ساعات`;
  if (hr < 24) return `قبل ${hr} ساعة`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "أمس";
  return `قبل ${day} أيام`;
}

function relativeEn(min: number): string {
  if (min < 1) return "just now";
  if (min === 1) return "1 minute ago";
  if (min < 60) return `${min} minutes ago`;
  const hr = Math.floor(min / 60);
  if (hr === 1) return "1 hour ago";
  if (hr < 24) return `${hr} hours ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "yesterday";
  return `${day} days ago`;
}

/** صياغة الوقت النسبي بلغة العرض */
export function relativeTime(ts: number, locale: Locale = "ar", now: number = Date.now()): string {
  const min = Math.floor(Math.max(0, now - ts) / 60000);
  return locale === "en" ? relativeEn(min) : relativeAr(min);
}

/** الوقت بصيغة ٢٤ ساعة */
export function clockTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/** صياغة مدة بالدقائق */
export function formatMinutes(min: number | null, locale: Locale = "ar"): string {
  if (min === null) return "—";
  if (locale === "en") {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  if (min < 60) return `${min} دقيقة`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} س ${m} د` : `${h} ساعة`;
}

/* -------------------------------------------------------------------------- */
/*  مواعيد المباريات                                                           */
/*                                                                             */
/*  التقويم والأرقام مثبّتان على الميلادي واللاتيني في اللغتين: `ar-SA` وحدها    */
/*  تُصيّر بالهجري والأرقام العربية، وجدول مباريات دولي يُقرأ بالميلادي.           */
/* -------------------------------------------------------------------------- */

const DATE_LOCALE: Record<Locale, string> = {
  ar: "ar-u-ca-gregory-nu-latn",
  en: "en-GB",
};

/** اليوم والشهر ووقت الانطلاق، مثل: السبت ١٤ نوفمبر · 19:00 */
export function matchDateTime(ts: number, locale: Locale = "ar"): string {
  const d = new Date(ts);
  const day = new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
  return `${day} · ${clockTime(ts)}`;
}

/** التاريخ وحده بلا وقت */
export function matchDate(ts: number, locale: Locale = "ar"): string {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(ts));
}

/** أبعد من هذا لا يُعدّ تنازلياً — يُعرض التاريخ */
export const COUNTDOWN_WINDOW_DAYS = 30;

/**
 * ما تبقّى حتى الانطلاق.
 *
 * تعيد `null` في حالتين: مباراة بدأت، ومباراة أبعد من نافذة العدّ. عدّاد يقول
 * «بعد ٢٩٩٣ يوماً» لا يفيد أحداً؛ التاريخ في مثل هذا البعد هو الجواب.
 */
export function countdown(ts: number, now: number, locale: Locale = "ar"): string | null {
  const ms = ts - now;
  if (ms <= 0) return null;

  const days = Math.floor(ms / 86_400_000);
  if (days > COUNTDOWN_WINDOW_DAYS) return null;

  const hours = Math.floor((ms % 86_400_000) / 3_600_000);

  if (locale === "en") {
    if (days === 0) return `${hours}h`;
    return `${days}d ${hours}h`;
  }
  if (days === 0) return `${hours} ساعة`;
  if (days === 1) return "يوم واحد";
  if (days === 2) return "يومان";
  if (days <= 10) return `${days} أيام`;
  return `${days} يوماً`;
}
