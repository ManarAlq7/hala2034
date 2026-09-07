"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/* -------------------------------------------------------------------------- */
/*  رمز التذكرة                                                                */
/*                                                                             */
/*  رمز حقيقي قابل للمسح لا زخرفة تشبهه: التذكرة التي لا تُمسح ليست تذكرة.       */
/*  ويُرسم SVG لا صورة نقطية كي يبقى حادّاً على أي شاشة وعند الطباعة.             */
/*                                                                             */
/*  ما بداخله مرجع الحجز وحده — لا اسم ولا بريد. من يصوّر الشاشة لا يأخذ إلا      */
/*  ما هو مطبوع تحتها أصلاً.                                                     */
/* -------------------------------------------------------------------------- */

export default function TicketQr({ value, size = 168 }: { value: string; size?: number }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    QRCode.toString(value, {
      type: "svg",
      margin: 0,
      // تصحيح خطأ متوسط: يحتمل خدشاً على الشاشة أو انعكاس ضوء عند البوابة
      errorCorrectionLevel: "M",
      color: { dark: "#16161a", light: "#00000000" },
    })
      .then((out) => {
        if (alive) setSvg(out);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });

    return () => {
      alive = false;
    };
  }, [value]);

  if (failed) return null;

  return (
    <div
      className="grid place-items-center rounded-xl bg-white p-3 ring-1 ring-line"
      style={{ width: size, height: size }}
      aria-label={value}
      role="img"
    >
      {svg ? (
        <div
          className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
          // المحتوى مولَّد محلياً من نصّ نعرفه، لا من مصدر خارجي
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <span className="text-[11px] text-text-dim">…</span>
      )}
    </div>
  );
}
