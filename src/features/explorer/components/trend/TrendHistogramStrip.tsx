import { memo, useMemo } from "react";
import type uPlot from "uplot";

import UPlotChart from "@shared/components/ui/charts/UPlotChart";

import { TrendLegend, type TrendLegendItem } from "./TrendLegend";

export interface TrendBucket {
  readonly ts: number;
  readonly counts: Readonly<Record<string, number>>;
}

interface Props {
  readonly buckets: readonly TrendBucket[];
  readonly series: readonly TrendLegendItem[];
  readonly height?: number;
  readonly zoomed?: boolean;
  readonly onTimeRangeChange?: (fromMs: number, toMs: number) => void;
  readonly onResetZoom?: () => void;
}

function toAlignedData(
  buckets: readonly TrendBucket[],
  series: readonly TrendLegendItem[]
): uPlot.AlignedData {
  const xs = buckets.map((bucket) => Math.floor(bucket.ts / 1000));
  const ys = series.map((entry) => buckets.map((bucket) => bucket.counts[entry.key] ?? 0));
  return [xs, ...ys];
}

function toSeriesOptions(series: readonly TrendLegendItem[]): uPlot.Series[] {
  return [
    { label: "time" } satisfies uPlot.Series,
    ...series.map<uPlot.Series>((entry) => ({
      label: entry.label,
      stroke: entry.color,
      fill: `${entry.color}55`,
      width: 1,
      points: { show: false },
    })),
  ];
}

/**
 * Trend histogram pinned above the result list. Brush-to-zoom emits
 * onTimeRangeChange in ms. Severity/status coloring is decided by the caller
 * via the `series` prop.
 */
function TrendHistogramStripComponent(props: Props) {
  const { buckets, series, height = 120, zoomed, onTimeRangeChange, onResetZoom } = props;
  const data = useMemo(() => toAlignedData(buckets, series), [buckets, series]);
  const options = useMemo<Omit<uPlot.Options, "width" | "height">>(
    () => ({
      series: toSeriesOptions(series),
      legend: { show: false },
      cursor: { drag: { x: true, y: false } },
      scales: { x: { time: true } },
      axes: [
        { stroke: "var(--text-muted)" },
        { stroke: "var(--text-muted)" },
      ],
    }),
    [series]
  );
  return (
    <div className="flex flex-col border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
      <UPlotChart
        options={options}
        data={data}
        height={height}
        onTimeBrush={onTimeRangeChange}
      />
      <TrendLegend items={series} zoomed={zoomed} onResetZoom={onResetZoom} />
    </div>
  );
}

export const TrendHistogramStrip = memo(TrendHistogramStripComponent);
