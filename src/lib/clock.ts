"use client";

import { useSyncExternalStore } from "react";

/**
 * ساعة مشتركة تتقدّم كل دقيقة.
 *
 * الأزمنة النسبية («قبل ٥ دقائق») ومؤشرات تجاوز المهلة تفقد صحتها إن جُمّدت عند
 * لحظة التحميل. تُقرأ الساعة كمصدر خارجي فتبقى الترطيب متطابقاً بين الخادم
 * والمتصفح، ويُستهلك مؤقّت واحد مهما كثر عدد المكوّنات المشتركة.
 */

const TICK_MS = 60_000;

let currentTime = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);

  if (!timer) {
    currentTime = Date.now();
    timer = setInterval(() => {
      currentTime = Date.now();
      for (const l of listeners) l();
    }, TICK_MS);
  }

  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => currentTime;
const getServerSnapshot = () => 0;

/** يعيد الوقت الحالي، و`0` أثناء التصيير على الخادم وقبل أول تحديث */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
