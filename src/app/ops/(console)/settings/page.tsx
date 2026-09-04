"use client";

import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/ops/Primitives";
import { initials, useSession, userName, userRole } from "@/lib/auth";
import { useLocale } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import type { Locale } from "@/lib/types";

export default function SettingsPage() {
  const { user } = useSession();
  const { t, locale, setLocale } = useLocale();
  const { shared, reset, reports, clusters } = useApp();
  const [resetting, setResetting] = useState(false);

  const onReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      await reset();
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <PageHeader title={t("set.title")} subtitle={t("set.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title={t("set.account")}>
          <div className="flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-wash text-sm font-bold text-brand">
              {user ? initials(user.name) : "—"}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-text">{user ? userName(user, locale) : "—"}</p>
              <p className="text-xs text-text-muted">{user ? userRole(user, locale) : ""}</p>
              <p className="nums mt-0.5 truncate text-[11px] text-text-dim">{user?.email}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title={t("set.language")}>
          <div className="flex gap-2 p-4">
            {(
              [
                { id: "ar" as Locale, label: "العربية" },
                { id: "en" as Locale, label: "English" },
              ]
            ).map((l) => (
              <button
                key={l.id}
                onClick={() => setLocale(l.id)}
                aria-pressed={locale === l.id}
                className={`btn flex-1 ${locale === l.id ? "btn-primary" : "btn-ghost"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={t("set.storage")} className="lg:col-span-2">
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${shared ? "animate-pulse bg-ok" : "bg-text-dim"}`}
              />
              <span className="text-text">
                {shared ? t("set.storageShared") : t("set.storageLocal")}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="chip chip-neutral nums">
                {reports.length} · {t("dash.reportWord")}
              </span>
              <span className="chip chip-neutral nums">
                {clusters.length} · {t("issues.title")}
              </span>
            </div>

            <div className="border-t border-line pt-4">
              <p className="mb-3 text-xs leading-relaxed text-text-dim">{t("set.resetWarn")}</p>
              <button onClick={onReset} disabled={resetting} className="btn btn-danger btn-sm">
                {resetting ? t("set.resetting") : t("set.reset")}
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
