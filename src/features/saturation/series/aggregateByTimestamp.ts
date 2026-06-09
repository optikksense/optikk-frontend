/**
 * Shared time-series aggregation for saturation panels.
 *
 * Most saturation panel endpoints return one row per (timestamp, label) pair.
 * Charts here render a single cluster-wide line, so rows are folded onto a
 * sorted, unix-second timeline by summing values that share a timestamp.
 */

export interface AggregatedSeries {
  readonly timestamps: number[];
  readonly values: number[];
}

function toUnixSeconds(timestamp: string): number {
  return Math.floor(new Date(timestamp).getTime() / 1000);
}

/** Sum `getValue(row)` across all rows sharing a timestamp, returning a sorted timeline. */
export function sumByTimestamp<TRow>(
  rows: readonly TRow[],
  timestampOf: (row: TRow) => string,
  getValue: (row: TRow) => number | null | undefined
): AggregatedSeries {
  const map = new Map<number, number>();
  for (const row of rows) {
    const ts = toUnixSeconds(timestampOf(row));
    if (!Number.isFinite(ts)) continue;
    map.set(ts, (map.get(ts) ?? 0) + (getValue(row) ?? 0));
  }
  const timestamps = Array.from(map.keys()).sort((a, b) => a - b);
  return { timestamps, values: timestamps.map((t) => map.get(t) ?? 0) };
}
