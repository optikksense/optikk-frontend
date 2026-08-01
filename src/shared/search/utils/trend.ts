import type { TrendBucket } from "../components/trend/TrendHistogramStrip";
import type { ExplorerTrendBucket } from "../types/queries";

/**
 * Converts the backend ExplorerTrendBucket shape into the
 * TrendHistogramStrip's neutral {ts, counts} shape.
 */
export function toTrendBuckets(
  backend: readonly ExplorerTrendBucket[] | undefined
): readonly TrendBucket[] {
  if (!backend || backend.length === 0) return [];
  return backend.map((bucket) => ({
    ts: bucket.timeBucketMs,
    counts: {
      total: bucket.total,
      errors: bucket.errors,
    },
  }));
}
