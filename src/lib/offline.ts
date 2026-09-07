"use client";

import { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  الطابور حين تنقطع الشبكة                                                    */
/*                                                                             */
/*  تسعون ألف جهاز في مبنى واحد تُسقط الشبكة تحديداً في اللحظة التي يحتاج فيها    */
/*  أحدهم أن يبلّغ. فالبلاغ الذي يفشل إرساله لا يُفقد: يُحفظ في هذا الجهاز        */
/*  ويُرسَل حين تعود الشبكة.                                                     */
/*                                                                             */
/*  التخزين محلي في المتصفح — لا يغادر الجهاز حتى يُرسَل، ولا يراه أحد قبل ذلك.   */
/* -------------------------------------------------------------------------- */

const QUEUE_KEY = "hala.outbox.v1";

export interface QueuedReport {
  /** معرّف محلي مؤقت — يميّز الصفّ في الطابور لا في قاعدة البيانات */
  localId: string;
  text: string;
  zoneId: string;
  channel: string;
  source: string;
  reporterName?: string;
  /** وقت الكتابة لا وقت الإرسال: المشكلة وقعت حين كتبها لا حين وصلت الشبكة */
  at: number;
}

function read(): QueuedReport[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as QueuedReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: QueuedReport[]): void {
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // مساحة التخزين ممتلئة — لا شيء يمكن فعله سوى ألّا ينكسر النموذج
  }
  notify();
}

/* اشتراك بسيط كي تعرف الواجهة كم في الطابور */
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export function queueReport(item: Omit<QueuedReport, "localId">): void {
  const localId = `Q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  write([...read(), { ...item, localId }]);
}

export function queuedCount(): number {
  return read().length;
}

/**
 * إرسال ما في الطابور.
 *
 * كل عنصر على حدة: فشل واحد لا يمنع البقية، والناجح يُحذف فوراً فلا يُرسَل
 * مرتين إن انقطعت الشبكة في منتصف التفريغ.
 */
export async function flushQueue(
  send: (item: QueuedReport) => Promise<unknown>,
): Promise<{ sent: number; left: number }> {
  let items = read();
  let sent = 0;

  for (const item of items) {
    try {
      await send(item);
      sent += 1;
      items = read().filter((q) => q.localId !== item.localId);
      write(items);
    } catch {
      // ما زالت الشبكة معطّلة أو الخادم يرفض — يبقى في الطابور للمحاولة القادمة
      break;
    }
  }

  return { sent, left: read().length };
}

/** حالة الاتصال وعدد ما ينتظر الإرسال */
export function useOutbox() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const sync = () => {
      setOnline(navigator.onLine);
      setPending(queuedCount());
    };

    sync();
    listeners.add(sync);
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);

    return () => {
      listeners.delete(sync);
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return { online, pending };
}

/** تفريغ الطابور عند عودة الشبكة وعند فتح الصفحة */
export function useFlushOnReconnect(send: (item: QueuedReport) => Promise<unknown>) {
  useEffect(() => {
    let alive = true;

    const run = () => {
      if (!navigator.onLine || queuedCount() === 0) return;
      void flushQueue(send).catch(() => {
        // لا شيء: المحاولة القادمة عند الحدث القادم
      });
    };

    // مهلة قصيرة عند الإقلاع: لا تُزاحم أول رسم للصفحة
    const timer = window.setTimeout(() => {
      if (alive) run();
    }, 1500);

    window.addEventListener("online", run);

    return () => {
      alive = false;
      window.clearTimeout(timer);
      window.removeEventListener("online", run);
    };
  }, [send]);
}
