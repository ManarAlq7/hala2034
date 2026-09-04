"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import StadiumArt, { SCENES } from "@/components/fan/StadiumArt";
import { venueCity, venueName, type Venue } from "@/lib/catalog";
import { useLocale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/*  بوابة الملاعب                                                              */
/*                                                                             */
/*  أول ما يُفتح: الملاعب الثمانية تمرّ واحداً بعد واحد بملء الشاشة، ثم يدخل     */
/*  الزائر إلى الصفحة الرئيسية. الغرض أن يبدأ الأمر بالبطولة لا بقائمة روابط.    */
/*                                                                             */
/*  البوابة تُعرض مرّة واحدة في الجلسة: من دخل ثم رجع إلى الرئيسية يريد الصفحة    */
/*  لا المقدّمة. وهي تخرج بأي مفتاح أو نقرة أو لمسة — لا يُحبس أحد في مشهد.      */
/* -------------------------------------------------------------------------- */

const SEEN_KEY = "hala.gate.seen";
/** مدّة بقاء الملعب الواحد على الشاشة */
const DWELL_MS = 5200;
/** زمن الانطواء قبل ظهور الصفحة */
const EXIT_MS = 900;

/**
 * هل رأى الزائر البوابة في هذه الجلسة؟
 *
 * القراءة تمرّ بـ useSyncExternalStore لا بأثر جانبي: الخادم لا يملك
 * sessionStorage، وهذه هي الطريقة التي يعرف بها React أن قيمة الخادم مؤقّتة
 * وأن الحقيقة تأتي عند الترطيب. الاشتراك فارغ لأن القيمة لا تتغيّر من تحتنا.
 */
const subscribeNever = () => () => {};
const seenOnClient = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    /* المتصفح قد يمنع التخزين — والبوابة تعمل بدونه */
    return false;
  }
};
const seenOnServer = () => false;

export default function StadiumGate({ venues }: { venues: Venue[] }) {
  const { t, locale, isRtl } = useLocale();
  const seen = useSyncExternalStore(subscribeNever, seenOnClient, seenOnServer);
  const [dismissed, setDismissed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState(0);
  const enterRef = useRef<HTMLButtonElement>(null);

  const open = !seen && !dismissed;

  /* ترتيب العرض هو ترتيب المشاهد: الأكبر أوّلاً */
  const ordered = useMemo(() => {
    const byId = new Map(venues.map((v) => [v.id, v]));
    return SCENES.map((s) => byId.get(s.venueId)).filter((v): v is Venue => Boolean(v));
  }, [venues]);

  const count = ordered.length || SCENES.length;
  const venue = ordered[index];

  const close = useCallback(() => {
    setLeaving((was) => {
      if (was) return was;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* لا شيء يعتمد على نجاح التخزين */
      }
      window.setTimeout(() => setDismissed(true), EXIT_MS);
      return true;
    });
  }, []);

  /* التنقّل بين الملاعب، ثم الدخول بأي مفتاح آخر */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const forward = e.key === (isRtl ? "ArrowLeft" : "ArrowRight");
        setIndex((i) => (i + (forward ? 1 : count - 1)) % count);
        return;
      }
      if (e.key === "Tab") return;
      close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, count, isRtl]);

  /* لا تمرير للصفحة خلف البوابة */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* الدوران التلقائي */
  useEffect(() => {
    if (!open || leaving || count < 2) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), DWELL_MS);
    return () => window.clearInterval(id);
  }, [open, leaving, count]);

  useEffect(() => {
    if (open && !leaving) enterRef.current?.focus();
  }, [open, leaving]);

  if (!open) return null;

  return (
    <div
      className={`gate ${leaving ? "gate-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={t("gate.title")}
      onClick={close}
    >
      {/* المشاهد كلّها مرسومة، وواحد منها ظاهر — كي يكون الانتقال مزجاً لا تحميلاً */}
      <div className="gate-stage">
        {SCENES.map((s, i) => (
          <div key={s.venueId} className="gate-slide" data-on={i === index % SCENES.length}>
            <StadiumArt scene={s} uid={`gate-${i}`} className="gate-art" />
          </div>
        ))}
        <div className="gate-vignette" />
      </div>

      <div className="gate-body">
        <header className="gate-head">
          <span className="gate-mark nums">HALA 2034</span>
          <span className="gate-kicker">{t("gate.kicker")}</span>
        </header>

        <div className="gate-center">
          <span className="gate-eyebrow">{t("gate.eyebrow")}</span>
          <h1 key={`n-${index}`} className="gate-name">
            {venue ? venueName(venue, locale) : " "}
          </h1>
          <p key={`c-${index}`} className="gate-meta">
            {venue && (
              <>
                <span>{venueCity(venue, locale)}</span>
                <span className="gate-dot" aria-hidden="true" />
                <span className="nums">
                  {t("gate.capacity", { n: venue.capacity.toLocaleString(locale === "ar" ? "ar-SA" : "en-US") })}
                </span>
              </>
            )}
          </p>
        </div>

        <footer className="gate-foot">
          <button
            ref={enterRef}
            type="button"
            className="gate-enter"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            {t("gate.enter")}
            <span className="gate-arrow" aria-hidden="true">
              {isRtl ? "←" : "→"}
            </span>
          </button>

          <div className="gate-rail" role="tablist" aria-label={t("gate.title")}>
            {SCENES.map((s, i) => (
              <button
                key={s.venueId}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={ordered[i] ? venueName(ordered[i], locale) : s.venueId}
                className="gate-tick"
                data-on={i === index}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex(i);
                }}
              >
                <span className="gate-tick-fill" />
              </button>
            ))}
          </div>

          <span className="gate-hint">{t("gate.hint")}</span>
        </footer>
      </div>
    </div>
  );
}
