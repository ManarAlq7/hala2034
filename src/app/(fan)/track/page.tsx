"use client";

import Link from "next/link";
import { useState } from "react";
import { CategoryChip, SeverityBadge, StatusBadge } from "@/components/Badges";
import { clusterHeading } from "@/lib/ai";
import { clockTime, relativeTime } from "@/lib/format";
import { timelineText, useLocale } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { categoryOwner, zoneLabel } from "@/lib/taxonomy";

/**
 * تتبّع البلاغ: يدخل المبلّغ رقم المتابعة فيرى حالة بلاغه وما اتُّخذ بشأنه.
 * هذا يغلق الحلقة مع الجمهور بدل أن ينتهي البلاغ عند الإرسال.
 */
export default function TrackPage() {
  const { ready, reports, clusters } = useApp();
  const { t, locale, isRtl } = useLocale();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  const ref = submitted?.trim().toUpperCase() ?? "";
  const report = ref ? reports.find((r) => r.id.toUpperCase() === ref) : null;
  const cluster = report ? clusters.find((c) => c.id === report.clusterId) : null;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-text sm:text-3xl">{t("track.title")}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">{t("track.subtitle")}</p>

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
          placeholder={t("track.placeholder")}
          dir="ltr"
          className="input flex-1 text-center"
        />
        <button
          type="submit"
          disabled={!ready || query.trim().length < 3}
          className="btn btn-primary sm:px-8"
        >
          {t("track.search")}
        </button>
      </form>

      {submitted && !report && (
        <p className="card mt-4 p-8 text-center text-sm text-text-muted">
          {t("track.notFound")}{" "}
          <Link href="/" className="font-semibold text-brand underline">
            {t("track.newReport")}
          </Link>
          .
        </p>
      )}

      {report && cluster && (
        <div className="rise card mt-4 divide-y divide-line">
          <div className="p-5">
            <p className="nums text-xs text-text-dim">{report.id}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-text">{report.text}</p>
            <p className="mt-2 text-[11px] text-text-dim">
              {t("track.sentAt")} {relativeTime(report.createdAt, locale)}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <StatusBadge id={cluster.status} />
              <SeverityBadge id={cluster.severity} />
              <CategoryChip id={report.category} />
              <span className="chip chip-neutral">📍 {zoneLabel(report.zoneId, locale)}</span>
            </div>
          </div>

          <div className="bg-surface-2 p-5 text-xs leading-relaxed text-text-muted">
            {t("track.partOf")} <span className="nums font-bold text-brand">{cluster.id}</span> —{" "}
            {isRtl ? "«" : "“"}
            <span className="text-text">{clusterHeading(cluster, locale)}</span>
            {isRtl ? "»" : "”"} — {t("track.at")}{" "}
            <span className="font-semibold text-text">{categoryOwner(cluster.category, locale)}</span>
            {cluster.reportIds.length === 1
              ? t("track.onlyOne")
              : t("track.withOthers", { n: cluster.reportIds.length - 1 })}
          </div>

          <section className="p-5">
            <h2 className="label">{t("track.timelineTitle")}</h2>
            <ol
              className={`relative space-y-4 ${
                isRtl ? "border-r border-line pr-4" : "border-l border-line pl-4"
              }`}
            >
              {cluster.timeline.map((entry, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute top-1.5 h-2 w-2 rounded-full bg-brand ring-4 ring-surface ${
                      isRtl ? "-right-[21px]" : "-left-[21px]"
                    }`}
                  />
                  <p className="text-sm text-text">{timelineText(entry, locale)}</p>
                  <p className="nums mt-0.5 text-[11px] text-text-dim">{clockTime(entry.at)}</p>
                </li>
              ))}
            </ol>
          </section>

          {cluster.status === "resolved" && (
            <p className="bg-ok-wash p-5 text-sm font-semibold text-ok">✓ {t("track.resolved")}</p>
          )}
        </div>
      )}
    </div>
  );
}
