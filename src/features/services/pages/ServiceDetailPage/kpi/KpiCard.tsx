import { cn } from "@/lib/utils";

import type { Delta } from "../formatters";

export type KpiTone = "ok" | "warn" | "err" | "neutral";

const VALUE_TONE: Record<KpiTone, string> = {
  ok: "text-[var(--text-primary)]",
  warn: "text-[var(--color-warning,#f59e0b)]",
  err: "text-[var(--color-error,#ef4444)]",
  neutral: "text-[var(--text-primary)]",
};

const DELTA_TONE: Record<Delta["direction"], string> = {
  up: "text-[var(--color-error,#ef4444)]",
  down: "text-[var(--color-success,#10b981)]",
  flat: "text-[var(--text-muted)]",
};

const DELTA_ARROW: Record<Delta["direction"], string> = {
  up: "▲",
  down: "▼",
  flat: "·",
};

interface KpiCardProps {
  readonly label: string;
  readonly value: string;
  readonly secondary?: string;
  readonly subtext?: string;
  readonly delta?: Delta | null;
  readonly tone?: KpiTone;
}

export function KpiCard({ label, value, secondary, subtext, delta, tone = "ok" }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-2.5">
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">{label}</div>
      <div className={cn("flex items-baseline gap-1 font-semibold text-[22px]", VALUE_TONE[tone])}>
        <span>{value}</span>
        {secondary && (
          <span className="font-normal text-[12px] text-[var(--text-muted)]">{secondary}</span>
        )}
      </div>
      <div className="flex items-baseline gap-2 text-[11px] text-[var(--text-muted)]">
        {subtext && <span>{subtext}</span>}
        {delta && (
          <span className={cn("font-medium", DELTA_TONE[delta.direction])}>
            {DELTA_ARROW[delta.direction]} {delta.label}
          </span>
        )}
      </div>
    </div>
  );
}
