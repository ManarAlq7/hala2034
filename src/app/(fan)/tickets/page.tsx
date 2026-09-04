"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  bookTickets,
  matchAway,
  matchHome,
  matchStage,
  remaining,
  tierName,
  useCatalog,
  venueCity,
  venueName,
  type Booking,
  type BookingError,
} from "@/lib/catalog";
import { matchDateTime } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import type { StringKey } from "@/lib/strings";

const ERROR_KEY: Record<BookingError, StringKey> = {
  sold_out: "tk.errorSoldOut",
  invalid: "tk.errorInvalid",
  unavailable: "tk.errorUnavailable",
};

const MAX_PER_BOOKING = 6;

export default function TicketsPage() {
  const { t, locale } = useLocale();
  const { venues, matches, tiers, status, reload } = useCatalog();

  const [matchId, setMatchId] = useState<string | null>(null);
  const [tierId, setTierId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(2);
  const [holder, setHolder] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<BookingError | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const venueById = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);

  // الاختيار مشتقّ لا محفوظ: ما دام المستخدم لم يختر بعد تُعرض أول مباراة وأول
  // فئة متاحة. تخزينهما في حالة يعني مزامنتها يدوياً مع كل وصول بيانات جديد.
  const selectedMatchId = matchId ?? matches[0]?.id ?? null;

  const matchTiers = useMemo(
    () => tiers.filter((tier) => tier.matchId === selectedMatchId),
    [tiers, selectedMatchId],
  );

  const tier =
    matchTiers.find((x) => x.id === tierId) ??
    matchTiers.find((x) => remaining(x) > 0) ??
    matchTiers[0] ??
    null;

  const left = tier ? remaining(tier) : 0;
  const total = tier ? tier.priceSar * quantity : 0;

  const onBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tier || busy) return;

    setBusy(true);
    setError(null);
    const result = await bookTickets(tier.id, quantity, holder);
    setBusy(false);

    if (typeof result === "string") {
      setError(result);
      // الإتاحة تغيّرت تحت المستخدم — تُعاد قراءتها فلا يعيد المحاولة على رقم قديم
      if (result === "sold_out") reload();
      return;
    }

    setBooking(result);
    reload();
  };

  if (status === "unavailable") {
    return (
      <Shell title={t("tk.title")} subtitle={t("tk.subtitle")}>
        <p className="card p-8 text-center text-sm text-text-muted">{t("tk.unavailable")}</p>
      </Shell>
    );
  }

  if (status === "loading") {
    return (
      <Shell title={t("tk.title")} subtitle={t("tk.subtitle")}>
        <p className="py-16 text-center text-sm text-text-dim">{t("common.loading")}</p>
      </Shell>
    );
  }

  if (booking) {
    const bookedMatch = matches.find((m) => m.id === booking.matchId);
    return (
      <Shell title={t("tk.title")} subtitle={t("tk.subtitle")}>
        <div className="rise card overflow-hidden">
          <div className="border-b border-line bg-brand-wash px-5 py-6 text-center sm:px-8">
            <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-brand-strong text-lg text-on-brand">
              ✓
            </span>
            <h2 className="text-xl font-bold text-text">{t("tk.confirmed")}</h2>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-text-dim">
              {t("tk.reference")}
            </p>
            <p className="nums mt-1 text-3xl font-bold tracking-tight text-brand">{booking.id}</p>
          </div>

          <dl className="divide-y divide-line">
            {bookedMatch && (
              <Row
                label={t("tk.selectMatch")}
                value={`${matchHome(bookedMatch, locale)} — ${matchAway(bookedMatch, locale)}`}
              />
            )}
            <Row label={t("tk.holder")} value={booking.holderName} />
            <Row label={t("tk.quantity")} value={String(booking.quantity)} nums />
            <Row
              label={t("tk.total")}
              value={`${booking.totalSar.toLocaleString("en-US")} ${t("tk.currency")}`}
              nums
            />
          </dl>

          <div className="flex flex-col gap-2 p-5 sm:flex-row">
            <button
              onClick={() => {
                setBooking(null);
                setHolder("");
              }}
              className="btn btn-ghost flex-1"
            >
              {t("tk.bookAnother")}
            </button>
            <Link href="/fan-zones" className="btn btn-primary flex-1">
              {t("fz.title")}
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-[11px] text-text-dim">{t("tk.demoNote")}</p>
      </Shell>
    );
  }

  if (matches.length === 0) {
    return (
      <Shell title={t("tk.title")} subtitle={t("tk.subtitle")}>
        <p className="card p-8 text-center text-sm text-text-muted">{t("tk.noMatches")}</p>
      </Shell>
    );
  }

  return (
    <Shell title={t("tk.title")} subtitle={t("tk.subtitle")}>
      <form onSubmit={onBook} className="space-y-4">
        {/* اختيار المباراة */}
        <section className="card p-4 sm:p-5">
          <h2 className="label">{t("tk.selectMatch")}</h2>
          <ul className="thin-scroll max-h-72 space-y-2 overflow-y-auto pe-1">
            {matches.map((m) => {
              const mVenue = venueById.get(m.venueId);
              const selected = m.id === selectedMatchId;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setMatchId(m.id)}
                    aria-pressed={selected}
                    className={`w-full rounded-xl border px-3.5 py-3 text-start transition ${
                      selected
                        ? "border-brand-dim bg-brand-wash"
                        : "border-line bg-surface-2 hover:border-line-strong"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-dim">
                      <span>
                        {matchStage(m, locale)}
                        {m.group ? ` · ${m.group}` : ""}
                      </span>
                      <span className="nums">{matchDateTime(m.kickoff, locale)}</span>
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold text-text">
                      <span aria-hidden>{m.homeFlag}</span>
                      {matchHome(m, locale)}
                      <span className="text-text-dim">—</span>
                      <span aria-hidden>{m.awayFlag}</span>
                      {matchAway(m, locale)}
                    </p>
                    {mVenue && (
                      <p className="mt-1 text-[11px] text-text-muted">
                        {venueName(mVenue, locale)} · {venueCity(mVenue, locale)}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* الفئة والعدد */}
        <section className="card space-y-5 p-4 sm:p-5">
          <div>
            <h2 className="label">{t("tk.category")}</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              {matchTiers.map((x) => {
                const available = remaining(x);
                const selected = x.id === tier?.id;
                return (
                  <button
                    key={x.id}
                    type="button"
                    disabled={available === 0}
                    onClick={() => setTierId(x.id)}
                    aria-pressed={selected}
                    className={`rounded-xl border px-3.5 py-3 text-start transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? "border-brand-dim bg-brand-wash"
                        : "border-line bg-surface-2 hover:border-line-strong"
                    }`}
                  >
                    <p className="text-sm font-bold text-text">{tierName(x, locale)}</p>
                    <p className="nums mt-1 text-sm text-brand">
                      {x.priceSar.toLocaleString("en-US")} {t("tk.currency")}
                      <span className="text-[11px] text-text-dim"> / {t("tk.perTicket")}</span>
                    </p>
                    <p className="nums mt-1.5 text-[11px] text-text-dim">
                      {available === 0
                        ? t("tk.soldOut")
                        : `${available.toLocaleString("en-US")} ${t("tk.available")}`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="qty" className="label">
                {t("tk.quantity")}
              </label>
              <select
                id="qty"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input"
              >
                {Array.from({ length: MAX_PER_BOOKING }, (_, i) => i + 1)
                  .filter((n) => n <= Math.max(1, left))
                  .map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label htmlFor="holder" className="label">
                {t("tk.holder")}
              </label>
              <input
                id="holder"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder={t("tk.holderPlaceholder")}
                maxLength={80}
                className="input"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-sm text-text-muted">
              {t("tk.total")}{" "}
              <span className="nums text-lg font-bold text-text">
                {total.toLocaleString("en-US")} {t("tk.currency")}
              </span>
            </p>
            <button
              type="submit"
              disabled={busy || !tier || left === 0 || holder.trim().length < 2}
              className="btn btn-primary px-6"
            >
              {busy ? t("tk.booking") : t("tk.book")}
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-danger/40 bg-danger-wash px-3 py-2 text-xs font-semibold text-danger"
            >
              {t(ERROR_KEY[error])}
            </p>
          )}
        </section>
      </form>

      <p className="mt-4 text-center text-[11px] text-text-dim">{t("tk.demoNote")}</p>
    </Shell>
  );
}

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-text sm:text-3xl">{title}</h1>
      <p className="mb-6 mt-2 text-sm text-text-muted">{subtitle}</p>
      {children}
    </div>
  );
}

function Row({ label, value, nums = false }: { label: string; value: string; nums?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3">
      <dt className="text-xs text-text-dim">{label}</dt>
      <dd className={`text-sm font-semibold text-text ${nums ? "nums" : ""}`}>{value}</dd>
    </div>
  );
}
