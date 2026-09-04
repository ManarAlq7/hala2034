"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CategoryChip, MetaChip, SeverityBadge, StatusBadge } from "./Badges";
import { channelLabel, zoneById } from "@/lib/taxonomy";
import { langLabel } from "@/lib/ai";
import { clockTime, relativeTime } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Cluster, Report, StatusId } from "@/lib/types";

interface Props {
  cluster: Cluster;
  reports: Report[];
  onClose: () => void;
}

const ACTIONS: { id: StatusId; label: string; cls: string }[] = [
  { id: "in_progress", label: "بدء المعالجة", cls: "bg-amber-500 hover:bg-amber-600" },
  { id: "resolved", label: "إغلاق المشكلة", cls: "bg-brand-700 hover:bg-brand-800" },
  { id: "new", label: "إعادة الفتح", cls: "bg-slate-500 hover:bg-slate-600" },
];

export default function ClusterDetail({ cluster, reports, onClose }: Props) {
  const { setStatus, addNote } = useApp();
  const [note, setNote] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const members = reports.filter((r) => r.clusterId === cluster.id);

  // إغلاق باللوحة المفتاحية وحصر التنقل داخل اللوحة ما دامت مفتوحة
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  // نقل التركيز إلى اللوحة عند فتحها ليعمل الإغلاق والتنقل فوراً
  useEffect(() => {
    panelRef.current?.focus();
  }, [cluster.id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-ink/40 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`تفاصيل المشكلة ${cluster.title}`}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="thin-scroll h-full w-full max-w-xl overflow-y-auto bg-surface shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* الترويسة */}
        <div className="brand-gradient sticky top-0 z-10 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="nums text-xs text-white/70">{cluster.id}</p>
              <h2 className="text-lg font-bold">{cluster.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-white/12 px-2.5 py-1 text-sm ring-1 ring-white/20 hover:bg-white/20"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/20">
              <span className="nums">{members.length}</span> بلاغ
            </span>
            <span className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/20">
              الجهة: {cluster.assignedTo}
            </span>
            <span className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/20">
              آخر بلاغ {relativeTime(cluster.lastSeen)}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-5">
          <div className="flex flex-wrap gap-1.5">
            <CategoryChip id={cluster.category} />
            <SeverityBadge id={cluster.severity} />
            <StatusBadge id={cluster.status} />
            <MetaChip>📍 {zoneById(cluster.zoneId).label}</MetaChip>
          </div>

          {/* الإجراءات */}
          <section>
            <h3 className="mb-2 text-sm font-bold text-ink">اتخاذ إجراء</h3>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.filter((a) => a.id !== cluster.status).map((a) => (
                <button
                  key={a.id}
                  onClick={() => setStatus(cluster.id, a.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white transition ${a.cls}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                addNote(cluster.id, note.trim());
                setNote("");
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="إضافة ملاحظة تشغيلية…"
                className="flex-1 rounded-xl border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-700 ring-1 ring-brand-100 hover:bg-brand-100"
              >
                إضافة
              </button>
            </form>
          </section>

          {/* سجل المتابعة */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-ink">سجل المتابعة</h3>
            <ol className="relative space-y-4 border-r-2 border-hairline pr-4">
              {cluster.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -right-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-brand-50" />
                  <p className="text-sm text-ink">{t.text}</p>
                  <p className="nums mt-0.5 text-[11px] text-ink-muted">{clockTime(t.at)}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* البلاغات المكوّنة للمشكلة */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-ink">
              البلاغات المُجمَّعة (<span className="nums">{members.length}</span>)
            </h3>
            <ul className="space-y-2">
              {members.map((r) => (
                <li key={r.id} className="rounded-xl border border-hairline bg-white p-3">
                  <p className="text-sm text-ink">{r.text}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
                    <span className="nums font-semibold text-brand-700">{r.id}</span>
                    <span>{r.source === "voice" ? "🎙 صوتي" : "⌨️ نصي"}</span>
                    <span>{channelLabel(r.channel)}</span>
                    <span>{langLabel(r.lang)}</span>
                    <span>{relativeTime(r.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
