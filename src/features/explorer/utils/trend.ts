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
 * Aggregates per-severity rows from `POST /logs/trend` into the
 * `ExplorerTrendBucket` shape consumed by `toTrendBuckets`. BE returns one
 * row per (time_bucket × severity_bucket) — the strip wants one row per
 * time_bucket with totals/errors/warnings stacked.
 *
 * Severity bucket convention (mirrors BE `severity_bucket` ingest mapping):
 *   ≥4 → ERROR/FATAL ; 3 → WARN ; everything else → other.
 */
export function aggregateSeverityTrend(
  rows: ReadonlyArray<{ time_bucket: string; severity_bucket: number; count: number }> | undefined
): readonly ExplorerTrendBucket[] {
  if (!rows || rows.length === 0) return [];
  const map = new Map<string, { total: number; errors: number; warnings: number }>();
  for (const r of rows) {
    let agg = map.get(r.time_bucket);
    if (!agg) {
      agg = { total: 0, errors: 0, warnings: 0 };
      map.set(r.time_bucket, agg);
    }
    agg.total += r.count;
    if (r.severity_bucket >= 4) agg.errors += r.count;
    else if (r.severity_bucket === 3) agg.warnings += r.count;
  }
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([time_bucket, agg]) => ({ time_bucket, ...agg }));
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
  const iso = s.includes("T") ? s : s.replace(" ", "T");
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}
