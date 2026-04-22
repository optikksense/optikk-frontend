import { memo, useMemo } from "react";

import DonutChart, { type DonutChartSegment } from "@shared/components/ui/charts/micro/DonutChart";

import type { AnalyticsResponse } from "../../types/analytics";

const PIE_PALETTE = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
  "#6366f1",
  "#84cc16",
  "#f97316",
];

interface Props {
  readonly data: AnalyticsResponse;
  readonly size?: number;
}

/**
 * Wraps the shared DonutChart leaf. Rows are pivoted into segments keyed on
 * the first string column (group-by dim) with the first numeric column as
 * the segment value. Empty / zero values are filtered by the underlying
 * DonutChart so we just pass them straight through.
 */
function AnalyticsPieImpl({ data, size = 220 }: Props) {
  const segments = useMemo(() => buildSegments(data), [data]);
  if (segments.length === 0) {
    return <div className="p-6 text-sm text-[var(--text-secondary)]">No data</div>;
  }
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  return (
    <div className="flex items-center justify-center gap-6 p-4">
      <DonutChart segments={segments} size={size} centerLabel="Total" centerValue={formatTotal(total)} />
      <ul className="flex flex-col gap-1.5 text-sm">
        {segments.slice(0, 10).map((segment) => (
          <li key={segment.label} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: segment.color }} />
            <span className="truncate text-[var(--text-primary)]" title={segment.label}>
              {segment.label}
            </span>
            <span className="ml-auto font-mono text-xs text-[var(--text-secondary)]">
              {formatTotal(segment.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const AnalyticsPie = memo(AnalyticsPieImpl);

function buildSegments(data: AnalyticsResponse): DonutChartSegment[] {
  const { columns, rows } = data;
  const dimIdx = columns.findIndex((c) => c.type === "string");
  const valueIdx = columns.findIndex((c) => c.type === "number");
  if (valueIdx < 0) return [];
  return rows.slice(0, 10).map((row, i) => ({
    color: PIE_PALETTE[i % PIE_PALETTE.length],
    label: dimIdx >= 0 ? String(row[dimIdx] ?? `Series ${i + 1}`) : `Series ${i + 1}`,
    value: Number(row[valueIdx] ?? 0),
  }));
}

function formatTotal(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(2);
}
