import { memo, useMemo } from "react";

import type { AnalyticsResponse } from "../../types/analytics";

interface Props {
  readonly data: AnalyticsResponse;
}

interface TopRow {
  readonly label: string;
  readonly value: number;
}

/**
 * Horizontal bars rendered via flex widths. Lightweight by design — the
 * Datadog-style TopN view doesn't need axes or scale ticks; just ranked
 * bars with labels. Builds the bar widths relative to the max value in
 * the result set.
 */
function AnalyticsTopNImpl({ data }: Props) {
  const rows = useMemo(() => buildRows(data), [data]);
  if (rows.length === 0) {
    return <div className="p-6 text-sm text-[var(--text-secondary)]">No data</div>;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="flex flex-col gap-1 p-4">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center gap-3">
          <span className="w-56 truncate text-sm text-[var(--text-primary)]" title={row.label}>
            {row.label}
          </span>
          <div className="relative h-5 flex-1 rounded bg-[var(--bg-secondary)]">
            <div
              className="absolute left-0 top-0 h-full rounded bg-[var(--chart-primary,#3b82f6)]"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          <span className="w-20 text-right font-mono text-xs text-[var(--text-secondary)]">
            {formatValue(row.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export const AnalyticsTopN = memo(AnalyticsTopNImpl);

function buildRows(data: AnalyticsResponse): TopRow[] {
  const { columns, rows } = data;
  const dimIdxs = columns
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.type === "string")
    .map(({ i }) => i);
  const valueIdx = columns.findIndex((c) => c.type === "number");
  if (valueIdx < 0) return [];
  return rows
    .map((row) => ({
      label:
        dimIdxs.length === 0
          ? String(row[0] ?? "")
          : dimIdxs.map((i) => String(row[i] ?? "")).join(" / "),
      value: Number(row[valueIdx] ?? 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);
}

function formatValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}
