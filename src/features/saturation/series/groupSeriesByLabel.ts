import { CHART_COLORS } from "@config/constants";
import type { ObservabilityChartSeries } from "@shared/components/ui/charts/ObservabilityChart";

/**
 * Pivots long-format rows ({ time_bucket, group_by, value }) into a shared
 * timeline plus one chart series per distinct `group_by` label. The top labels
 * by peak value are kept; the rest are dropped to keep panels legible.
 */

export interface GroupedSeriesResult {
  readonly timestamps: number[];
  readonly series: ObservabilityChartSeries[];
}

interface LongRow {
  readonly timeBucket: string;
  readonly label: string;
  readonly value: number | null;
}

function toUnixSeconds(timestamp: string): number {
  return Math.floor(new Date(timestamp).getTime() / 1000);
}

export function groupSeriesByLabel(rows: readonly LongRow[], maxSeries = 6): GroupedSeriesResult {
  const byLabel = new Map<string, Map<number, number>>();
  const allTimestamps = new Set<number>();
  const peak = new Map<string, number>();

  for (const row of rows) {
    const ts = toUnixSeconds(row.timeBucket);
    if (!Number.isFinite(ts)) continue;
    const value = row.value ?? 0;
    allTimestamps.add(ts);
    const points = byLabel.get(row.label) ?? new Map<number, number>();
    points.set(ts, value);
    byLabel.set(row.label, points);
    peak.set(row.label, Math.max(peak.get(row.label) ?? 0, value));
  }

  const timestamps = Array.from(allTimestamps).sort((a, b) => a - b);
  const labels = Array.from(byLabel.keys())
    .sort((a, b) => (peak.get(b) ?? 0) - (peak.get(a) ?? 0))
    .slice(0, maxSeries);

  const series: ObservabilityChartSeries[] = labels.map((label, idx) => {
    const points = byLabel.get(label)!;
    return {
      label: label || "unknown",
      values: timestamps.map((t) => points.get(t) ?? null),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    };
  });

  return { timestamps, series };
}
