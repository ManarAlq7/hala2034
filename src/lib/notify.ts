"use client";

import { useEffect } from "react";
import { hasSupabase, supabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  إغلاق الحلقة مع المبلّغ                                                     */
/*                                                                             */
/*  كان البلاغ ينتهي عند الإرسال: يكتب المشجّع ما رآه ثم لا يسمع شيئاً إلا إن     */
/*  حفظ رمزاً ورجع يتفقّده بنفسه. صار تغيّر حالة مشكلته يصله وهو على الصفحة،      */
/*  وبإشعار من المتصفح إن أذن به.                                               */
/*                                                                             */
/*  الاشتراك على جدول المشكلات لا البلاغات: المشكلة لا تحمل اسماً ولا نصّاً حرّاً،  */
/*  فهي مقروءة، والبلاغات مغلقة.                                                */
/* -------------------------------------------------------------------------- */

/**
 * متابعة مشكلة واحدة: كل تغيّر عليها يستدعي `onChange`.
 *
 * الاشتراك مرشَّح على الخادم بالمعرّف، فلا يستيقظ المتصفح لكل حركة في النظام.
 */
export function useStatusWatch(clusterId: string | null, onChange: () => void) {
  useEffect(() => {
    if (!clusterId || !hasSupabase) return;

    const channel = supabase()
      .channel(`cluster-${clusterId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "clusters", filter: `id=eq.${clusterId}` },
        onChange,
      )
      .subscribe();

    return () => {
      void supabase().removeChannel(channel);
    };
  }, [clusterId, onChange]);
}

/**
 * طلب إذن الإشعارات.
 *
 * لا يُطلب عند فتح الصفحة: نافذة إذن تظهر قبل أن يفعل المستخدم شيئاً تُرفض
 * غالباً، ولا تُسأل ثانية. تُطلب بعد إرسال بلاغ — حين يكون للإشعار معنى.
 */
export async function askNotifyPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  try {
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

/** إشعار بتغيّر حالة — يصمت بلا إذن بدل أن يرفع خطأ */
export function notifyStatus(title: string, body: string): void {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    new Notification(title, { body, icon: "/icon-192.png", tag: "hala-status" });
  } catch {
    // بعض المتصفحات تمنع الإنشاء المباشر خارج عامل الخدمة — الصفحة تُحدَّث على أي حال
  }
}
