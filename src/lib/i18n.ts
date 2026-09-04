"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AR, EN, type StringKey } from "./strings";
import type { Locale, TimelineEntry } from "./types";

/* -------------------------------------------------------------------------- */
/*  لغة الواجهة                                                                */
/*                                                                             */
/*  مخزن صغير خارج React يشترك فيه كل المكوّنات، بلا مكتبة ترجمة ولا موجّه       */
/*  للمسارات. اللغة اختيار عرض لا هوية صفحة: تبديلها لا يغيّر الرابط ولا يعيد     */
/*  تحميل الصفحة، فيبقى ما يشاهده المستخدم في مكانه.                             */
/*                                                                             */
/*  الخادم يُصيّر بالعربية دائماً، ثم يصحّح المتصفح الاتجاه واللغة بعد الترطيب     */
/*  إن كان الاختيار المحفوظ مختلفاً — فلا يختلف ما صُيِّر على الخادم عمّا يُصيَّر   */
/*  على العميل في أول تمريرة.                                                    */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "hala2034:locale";

export const DEFAULT_LOCALE: Locale = "ar";

let current: Locale = DEFAULT_LOCALE;
const listeners = new Set<() => void>();

function applyToDocument(locale: Locale) {
  const el = document.documentElement;
  el.lang = locale;
  el.dir = locale === "en" ? "ltr" : "rtl";
}

export function setLocale(locale: Locale) {
  if (locale === current) return;
  current = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // تعذّر الحفظ — الاختيار يبقى فاعلاً في هذه الجلسة
  }
  applyToDocument(locale);
  for (const l of listeners) l();
}

let restored = false;

/** استعادة الاختيار المحفوظ — تُستدعى مرة واحدة بعد الترطيب */
function restore() {
  if (restored) return;
  restored = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "ar") {
      if (saved !== current) {
        current = saved;
        for (const l of listeners) l();
      }
      applyToDocument(saved);
    }
  } catch {
    // لا اختيار محفوظ يمكن قراءته — تبقى العربية
  }
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const getSnapshot = () => current;
const getServerSnapshot = (): Locale => DEFAULT_LOCALE;

/* --------------------------------- الترجمة --------------------------------- */

export type Params = Record<string, string | number>;

/** استبدال الوسائط بصيغة {name} داخل النص */
const fill = (text: string, params?: Params) =>
  params
    ? text.replace(/\{(\w+)\}/g, (m, key: string) => (key in params ? String(params[key]) : m))
    : text;

export function translate(locale: Locale, key: StringKey, params?: Params): string {
  return fill(locale === "en" ? EN[key] : AR[key], params);
}

export type Translator = (key: StringKey, params?: Params) => string;

export interface UseLocale {
  locale: Locale;
  /** اتجاه الكتابة الموافق للغة */
  dir: "rtl" | "ltr";
  isRtl: boolean;
  setLocale: (locale: Locale) => void;
  toggle: () => void;
  t: Translator;
}

export function useLocale(): UseLocale {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    restore();
  }, []);

  return {
    locale,
    dir: locale === "en" ? "ltr" : "rtl",
    isRtl: locale !== "en",
    setLocale,
    toggle: () => setLocale(locale === "en" ? "ar" : "en"),
    t: (key, params) => translate(locale, key, params),
  };
}

/* ------------------------------ سجل المشكلة ------------------------------ */

/**
 * صياغة مدخلة السجل بلغة العرض.
 *
 * أحداث النظام محفوظة كمفاتيح فتُترجم، وملاحظات فريق العمليات نصّ حرّ يُعرض
 * كما كُتب — لا يملك النظام حقّ ترجمة ما كتبه إنسان بنفسه.
 */
export function timelineText(entry: TimelineEntry, locale: Locale): string {
  if (entry.event) {
    return translate(locale, `event.${entry.event}` as StringKey, { n: entry.count ?? 0 });
  }
  return entry.text ?? "";
}

/* -------------------------------- نص البلاغ -------------------------------- */

/**
 * نص البلاغ بلغة العرض.
 *
 * الترجمة تُنتَج في المسار السحابي فقط، فإن غابت عُرض النص الأصلي كما ورد.
 * لا يُلفَّق نص بديل: أن يقرأ المشرف بلاغاً بلغة لا يعرفها أفضل من أن يقرأ
 * ترجمة لم تحدث.
 */
export function reportText(
  report: { text: string; textAr?: string; textEn?: string },
  locale: Locale,
): string {
  return (locale === "en" ? report.textEn : report.textAr) ?? report.text;
}

/** هل يختلف المعروض عن الأصل؟ أي: هل هناك ترجمة فعلية تستحق إظهار الأصل معها */
export function hasTranslation(
  report: { text: string; textAr?: string; textEn?: string },
  locale: Locale,
): boolean {
  return reportText(report, locale).trim() !== report.text.trim();
}
