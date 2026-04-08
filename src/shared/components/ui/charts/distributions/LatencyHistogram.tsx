import { useMemo } from "react";

import { APP_COLORS } from "@config/colorLiterals";

import UPlotChart, { uBars } from "../UPlotChart";

const BUCKETS = [
  { label: "0-50ms", max: 50, color: APP_COLORS.hex_73c991 },
  { label: "50-100ms", max: 100, color: APP_COLORS.hex_73c991 },
  { label: "100-250ms", max: 250, color: APP_COLORS.hex_06aed5 },
  { label: "250-500ms", max: 500, color: APP_COLORS.hex_f79009 },
  { label: "500ms-1s", max: 1000, color: APP_COLORS.hex_f79009 },
  { label: "1s-5s", max: 5000, color: APP_COLORS.hex_f04438 },
  { label: "5s+", max: Number.POSITIVE_INFINITY, color: APP_COLORS.hex_f04438 },
];

interface LatencyHistogramTrace {
  durationMs?: number;
  duration_ms?: number;
}

interface LatencyHistogramProps {
  traces?: LatencyHistogramTrace[];
  height?: number;
  fillHeight?: boolean;
}

function bucketize(traces: LatencyHistogramTrace[]): number[] {
  const counts = BUCKETS.map(() => 0);
  for (const trace of traces) {
    const duration = trace.durationMs || trace.duration_ms || 0;
    for (let i = 0; i < BUCKETS.length; i++) {
      if (duration <= BUCKETS[i].max) {
        counts[i]++;
        break;
      }
    }
  }
  return counts;
}

/**
 *
 * @param props Component props.
 * @returns Histogram chart for trace latency buckets.
 */
export default function LatencyHistogram({
  traces = [],
  height = 180,
  fillHeight = false,
}: LatencyHistogramProps): JSX.Element | null {
  const counts = bucketize(traces);
  const hasData = counts.some((count) => count > 0);

  const uplotData = useMemo<uPlot.AlignedData>(() => [BUCKETS.map((_, i) => i), counts], [counts]);

  const opts = useMemo<Omit<uPlot.Options, "width" | "height">>(
    () => ({
      axes: [
        {
          stroke: APP_COLORS.hex_666,
          grid: { show: false },
          ticks: { show: false },
          font: "10px inherit",
          values: (_u: uPlot, splits: number[]) =>
            splits.map((i) => BUCKETS[Math.round(i)]?.label ?? ""),
        },
        {
          stroke: APP_COLORS.hex_666,
          grid: { stroke: "rgba(255,255,255,0.05)", width: 1 },
          ticks: { show: false },
          font: "10px inherit",
          size: 40,
        },
      ],
      cursor: { show: false },
      legend: { show: false },
      scales: { x: { range: (_u, min, max) => [min - 0.5, max + 0.5] as [number, number] } },
      series: [{}, uBars("Traces", APP_COLORS.hex_06aed5)],
    }),
    []
  );

  if (!hasData) return null;

  return (
    <div
      className={fillHeight ? "h-full min-h-0" : undefined}
      style={fillHeight ? undefined : { height }}
    >
      <UPlotChart options={opts} data={uplotData} height={height} fillHeight={fillHeight} />
    </div>
  );
}
