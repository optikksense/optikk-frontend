import type { TrendBucket } from "../components/trend/TrendHistogramStrip";
import type { TrendLegendItem } from "../components/trend/TrendLegend";
import type { ExplorerTrendBucket } from "../types/queries";

/**
 * Converts the backend ExplorerTrendBucket shape into the
 * TrendHistogramStrip's neutral {ts, counts} shape. Parses RFC-ish
 * time_bucket strings into epoch ms; falls back to sequential ordering
 * when the string is malformed so the chart still renders.
 */
export function toTrendBuckets(
  backend: readonly ExplorerTrendBucket[] | undefined
): readonly TrendBucket[] {
  if (!backend || backend.length === 0) return [];
  return backend.map((bucket, idx) => ({
    ts: parseMs(bucket.time_bucket) ?? idx,
    counts: {
      total: bucket.total,
      errors: bucket.errors,
      warnings: bucket.warnings ?? 0,
    },
  }));
}

/**
 * Default severity/status series palette for the trend strip. Ordered so
 * errors render on top (last in AlignedData = topmost z). Callers can pass
 * a subset when a scope only tracks totals + errors (e.g. traces).
 */
export const LOG_TREND_SERIES: readonly TrendLegendItem[] = [
  { key: "total", label: "Total", color: "#8e96a9" },
  { key: "warnings", label: "Warnings", color: "#f2cc0c" },
  { key: "errors", label: "Errors", color: "#f2495c" },
];

export const TRACE_TREND_SERIES: readonly TrendLegendItem[] = [
  { key: "total", label: "Total", color: "#4e9fdd" },
  { key: "errors", label: "Errors", color: "#e8494d" },
];

function parseMs(s: string): number | null {
  let iso = s.includes("T") ? s : s.replace(" ", "T");
  if (!iso.endsWith("Z")) iso += "Z";
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}
