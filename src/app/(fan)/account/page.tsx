"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount, useMyActivity } from "@/lib/account";
import { signOut } from "@/lib/auth";
import { matchAway, matchHome, useCatalog } from "@/lib/catalog";
import { matchDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

/* -------------------------------------------------------------------------- */
/*  حساب المشجّع                                                                */
/*                                                                             */
/*  ما فعله صاحب الحساب في مكان واحد: تذاكره وبلاغاته. لا إعدادات ولا ملفّ       */
/*  شخصي — لم يُنشئ الحساب ليملأ حقولاً، بل ليجد ما حجزه دون أن يحفظ رمزاً.       */
/* -------------------------------------------------------------------------- */

export default function AccountPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { status, account } = useAccount();
  const { bookings, reports, loading } = useMyActivity(account?.id ?? null);
  const { matches } = useCatalog();

  useEffect(() => {
    if (status === "signedOut") router.replace("/account/signin");
  }, [status, router]);

  if (status !== "signedIn" || !account) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-sm text-text-muted">
        {t("common.loading")}
      </div>
    );
  }

  const matchById = new Map(matches.map((m) => [m.id, m]));

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-5 py-12">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-brand">{t("acc.welcome")}</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-text sm:text-3xl">
            {account.name}
          </h1>
          <p className="mt-1 text-sm text-text-dim">{account.email}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.replace("/");
          }}
          className="btn btn-ghost px-4 py-2 text-sm"
        >
          {t("acc.signOut")}
        </button>
      </header>

      {/* ------------------------------- التذاكر ------------------------------- */}
      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-text">{t("acc.myTickets")}</h2>
          <Link href="/tickets" className="text-sm font-semibold text-brand underline underline-offset-4">
            {t("acc.bookMore")}
          </Link>
        </div>

        {loading && <p className="mt-4 text-sm text-text-dim">{t("common.loading")}</p>}

        {!loading && bookings.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-text-dim">
            {t("acc.noTickets")}
          </p>
        )}

        {bookings.length > 0 && (
          <ul className="mt-4 space-y-3">
            {bookings.map((b) => {
              const match = matchById.get(b.matchId);
              return (
                <li key={b.id} className="card p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-bold text-text">
                      {match
                        ? `${matchHome(match, locale)} — ${matchAway(match, locale)}`
                        : b.matchId}
                    </p>
                    <span className="nums chip">{b.id}</span>
                  </div>
                  {match && (
                    <p className="mt-1 text-[13px] text-text-muted">
                      {matchDateTime(match.kickoff, locale)}
                    </p>
                  )}
                  <p className="nums mt-2 text-[12px] text-text-dim">
                    {t("acc.ticketCount", { n: b.quantity })} ·{" "}
                    {b.totalSar.toLocaleString("en-US")} {t("tk.currency")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ------------------------------- البلاغات ------------------------------- */}
      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-text">{t("acc.myReports")}</h2>
          <Link href="/report" className="text-sm font-semibold text-brand underline underline-offset-4">
            {t("acc.newReport")}
          </Link>
        </div>

        {!loading && reports.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-text-dim">
            {t("acc.noReports")}
          </p>
        )}

        {reports.length > 0 && (
          <ul className="mt-4 space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="chip">{r.category}</span>
                  <Link
                    href={`/track?code=${encodeURIComponent(r.id)}`}
                    className="nums text-[12px] font-semibold text-brand underline underline-offset-4"
                  >
                    {r.id}
                  </Link>
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-text-muted">
                  {r.text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
