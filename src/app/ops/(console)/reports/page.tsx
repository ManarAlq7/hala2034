"use client";

import { useMemo, useState } from "react";
import ClusterDetail from "@/components/ClusterDetail";
import { CategoryChip, SeverityBadge } from "@/components/Badges";
import { IconSearch } from "@/components/ops/Icons";
import { EmptyState, PageHeader } from "@/components/ops/Primitives";
import { langLabel } from "@/lib/ai";
import { useNow } from "@/lib/clock";
import { clockTime, relativeTime } from "@/lib/format";
import { hasTranslation, reportText, useLocale } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { CHANNELS, ZONES, channelLabel, zoneLabel } from "@/lib/taxonomy";
import type { ChannelId } from "@/lib/types";

/**
 * البلاغات كما وردت.
 *
 * الفرق عن صفحة المشكلات: هنا الوحدة بلاغ واحد بنصّه الأصلي وترجمته، لا مشكلة
 * مجمّعة. المشرف يأتي إلى هنا حين يشكّ في التجميع نفسه أو يبحث عن عبارة بعينها.
 */
export default function RawReportsPage() {
  const { ready, reports, clusters } = useApp();
  const { t, locale } = useLocale();
  const now = useNow();

  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("all");
  const [zone, setZone] = useState("all");
  const [channel, setChannel] = useState<ChannelId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const languages = useMemo(
    () => Array.from(new Set(reports.map((r) => r.lang))).sort(),
    [reports],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports
      .filter((r) => (lang === "all" ? true : r.lang === lang))
      .filter((r) => (zone === "all" ? true : r.zoneId === zone))
      .filter((r) => (channel === "all" ? true : r.channel === channel))
      .filter((r) => {
        if (!q) return true;
        return (
          r.text.toLowerCase().includes(q) ||
          (r.textAr ?? "").toLowerCase().includes(q) ||
          (r.textEn ?? "").toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.clusterId.toLowerCase().includes(q)
        );
      });
  }, [reports, query, lang, zone, channel]);

  const openCluster = clusters.find((c) => c.id === openId) ?? null;

  if (!ready || now === 0) {
    return <p className="py-20 text-center text-sm text-text-dim">{t("dash.loading")}</p>;
  }

  return (
    <>
      <PageHeader
        title={t("raw.title")}
        subtitle={t("raw.subtitle")}
        actions={<span className="chip chip-neutral">{t("raw.count", { n: filtered.length })}</span>}
      />

      <div className="card mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-text-dim">
            <IconSearch className="h-4 w-4" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("issues.search")}
            className="input ps-9"
          />
        </div>

        <select value={lang} onChange={(e) => setLang(e.target.value)} className="input">
          <option value="all">{t("raw.allLanguages")}</option>
          {languages.map((code) => (
            <option key={code} value={code}>
              {langLabel(code, locale)}
            </option>
          ))}
        </select>

        <select value={zone} onChange={(e) => setZone(e.target.value)} className="input">
          <option value="all">{t("raw.allZones")}</option>
          {ZONES.map((z) => (
            <option key={z.id} value={z.id}>
              {zoneLabel(z.id, locale)}
            </option>
          ))}
        </select>

        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as ChannelId | "all")}
          className="input"
        >
          <option value="all">{t("raw.allChannels")}</option>
          {CHANNELS.map((c) => (
            <option key={c.id} value={c.id}>
              {channelLabel(c.id, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState>{t("raw.empty")}</EmptyState>
        ) : (
          <ul className="divide-y divide-line">
            {filtered.map((r) => (
              <li key={r.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-text">{reportText(r, locale)}</p>
                    {hasTranslation(r, locale) && (
                      <p className="mt-1.5 border-s-2 border-line ps-2.5 text-xs text-text-dim">
                        <span className="font-semibold">{t("raw.original")}: </span>
                        {r.text}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setOpenId(r.clusterId)} className="btn btn-ghost btn-sm">
                    <span className="nums">{r.clusterId}</span>
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="chip chip-neutral nums">{r.id}</span>
                  <CategoryChip id={r.category} />
                  <SeverityBadge id={r.severity} />
                  <span className="chip chip-neutral">🌐 {langLabel(r.lang, locale)}</span>
                  <span className="chip chip-neutral">📍 {zoneLabel(r.zoneId, locale)}</span>
                  <span className="chip chip-neutral">{channelLabel(r.channel, locale)}</span>
                  <span className="chip chip-neutral">
                    {r.source === "voice" ? t("detail.voice") : t("detail.text")}
                  </span>
                  <span className="ms-auto text-[11px] text-text-dim">
                    <span className="nums">{clockTime(r.createdAt)}</span> ·{" "}
                    {relativeTime(r.createdAt, locale, now)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {openCluster && (
        <ClusterDetail cluster={openCluster} reports={reports} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}
