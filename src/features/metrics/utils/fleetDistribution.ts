import type { LatencyHeatmapDataPoint } from "@shared/components/ui/charts/specialized/LatencyHeatmapChart";

import type { MetricQueryResult } from "@shared/metrics/types";

/** A latency band: hosts whose value falls in [min, max) land in this band. */
interface LatencyBand {
  readonly label: string;
  readonly min: number;
  readonly max: number;
}

const FLEET_LATENCY_BANDS: readonly LatencyBand[] = [
  { label: "≤ 50ms", min: 0, max: 50 },
  { label: "50–100", min: 50, max: 100 },
  { label: "100–150", min: 100, max: 150 },
  { label: "150–200", min: 150, max: 200 },
  { label: "200–250", min: 200, max: 250 },
  { label: "250–300", min: 250, max: 300 },
  { label: "300–400", min: 300, max: 400 },
  { label: "≥ 400ms", min: 400, max: Number.POSITIVE_INFINITY },
];

function bandFor(value: number): LatencyBand | undefined {
  return FLEET_LATENCY_BANDS.find((b) => value >= b.min && value < b.max);
}

export function buildFleetDistribution(result: MetricQueryResult | undefined): {
  readonly points: LatencyHeatmapDataPoint[];
  readonly bandLabels: string[];
} {
  const bandLabels = FLEET_LATENCY_BANDS.map((b) => b.label);
  if (!result || result.series.length === 0) {
    return { points: [], bandLabels };
  }

  const points: LatencyHeatmapDataPoint[] = [];
  result.timestamps.forEach((ts, i) => {
    const counts = new Map<string, number>();
    for (const series of result.series) {
      const value = series.values[i];
      if (value == null || Number.isNaN(value)) continue;
      const band = bandFor(value);
      if (!band) continue;
      counts.set(band.label, (counts.get(band.label) ?? 0) + 1);
    }
    for (const band of FLEET_LATENCY_BANDS) {
      points.push({
        time_bucket: ts * 1000,
        latency_bucket: band.label,
        span_count: counts.get(band.label) ?? 0,
      });
    }
  });

  return { points, bandLabels };
}
