"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconAnalytics,
  IconClose,
  IconIssues,
  IconLogout,
  IconMap,
  IconMenu,
  IconOverview,
  IconReports,
  IconSettings,
} from "./Icons";
import { initials, signOut, useSession, userName, userRole } from "@/lib/auth";
import { useLocale } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import type { StringKey } from "@/lib/strings";

const NAV: { href: string; key: StringKey; Icon: (p: { className?: string }) => React.ReactElement }[] = [
  { href: "/ops", key: "ops.overview", Icon: IconOverview },
  { href: "/ops/issues", key: "ops.issues", Icon: IconIssues },
  { href: "/ops/map", key: "ops.map", Icon: IconMap },
  { href: "/ops/reports", key: "ops.reports", Icon: IconReports },
  { href: "/ops/analytics", key: "ops.analytics", Icon: IconAnalytics },
  { href: "/ops/matchday", key: "nav.matchday", Icon: IconOverview },
  { href: "/ops/settings", key: "ops.settings", Icon: IconSettings },
];

/**
 * هيكل كونسول العمليات: حراسة الجلسة، ثم شريط جانبي ثابت وشريط علوي.
 *
 * الحراسة هنا توجيه لا حماية: المنع الفعلي في سياسات قاعدة البيانات، التي
 * ترفض كل كتابة تشغيلية بلا رمز جلسة صالح. لذلك لا يكفي تجاوز هذه الشاشة.
 */
export default function OpsShell({ children }: { children: React.ReactNode }) {
  const { status, user, isOps } = useSession();
  const { t, locale, toggle, isRtl } = useLocale();
  const { clusters, shared } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // إعادة التوجيه بعد اكتمال القراءة فقط — لا يُطرَد مسجَّلٌ لأن الجلسة لم تصل بعد.
  // ومن سجّل دخوله كمشجّع ليس مشغّلاً: يعود إلى حسابه لا إلى شاشة الدخول، فليس
  // به نقص جلسة بل نقص صلاحية.
  useEffect(() => {
    if (status === "anonymous") router.replace("/ops/login");
    else if (status === "authenticated" && !isOps) router.replace("/account");
  }, [status, isOps, router]);

  if (status !== "authenticated" || !user || !isOps) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-sm text-text-muted">
        {status === "loading" ? t("ops.guardChecking") : t("ops.guardRedirect")}
      </div>
    );
  }

  const openCritical = clusters.filter(
    (c) => c.status !== "resolved" && (c.severity === "critical" || c.severity === "high"),
  ).length;

  const nav = (
    <nav className="space-y-1">
      {NAV.map(({ href, key, Icon }) => {
        const active = href === "/ops" ? pathname === "/ops" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            data-active={active}
            // إغلاق قائمة الجوال عند الانتقال، وإلا بقيت مفتوحة فوق الصفحة الجديدة
            onClick={() => setMenuOpen(false)}
            className="nav-link"
          >
            <Icon />
            <span>{t(key)}</span>
            {key === "ops.issues" && openCritical > 0 && (
              <span className="nums ms-auto rounded-full bg-danger-wash px-1.5 py-0.5 text-[10px] font-bold text-danger">
                {openCritical}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* الشريط الجانبي — ثابت على الشاشات الكبيرة */}
      <aside
        className={`fixed inset-y-0 z-40 w-64 shrink-0 border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isRtl ? "right-0 border-l" : "left-0 border-r"
        } ${menuOpen ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"} lg:transform-none`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/ops" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-wash text-base ring-1 ring-brand-dim">
                ⚽
              </span>
              <span className="leading-none">
                <span className="nums block text-sm font-bold tracking-tight text-text">HALA 2034</span>
                <span className="mt-1 block text-[10px] tracking-[0.16em] text-text-dim">
                  {t("ops.console")}
                </span>
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="btn btn-ghost btn-sm lg:hidden"
              aria-label={t("detail.close")}
            >
              <IconClose />
            </button>
          </div>

          {nav}

          <div className="mt-auto space-y-2 pt-6">
            <div className="flex items-center gap-1.5 text-[11px] text-text-dim">
              <span
                className={`h-1.5 w-1.5 rounded-full ${shared ? "animate-pulse bg-ok" : "bg-text-dim"}`}
              />
              {shared ? t("dash.sharedOn") : t("dash.sharedOff")}
            </div>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/35 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}

      {/* المحتوى */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <button
              onClick={() => setMenuOpen(true)}
              className="btn btn-ghost btn-sm lg:hidden"
              aria-label={t("ops.menu")}
            >
              <IconMenu />
            </button>

            <div className="flex flex-1 items-center justify-end gap-2">
              <button onClick={toggle} className="btn btn-ghost btn-sm">
                {t("header.switchLang")}
              </button>

              <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-1.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-wash text-[11px] font-bold text-brand">
                  {initials(user.name)}
                </span>
                <span className="hidden leading-tight sm:block">
                  <span className="block text-xs font-bold text-text">{userName(user, locale)}</span>
                  <span className="block text-[10px] text-text-dim">{userRole(user, locale)}</span>
                </span>
              </div>

              <button
                onClick={() => void signOut()}
                className="btn btn-ghost btn-sm"
                aria-label={t("ops.logout")}
              >
                <IconLogout />
                <span className="hidden sm:inline">{t("ops.logout")}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
