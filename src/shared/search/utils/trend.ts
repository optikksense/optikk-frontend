import type { TrendBucket } from "../components/trend/TrendHistogramStrip";
import type { ExplorerTrendBucket } from "../types/queries";

   
                                                          
                                                                   
                                                                      
                                                           
   
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
