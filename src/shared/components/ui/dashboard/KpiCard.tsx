import { cn } from "@/lib/utils";

export type KpiTone = "ok" | "warn" | "err" | "neutral";

export interface KpiDelta {
  readonly label: string;
  readonly direction: "up" | "down" | "flat";
}

const VALUE_TONE: Record<KpiTone, string> = {
  ok: "text-[var(--text-primary)]",
  warn: "text-[var(--color-warning)]",
  err: "text-[var(--color-error)]",
  neutral: "text-[var(--text-primary)]",
};

const DELTA_TONE: Record<KpiDelta["direction"], string> = {
  up: "text-[var(--color-error)]",
  down: "text-[var(--color-success)]",
  flat: "text-[var(--text-muted)]",
};

const DELTA_ARROW: Record<KpiDelta["direction"], string> = {
  up: "▲",
  down: "▼",
  flat: "·",
};

interface KpiCardProps {
  readonly label: string;
  readonly value: string;
  readonly secondary?: string;
  readonly subtext?: string;
  readonly delta?: KpiDelta | null;
  readonly tone?: KpiTone;
}

export function KpiCard({ label, value, secondary, subtext, delta, tone = "ok" }: KpiCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-3">
      <div className="text-[10.5px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        {label}
      </div>
      <div
        className={cn(
          "flex items-baseline gap-1.5 font-semibold text-[28px] leading-none",
          VALUE_TONE[tone]
        )}
      >
        <span>{value}</span>
        {secondary && (
          <span className="font-normal text-[13px] text-[var(--text-muted)]">{secondary}</span>
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
