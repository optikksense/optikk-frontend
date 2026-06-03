import type { Host } from "@/features/infrastructure/api/hostsApi";

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Flags instances whose error rate or p99 latency is a clear outlier versus the
 * rest of the fleet — purely from the RED metrics already fetched (no extra
 * call). Only meaningful with ≥3 instances; below that we flag nothing.
 */
export function outlierHostIds(hosts: readonly Host[]): ReadonlySet<string> {
  if (hosts.length < 3) return new Set();
  const medErr = median(hosts.map((h) => h.error_rate ?? 0));
  const medP99 = median(hosts.map((h) => h.p99_ms ?? 0));
  const errThreshold = Math.max(medErr * 2, 0.02);
  const p99Threshold = medP99 * 1.75;
  const out = new Set<string>();
  for (const h of hosts) {
    const errRate = h.error_rate ?? 0;
    const p99 = h.p99_ms ?? 0;
    const errOutlier = errRate >= errThreshold && errRate > 0;
    const p99Outlier = medP99 > 0 && p99 >= p99Threshold;
    if (errOutlier || p99Outlier) out.add(h.host);
  }
  return out;
}
