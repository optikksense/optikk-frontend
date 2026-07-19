import { memo } from "react";

import type { Monitor } from "../../api/monitorsApi";

interface Props {
  readonly monitor: Monitor;
}

function CurrentValueCard({ monitor }: Props) {
  const value = monitor.currentValue;
  const alert = monitor.conditions.alertThreshold;
  const warn = monitor.conditions.warnThreshold;
  // Ratio is only meaningful with a non-zero threshold; avoid divide-by-zero.
  const ratio =
    value !== undefined && alert !== undefined && alert !== 0 ? value / alert : undefined;
  const color =
    monitor.status === "alert"
      ? "text-error"
      : monitor.status === "warn"
        ? "text-warning"
        : monitor.status === "ok"
          ? "text-success"
          : "text-foreground-secondary";
  // Fall back to status-driven fill so a firing monitor never shows an empty bar.
  const barWidth =
    ratio !== undefined
      ? Math.min(100, Math.max(0, (ratio / 2) * 100))
      : monitor.status === "alert"
        ? 100
        : monitor.status === "warn"
          ? 66
          : 0;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-medium text-foreground text-sm">Current value</div>
      <div className="text-[11px] text-foreground-muted">vs alert threshold</div>
      <div className="mt-4">
        <div className={`font-semibold text-4xl ${color}`}>
          {value !== undefined ? value.toFixed(2) : "—"}
        </div>
        {ratio !== undefined && (
          <div className="mt-1 text-[11px] text-foreground-muted">
            {ratio.toFixed(1)}× over alert threshold ({alert})
          </div>
        )}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded bg-secondary">
        <div
          className={
            monitor.status === "alert"
              ? "h-full bg-error"
              : monitor.status === "warn"
                ? "h-full bg-warning"
                : "h-full bg-success"
          }
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-foreground-muted">
        <span>0</span>
        <span>warn {warn ?? "—"}</span>
        <span>alert {alert ?? "—"}</span>
      </div>
    </div>
  );
}

export default memo(CurrentValueCard);
