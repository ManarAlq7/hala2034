"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CategoryChip, SeverityBadge, StatusBadge } from "@/components/Badges";
import { clusterHeading } from "@/lib/ai";
import { trackInDb } from "@/lib/db";
import { clockTime, relativeTime } from "@/lib/format";
import { timelineText, useLocale } from "@/lib/i18n";
import { notifyStatus, useStatusWatch } from "@/lib/notify";
import { hasSupabase } from "@/lib/supabase";
import { categoryOwner, zoneLabel } from "@/lib/taxonomy";
import type { Cluster, Report } from "@/lib/types";

/**
 * تتبّع البلاغ: يدخل المبلّغ رمز المتابعة فيرى حالة بلاغه وما اتُّخذ بشأنه.
 * هذا يغلق الحلقة مع الجمهور بدل أن ينتهي البلاغ عند الإرسال.
 *
 * الصفحة لم تعد تقرأ جدول البلاغات — كانت تحمّله كاملاً إلى المتصفح لتبحث فيه،
 * وهذا يعني أن كل زائر يملك أسماء المبلّغين ونصوصهم. صارت تسأل عن بلاغ واحد
 * برمزه، والقاعدة هي التي تقرّر ماذا تُظهر.
 */
export default function TrackPage() {
  const { t, locale, isRtl } = useLocale();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [found, setFound] = useState<{
    report: Report;
    cluster: Cluster;
    siblingCount: number;
  } | null>(null);
  const [missing, setMissing] = useState(false);
  const lastStatus = useRef<string | null>(null);

  const lookup = useCallback(
    async (code: string): Promise<void> => {
      const clean = code.trim();
      if (clean.length < 4) return;

      setBusy(true);
      setMissing(false);
      try {
        const result = hasSupabase ? await trackInDb(clean) : null;
        setFound(result);
        setMissing(!result);
        if (result) lastStatus.current = result.cluster.status;
      } catch {
        setFound(null);
        setMissing(true);
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  /* حين تتغيّر حالة مشكلته يعرف فوراً، بلا أن يعيد البحث */
  const code = found?.report.trackCode ?? null;
  const clusterId = found?.cluster.id ?? null;

  const onClusterChange = useCallback(() => {
    if (code) void lookup(code);
  }, [code, lookup]);

  useStatusWatch(clusterId, onClusterChange);

  useEffect(() => {
    const status = found?.cluster.status;
    if (!status) return;
    if (lastStatus.current && lastStatus.current !== status) {
      notifyStatus(t("track.notifyTitle"), t(`track.notify.${status}` as never));
    }
    lastStatus.current = status;
  }, [found?.cluster.status, t]);

  const report = found?.report;
  const cluster = found?.cluster;

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-text sm:text-3xl">{t("track.title")}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">{t("track.subtitle")}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(query);
        }}
        className="card mt-6 flex flex-col gap-2 p-4 sm:flex-row"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder={t("track.placeholder")}
          dir="ltr"
          className="input flex-1 text-center tracking-[0.2em]"
        />
        <button
          type="submit"
          disabled={busy || query.trim().length < 4}
          className="btn btn-primary sm:px-8"
        >
          {busy ? t("common.loading") : t("track.search")}
        </button>
      </form>

      {missing && (
        <p className="card mt-4 p-8 text-center text-sm text-text-muted">
          {t("track.notFound")}{" "}
          <Link href="/report" className="font-semibold text-brand underline">
            {t("track.newReport")}
          </Link>
          .
        </p>
      )}

      {report && cluster && (
        <div className="rise card mt-4 divide-y divide-line">
          <div className="p-5">
            <p className="nums text-xs tracking-[0.16em] text-text-dim">{report.trackCode}</p>
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
            {found.siblingCount <= 1
              ? t("track.onlyOne")
              : t("track.withOthers", { n: found.siblingCount - 1 })}
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
