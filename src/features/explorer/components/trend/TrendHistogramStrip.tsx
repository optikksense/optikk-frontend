import { memo, useMemo } from "react";
import uPlot from "uplot";

import { useTimezone } from "@/app/store/appStore";
import UPlotChart, { defaultAxes } from "@shared/components/ui/charts/UPlotChart";

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
  readonly minTimeMs?: number;
  readonly maxTimeMs?: number;
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
      width: 2,
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
  const {
    buckets,
    series,
    height = 160,
    zoomed,
    onTimeRangeChange,
    onResetZoom,
    minTimeMs,
    maxTimeMs,
  } = props;
  const tz = useTimezone();
  const data = useMemo(() => toAlignedData(buckets, series), [buckets, series]);
  const options = useMemo<Omit<uPlot.Options, "width" | "height">>(() => {
    const axes = defaultAxes();
    // Add compact y-axis formatter (e.g. 40k instead of 40000)
    axes[1] = {
      ...axes[1],
      values: (_u: uPlot, vals: number[]) =>
        vals.map((v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))),
    };
    return {
      series: toSeriesOptions(series),
      legend: { show: false },
      cursor: { drag: { x: true, y: false } },
      scales: {
        x: {
          time: true,
          auto: false,
          range: (_u, dataMin, dataMax) => [
            minTimeMs ? Math.floor(minTimeMs / 1000) : dataMin,
            maxTimeMs ? Math.floor(maxTimeMs / 1000) : dataMax,
          ],
        },
      },
      axes,
      tzDate:
        tz && tz !== "local" ? (ts: number) => uPlot.tzDate(new Date(ts * 1000), tz) : undefined,
    };
  }, [series, tz]);
  return (
    <div className="flex flex-col border-[var(--border-color)] border-b bg-[var(--bg-primary)]">
      {/* Title bar with legend positioned top-right */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="font-semibold text-[13px] text-[var(--text-primary)]">
          Log Volume Over Time
        </span>
        <TrendLegend items={series} zoomed={zoomed} onResetZoom={onResetZoom} />
      </div>
      <UPlotChart options={options} data={data} height={height} onTimeBrush={onTimeRangeChange} />
    </div>
  );
}

export const TrendHistogramStrip = memo(TrendHistogramStripComponent);
