"use client";

import type { Surge } from "@/lib/analytics";

interface Props {
  surges: Surge[];
  breached: number;
  onOpen: (clusterId: string) => void;
}

/**
 * تنبيه استباقي: بدل انتظار المشرف حتى يلاحظ الأرقام، يبرز النظام المشكلات
 * التي تتصاعد الآن والمشكلات التي تجاوزت مهلة الاستجابة.
 */
export default function SurgeAlert({ surges, breached, onOpen }: Props) {
  if (surges.length === 0 && breached === 0) return null;

  return (
    <div className="rise card border-r-4 border-r-red-500 bg-red-50/60 p-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
        </span>
        <h2 className="font-bold text-red-800">تنبيهات تحتاج انتباهك الآن</h2>
      </div>

      <ul className="mt-3 space-y-2">
        {surges.map((s) => (
          <li key={s.clusterId}>
            <button
              onClick={() => onOpen(s.clusterId)}
              className="w-full rounded-xl bg-white px-3 py-2 text-right text-sm ring-1 ring-red-200 transition hover:ring-red-400"
            >
              <span className="font-semibold text-ink">تصاعد في {s.zoneLabel}</span>
              <span className="mr-1.5 text-ink-muted">
                — <span className="nums">{s.recentCount}</span> بلاغات عن «{s.title}» خلال{" "}
                <span className="nums">{s.windowMin}</span> دقيقة
              </span>
            </button>
          </li>
        ))}

        {breached > 0 && (
          <li className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-amber-200">
            <span className="font-semibold text-ink">
              <span className="nums">{breached}</span>{" "}
              {breached === 1 ? "مشكلة تجاوزت" : "مشكلات تجاوزت"} مهلة الاستجابة المستهدفة
            </span>
            <span className="mr-1.5 text-ink-muted">دون أي إجراء بعد</span>
          </li>
        )}
      </ul>
    </div>
  );
}
