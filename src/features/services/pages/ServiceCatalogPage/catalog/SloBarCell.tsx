import { cn } from "@/lib/utils";

import type { SloRow } from "@/features/services/api/serviceCatalogApi";

interface SloBarCellProps {
  readonly slo: SloRow | null;
}

function barTone(status: string | undefined): string {
  if (status === "critical" || status === "burning") return "bg-[var(--color-error,#ef4444)]";
  if (status === "at-risk") return "bg-[var(--color-warning,#f59e0b)]";
  return "bg-[var(--color-info,#3b82f6)]";
}

function textTone(status: string | undefined): string {
  if (status === "critical" || status === "burning") return "text-[var(--color-error,#ef4444)]";
  if (status === "at-risk") return "text-[var(--color-warning,#f59e0b)]";
  return "text-[var(--text-primary)]";
}

export function SloBarCell({ slo }: SloBarCellProps) {
  if (!slo || slo.error_budget_remaining == null) {
    return <span className="text-[11px] text-[var(--text-muted)]">—</span>;
  }
  const budget = Math.max(0, Math.min(1, slo.error_budget_remaining));
  const label = slo.slo_name || "SLO";
  return (
    <div className="flex min-w-[120px] flex-col gap-1">
      <div className={cn("truncate font-mono text-[11px]", textTone(slo.status))}>{label}</div>
      <div className="h-1.5 w-full rounded bg-[var(--bg-elevated,rgba(255,255,255,0.05))]">
        <div
          className={cn("h-full rounded transition-all", barTone(slo.status))}
          style={{ width: `${budget * 100}%` }}
        />
      </div>
    </div>
  );
}
