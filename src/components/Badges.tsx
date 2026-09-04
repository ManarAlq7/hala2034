import { categoryById, severityDef, statusDef } from "@/lib/taxonomy";
import type { CategoryId, SeverityId, StatusId } from "@/lib/types";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap";

export function SeverityBadge({ id }: { id: SeverityId }) {
  const s = severityDef(id);
  return (
    <span className={`${base} ${s.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function StatusBadge({ id }: { id: StatusId }) {
  const s = statusDef(id);
  return <span className={`${base} ${s.chip}`}>{s.label}</span>;
}

export function CategoryChip({ id }: { id: CategoryId }) {
  const c = categoryById(id);
  return (
    <span className={`${base} bg-brand-50 text-brand-800 ring-brand-100`}>
      <span aria-hidden>{c.icon}</span>
      {c.label}
    </span>
  );
}

export function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className={`${base} bg-slate-50 text-slate-600 ring-slate-200 font-medium`}>{children}</span>
  );
}
