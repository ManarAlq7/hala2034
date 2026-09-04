"use client";

import {
  categoryById,
  categoryLabel,
  severityDef,
  severityLabel,
  statusDef,
  statusLabel,
  type Tone,
} from "@/lib/taxonomy";
import { useLocale } from "@/lib/i18n";
import type { CategoryId, SeverityId, StatusId } from "@/lib/types";

/** النغمة إلى صنف الشارة — الترجمة الوحيدة بين نظام التصميم والـ CSS */
export const toneClass: Record<Tone, string> = {
  neutral: "chip-neutral",
  info: "chip-info",
  warn: "chip-warn",
  danger: "chip-danger",
  ok: "chip-ok",
  brand: "chip-brand",
};

export function SeverityBadge({ id }: { id: SeverityId }) {
  const { locale } = useLocale();
  const def = severityDef(id);
  return (
    <span className={`chip ${toneClass[def.tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: def.color }} />
      {severityLabel(id, locale)}
    </span>
  );
}

export function StatusBadge({ id }: { id: StatusId }) {
  const { locale } = useLocale();
  return <span className={`chip ${toneClass[statusDef(id).tone]}`}>{statusLabel(id, locale)}</span>;
}

export function CategoryChip({ id }: { id: CategoryId }) {
  const { locale } = useLocale();
  return (
    <span className="chip chip-neutral">
      <span aria-hidden>{categoryById(id).icon}</span>
      {categoryLabel(id, locale)}
    </span>
  );
}

export function MetaChip({ children }: { children: React.ReactNode }) {
  return <span className="chip chip-neutral">{children}</span>;
}
