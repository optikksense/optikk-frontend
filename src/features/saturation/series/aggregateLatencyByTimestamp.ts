/**
 * Folds percentile-latency rows (p50/p95/p99 per timestamp+label) onto a single
 * cluster-wide timeline. Percentiles are not additive, so each bucket takes the
 * worst (max) value across labels — matching the database latency-percentile hook.
 */

export interface LatencyPercentileSeries {
  readonly timestamps: number[];
  readonly p50: number[];
  readonly p95: number[];
  readonly p99: number[];
}

export interface LatencyRow {
  readonly p50: number | null | undefined;
  readonly p95: number | null | undefined;
  readonly p99: number | null | undefined;
}

function toUnixSeconds(timestamp: string): number {
  return Math.floor(new Date(timestamp).getTime() / 1000);
}

function maxInto(map: Map<number, number>, key: number, value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return;
  map.set(key, Math.max(map.get(key) ?? 0, value));
}

export function maxLatencyByTimestamp<TRow>(
  rows: readonly TRow[],
  timestampOf: (row: TRow) => string,
  percentilesOf: (row: TRow) => LatencyRow
): LatencyPercentileSeries {
  const p50 = new Map<number, number>();
  const p95 = new Map<number, number>();
  const p99 = new Map<number, number>();
  for (const row of rows) {
    const ts = toUnixSeconds(timestampOf(row));
    if (!Number.isFinite(ts)) continue;
    const p = percentilesOf(row);
    maxInto(p50, ts, p.p50);
    maxInto(p95, ts, p.p95);
    maxInto(p99, ts, p.p99);
  }
  const timestamps = Array.from(
    new Set<number>([...p50.keys(), ...p95.keys(), ...p99.keys()])
  ).sort((a, b) => a - b);
  return {
    timestamps,
    p50: timestamps.map((t) => p50.get(t) ?? 0),
    p95: timestamps.map((t) => p95.get(t) ?? 0),
    p99: timestamps.map((t) => p99.get(t) ?? 0),
  };
}
