import type { TrendBucket } from "../components/trend/TrendHistogramStrip";
import type { ExplorerTrendBucket } from "../types/queries";

/**
 * Converts the backend ExplorerTrendBucket shape into the
 * TrendHistogramStrip's neutral {ts, counts} shape. Parses RFC-ish
 * timeBucket strings into epoch ms; falls back to sequential ordering
 * when the string is malformed so the chart still renders.
 */
export function toTrendBuckets(
  backend: readonly ExplorerTrendBucket[] | undefined
): readonly TrendBucket[] {
  if (!backend || backend.length === 0) return [];
  return backend.map((bucket, idx) => ({
    ts: parseMs(bucket.timeBucket) ?? idx,
    counts: {
      total: bucket.total,
      errors: bucket.errors,
    },
  }));
}

function parseMs(s: string): number | null {
  let iso = s.includes("T") ? s : s.replace(" ", "T");
  if (!iso.endsWith("Z")) iso += "Z";
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}
