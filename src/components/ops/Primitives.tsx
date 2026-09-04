"use client";

import Link from "next/link";
import type { Tone } from "@/lib/taxonomy";

/* -------------------------------------------------------------------------- */
/*  لبنات الكونسول                                                             */
/*                                                                             */
/*  كل صفحة تشغيلية تُبنى من هذه القطع وحدها، فتتشابه الصفحات في الإيقاع        */
/*  والمسافات بلا اتفاق شفهي بين الملفات.                                        */
/* -------------------------------------------------------------------------- */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-text sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-text",
  info: "text-info",
  warn: "text-warn",
  danger: "text-danger",
  ok: "text-ok",
  brand: "text-brand",
};

/**
 * مؤشر واحد.
 *
 * الرقم هو البطل: حجمه أكبر بكثير من تسميته، فتُقرأ الصفّة كلها بنظرة واحدة
 * دون قراءة أي تسمية.
 */
export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-dim">{label}</p>
      <p className={`nums mt-2 text-3xl font-bold leading-none ${TONE_TEXT[tone]}`}>{value}</p>
      {hint && <p className="mt-1.5 text-[11px] text-text-dim">{hint}</p>}
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-sm font-bold text-text">{title}</h2>
        {action && (
          <Link
            href={action.href}
            className="text-[11px] font-semibold text-text-muted transition hover:text-brand"
          >
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-10 text-center text-sm text-text-dim">{children}</p>;
}

/** مرشّح على هيئة شارة قابلة للضغط */
export function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`chip transition ${active ? "chip-brand" : "chip-neutral hover:border-line-strong"}`}
    >
      {children}
    </button>
  );
}
