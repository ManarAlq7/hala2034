"use client";

import Link from "next/link";
import { useState } from "react";
import { CategoryChip, MetaChip, SeverityBadge, StatusBadge } from "@/components/Badges";
import { zoneById } from "@/lib/taxonomy";
import { clockTime, relativeTime } from "@/lib/format";
import { useApp } from "@/lib/store";

/**
 * تتبّع البلاغ: يدخل المبلّغ رقم المتابعة فيرى حالة بلاغه وما اتُّخذ بشأنه.
 * هذا يغلق الحلقة مع الجمهور بدل أن ينتهي البلاغ عند الإرسال.
 */
export default function TrackPage() {
  const { ready, reports, clusters } = useApp();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const ref = submitted?.trim().toUpperCase() ?? "";
  const report = ref ? reports.find((r) => r.id.toUpperCase() === ref) : null;
  const cluster = report ? clusters.find((c) => c.id === report.clusterId) : null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">تتبّع بلاغ</h1>
      <p className="mt-1 text-sm text-ink-muted">
        أدخل رقم المتابعة الذي استلمته عند الإرسال لمعرفة حالة بلاغك والإجراء المتخذ.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(query);
        }}
        className="card mt-6 flex flex-col gap-2 p-4 sm:flex-row"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="مثال: R-0007"
          dir="ltr"
          className="flex-1 rounded-xl border border-hairline bg-white px-3 py-2.5 text-center text-sm text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={!ready || query.trim().length < 3}
          className="rounded-xl bg-brand-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          بحث
        </button>
      </form>

      {submitted && !report && (
        <p className="card mt-4 p-6 text-center text-sm text-ink-muted">
          لم نعثر على بلاغ بهذا الرقم. تأكد من الرقم، أو{" "}
          <Link href="/report" className="font-semibold text-brand-700 underline">
            قدّم بلاغاً جديداً
          </Link>
          .
        </p>
      )}

      {report && cluster && (
        <div className="rise card mt-4 space-y-5 p-5">
          <div>
            <p className="nums text-xs text-ink-muted">{report.id}</p>
            <p className="mt-1 text-sm text-ink">{report.text}</p>
            <p className="nums mt-1 text-[11px] text-ink-muted">
              أُرسل {relativeTime(report.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <StatusBadge id={cluster.status} />
            <SeverityBadge id={cluster.severity} />
            <CategoryChip id={report.category} />
            <MetaChip>📍 {zoneById(report.zoneId).label}</MetaChip>
          </div>

          <div className="rounded-xl bg-brand-50 p-3 text-xs text-ink-muted ring-1 ring-brand-100">
            بلاغك مُدرج ضمن المشكلة{" "}
            <span className="nums font-semibold text-brand-700">{cluster.id}</span> — «{cluster.title}» —
            لدى <span className="font-semibold text-brand-700">{cluster.assignedTo}</span>
            {cluster.reportIds.length === 1 ? (
              <>، وهو البلاغ الوحيد عنها حتى الآن.</>
            ) : (
              <>
                ، ومعه{" "}
                <span className="nums font-semibold text-brand-700">
                  {cluster.reportIds.length - 1}
                </span>{" "}
                {cluster.reportIds.length === 2 ? "بلاغ مشابه" : "بلاغات مشابهة"}.
              </>
            )}
          </div>

          <section>
            <h2 className="mb-3 text-sm font-bold text-ink">ما تم بشأن بلاغك</h2>
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

          {cluster.status === "resolved" && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
              ✓ تمت معالجة المشكلة وإغلاقها. شكراً لمساهمتك في تحسين التجربة.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
