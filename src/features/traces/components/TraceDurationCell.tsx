import { memo, useMemo } from "react";

interface Props {
  readonly durationMs: number;
  readonly maxMs: number;
  readonly hasError?: boolean;
}

function formatDuration(ms: number): string {
  if (ms < 1) return `${Math.round(ms * 1000)} μs`;
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function barWidthPercent(ms: number, maxMs: number): number {
  if (!Number.isFinite(maxMs) || maxMs <= 0) return 0;
  const pct = Math.min(100, Math.max(2, (ms / maxMs) * 100));
  return Math.round(pct * 10) / 10;
}

/**
 * Inline duration bar + numeric readout. `maxMs` comes from the page-level
 * max across visible rows so bars stay comparable as users scroll.
 */
export const TraceDurationCell = memo(function TraceDurationCell({
  durationMs,
  maxMs,
  hasError = false,
}: Props) {
  const width = useMemo(() => barWidthPercent(durationMs, maxMs), [durationMs, maxMs]);
  const tone = hasError ? "bg-red-500/70" : "bg-sky-500/70";
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded bg-[var(--bg-hover)]">
        <div
          className={`h-full ${tone}`}
          style={{ width: `${width}%` }}
          aria-hidden
        />
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-[var(--text-secondary)]">
        {formatDuration(durationMs)}
      </span>
    </div>
  );
});
