"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useLocale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/*  تثبيت التطبيق                                                              */
/*                                                                             */
/*  الموقع قابل للتثبيت، لكن أحداً لا يعرف ذلك: أندرويد يخفي الخيار في قائمة     */
/*  المتصفح، وآيفون لا يعرضه إطلاقاً. الزرّ هنا هو ما يجعل «تطبيق» أمراً يفعله     */
/*  المستخدم لا ميزةً مدفونة.                                                    */
/*                                                                             */
/*  ولا يظهر لمن ثبّته، ولا يُلحّ: يُرفض مرة فيُخزَّن الرفض ولا يعود.                */
/* -------------------------------------------------------------------------- */

const DISMISSED = "hala.install.dismissed";

/** حدث أندرويد/كروم — غير معرَّف في أنواع المتصفح القياسية */
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/*
 * ما يُقرأ من المتصفح يُقرأ خارج الأثر: الخادم لا يملك navigator، وقراءته داخل
 * أثرٍ ثم كتابتها في الحالة تُسبّب تصييراً متتابعاً. هذه هي الطريقة التي يعرف
 * بها React أن القيمة تأتي من خارجه.
 */
const noSubscribe = () => () => {};
const serverFalse = () => false;

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED) === "1";
  } catch {
    return false;
  }
};

const readInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as { standalone?: boolean }).standalone === true;

/** آيفون لا يطلق حدث التثبيت ولا يملك زرّاً: الطريق الوحيد شرحُ الخطوتين */
const readIsIosSafari = () => {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
};

export default function InstallPrompt() {
  const { t } = useLocale();

  const dismissedAtLoad = useSyncExternalStore(noSubscribe, readDismissed, serverFalse);
  const installed = useSyncExternalStore(noSubscribe, readInstalled, serverFalse);
  const isIosSafari = useSyncExternalStore(noSubscribe, readIsIosSafari, serverFalse);

  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (dismissedAtLoad || installed) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [dismissedAtLoad, installed]);

  const show = !gone && !dismissedAtLoad && !installed && (event !== null || isIosSafari);
  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED, "1");
    } catch {
      // الرفض يبقى في هذه الجلسة على الأقل
    }
    setGone(true);
  };

  return (
    <div
      role="dialog"
      aria-label={t("install.title")}
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-sm rounded-2xl border border-line bg-surface p-4 shadow-2xl sm:inset-x-auto sm:start-5"
    >
      <div className="flex items-start gap-3">
        {/* الأيقونة نفسها التي ستظهر على شاشته */}
        <Image
          src="/icon-192.png"
          alt=""
          width={44}
          height={44}
          unoptimized
          className="rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-text">{t("install.title")}</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
            {isIosSafari && !event ? t("install.ios") : t("install.body")}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {event && (
          <button
            type="button"
            onClick={async () => {
              await event.prompt();
              await event.userChoice;
              setGone(true);
            }}
            className="btn btn-primary flex-1 py-2 text-sm"
          >
            {t("install.action")}
          </button>
        )}
        <button type="button" onClick={dismiss} className="btn btn-ghost flex-1 py-2 text-sm">
          {t("install.later")}
        </button>
      </div>
    </div>
  );
}
