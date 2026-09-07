"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n";
import { LOCALES, localeInfo } from "@/lib/locales";

/**
 * منتقي لغة الواجهة.
 *
 * قائمة لا زرّ تبديل: التبديل بين اثنتين يخدم فريقاً يعرف لغتيه، لا جمهوراً
 * قادماً من ثمانين بلداً. وكل لغة مكتوبة باسمها كما يكتبه أهلها — «Español»
 * لا «الإسبانية»، لأن من يبحث عنها لا يقرأ العربية.
 */
export default function LanguagePicker() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  /* الإغلاق بالنقر خارجها وبمفتاح الهروب — قائمة لا تُغلق تحبس الصفحة */
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = localeInfo(locale);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="btn btn-ghost btn-sm"
      >
        <span aria-hidden className="me-1.5">
          🌐
        </span>
        {current.native}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={current.native}
          className="absolute end-0 z-50 mt-2 max-h-80 w-44 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-lg"
        >
          {LOCALES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === locale}
                lang={l.code}
                dir={l.dir}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm transition ${
                  l.code === locale
                    ? "bg-brand-wash font-bold text-brand"
                    : "text-text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                <span>{l.native}</span>
                <span className="nums text-[10px] uppercase tracking-wider text-text-dim">
                  {l.code}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
