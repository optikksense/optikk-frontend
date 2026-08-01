import type { ReactNode } from "react";

import { cn } from "@shared/lib/utils";

import { formatPercent, healthFromError } from "../kafkaPageModel";

export function MetricCard({
  label,
  value,
  unit,
}: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3.5">
      <div className="text-[11px] text-foreground-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className="font-semibold text-[22px] text-foreground tabular-nums">{value}</span>
        {unit ? <span className="text-[11px] text-foreground-muted">{unit}</span> : null}
      </div>
    </div>
  );
}

export function ErrorRate({ value }: { value: number }) {
  const health = healthFromError(value);
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        health === "critical"
          ? "text-error"
          : health === "warning"
            ? "text-warning"
            : "text-success"
      )}
    >
      {formatPercent(value)}
    </span>
  );
}

export function SummaryValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-3 py-2.5">
      <div className="text-[10px] text-foreground-muted">{label}</div>
      <div className="mt-0.5 font-semibold text-[13px] tabular-nums">{children}</div>
    </div>
  );
}
