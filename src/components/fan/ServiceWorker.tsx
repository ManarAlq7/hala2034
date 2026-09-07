"use client";

import { useEffect } from "react";

/**
 * تسجيل عامل الخدمة.
 *
 * لا يُسجَّل في التطوير: عامل خدمة يخزّن أثناء التطوير يعطيك صفحة قديمة بعد كل
 * تعديل ويجعلك تشكّ في الكود بلا سبب.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // المتصفح قد يمنعه في وضع التصفّح الخاص — الموقع يعمل بدونه
      });
    };

    // بعد اكتمال التحميل: التسجيل لا يزاحم أول رسم
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
