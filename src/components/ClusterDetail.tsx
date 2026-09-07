"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CategoryChip, SeverityBadge, StatusBadge } from "./Badges";
import { IconClose } from "./ops/Icons";
import { categoryOwner, channelLabel, zoneLabel } from "@/lib/taxonomy";
import { clusterHeading, langLabel } from "@/lib/ai";
import { clockTime, relativeTime } from "@/lib/format";
import { hasTranslation, reportText, timelineText, useLocale } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import type { StringKey } from "@/lib/strings";
import type { Cluster, Report, StatusId } from "@/lib/types";

interface Props {
  cluster: Cluster;
  reports: Report[];
  onClose: () => void;
}

const ACTIONS: { id: StatusId; key: StringKey; cls: string }[] = [
  { id: "in_progress", key: "detail.start", cls: "btn-ghost" },
  { id: "resolved", key: "detail.resolve", cls: "btn-primary" },
  { id: "new", key: "detail.reopen", cls: "btn-ghost" },
];

export default function ClusterDetail({ cluster, reports, onClose }: Props) {
  const { setStatus, addNote, summarize, summarizing } = useApp();
  const { t, locale, isRtl } = useLocale();
  const [note, setNote] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const members = reports.filter((r) => r.clusterId === cluster.id);
  const isSummarizing = summarizing.includes(cluster.id);

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

  const heading = clusterHeading(cluster, locale);
  const summary = cluster.summary;

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-black/35 backdrop-blur-[2px] ${isRtl ? "justify-start" : "justify-end"}`}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={`thin-scroll h-full w-full max-w-xl overflow-y-auto border-line bg-bg outline-none ${
          isRtl ? "border-l" : "border-r"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* الترويسة */}
        <div className="aura sticky top-0 z-10 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="nums text-[11px] text-text-dim">{cluster.id}</p>
              <h2 className="text-base font-bold text-text">{heading}</h2>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm" aria-label={t("detail.close")}>
              <IconClose />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <CategoryChip id={cluster.category} />
            <SeverityBadge id={cluster.severity} />
            <StatusBadge id={cluster.status} />
            <span className="chip chip-neutral">📍 {zoneLabel(cluster.zoneId, locale)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-dim">
            <span>
              {t("detail.ownerLabel")} {categoryOwner(cluster.category, locale)}
            </span>
            <span>
              {t("dash.lastReport")} {relativeTime(cluster.lastSeen, locale)}
            </span>
            <span className="nums">
              {members.length} {t("dash.reportWord")}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-5">
          {/* خلاصة المشكلة */}
          <section className="card-2 p-4">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-brand">
                {t("detail.summary")}
              </h3>
              <button
                onClick={() => summarize(cluster.id)}
                disabled={isSummarizing}
                className="btn btn-ghost btn-sm"
              >
                {isSummarizing
                  ? t("detail.summarizing")
                  : summary
                    ? t("detail.resummarize")
                    : t("detail.summarize")}
              </button>
            </div>

            {summary ? (
              <>
                <p className="text-sm leading-relaxed text-text">
                  {locale === "ar" ? summary.summaryAr : summary.summaryEn}
                </p>
                {(locale === "ar" ? summary.actionAr : summary.actionEn) && (
                  <p className="mt-3 rounded-lg border border-brand-dim bg-brand-wash px-3 py-2 text-xs leading-relaxed text-text">
                    <span className="font-bold text-brand">{t("detail.suggestedAction")}: </span>
                    {locale === "ar" ? summary.actionAr : summary.actionEn}
                  </p>
                )}
                <p className="nums mt-2.5 text-[11px] text-text-dim">
                  {t("detail.basedOn", { n: summary.basedOn })}
                </p>
              </>
            ) : (
              <p className="text-xs text-text-dim">
                {isSummarizing ? t("detail.summarizing") : t("detail.noSummary")}
              </p>
            )}
          </section>

          {/* الإجراءات */}
          <section>
            <h3 className="label">{t("detail.actions")}</h3>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.filter((a) => a.id !== cluster.status).map((a) => (
                <button
                  key={a.id}
                  onClick={() => void setStatus(cluster.id, a.id)}
                  className={`btn btn-sm ${a.cls}`}
                >
                  {t(a.key)}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                void addNote(cluster.id, note.trim());
                setNote("");
              }}
              className="mt-3 flex gap-2"
            >
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("detail.notePlaceholder")}
                className="input flex-1"
              />
              <button type="submit" className="btn btn-ghost btn-sm">
                {t("detail.add")}
              </button>
            </form>
          </section>

          {/* سجل المتابعة */}
          <section>
            <h3 className="label">{t("detail.timeline")}</h3>
            <ol
              className={`relative space-y-4 ${
                isRtl ? "border-r border-line pr-4" : "border-l border-line pl-4"
              }`}
            >
              {cluster.timeline.map((entry, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute top-1.5 h-2 w-2 rounded-full bg-brand ring-4 ring-bg ${
                      isRtl ? "-right-[21px]" : "-left-[21px]"
                    }`}
                  />
                  <p className="text-sm text-text">{timelineText(entry, locale)}</p>
                  <p className="nums mt-0.5 text-[11px] text-text-dim">{clockTime(entry.at)}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* البلاغات المكوّنة للمشكلة */}
          <section>
            <h3 className="label">
              {t("detail.grouped")} (<span className="nums">{members.length}</span>)
            </h3>
            <ul className="space-y-2">
              {members.map((r) => (
                <li key={r.id} className="card-2 p-3">
                  <p className="text-sm leading-relaxed text-text">{reportText(r, locale)}</p>
                  {hasTranslation(r, locale) && (
                    <p className="mt-1.5 border-s-2 border-line ps-2.5 text-xs text-text-dim">
                      {r.text}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-dim">
                    <span className="nums font-semibold text-brand">{r.id}</span>
                    <span>{r.source === "voice" ? t("detail.voice") : t("detail.text")}</span>
                    <span>{channelLabel(r.channel, locale)}</span>
                    <span>{langLabel(r.lang, locale)}</span>
                    <span>{relativeTime(r.createdAt, locale)}</span>
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
