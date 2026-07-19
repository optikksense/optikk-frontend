import { memo, useMemo } from "react";
import type uPlot from "uplot";

import { cn } from "@shared/lib/utils";

import UPlotChart from "./UPlotChart";
import {
  type ThresholdLine,
  defaultAxes,
  formatUniqueAxisValues,
  thresholdLinesPlugin,
  uBars,
  uLine,
} from "./uplotHelpers";


export interface ObservabilityChartSeries {
  label: string;
  values: Array<number | null>;
  tooltipValues?: Array<number | null>;
  color: string;
  fill?: boolean;
  dash?: number[];
  width?: number;
  showInTooltip?: boolean;
}

interface ObservabilityChartProps {
  timestamps: number[];
  series: ObservabilityChartSeries[];
  type?: "line" | "area" | "bar";
  height?: number;
  fillHeight?: boolean;
  /** Pins the x-axis to the selected window (epoch-seconds), independent of data extent. */
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  yAxisSize?: number;
  yFormatter?: (value: number) => string;
  xFormatter?: (timestampSeconds: number) => string;
  legend?: boolean;
  className?: string;
  plugins?: uPlot.Plugin[];
  /** Horizontal reference lines (e.g. monitor warn/alert thresholds). */
  thresholds?: ThresholdLine[];
  onTimeBrush?: (startMs: number, endMs: number) => void;
}

function ObservabilityChart({
  timestamps,
  series,
  type = "line",
  height = 280,
  fillHeight = false,
  xMin,
  xMax,
  yMin,
  yMax,
  yAxisSize = 60,
  yFormatter,
  xFormatter,
  legend = false,
  className,
  plugins,
  thresholds,
  onTimeBrush,
}: ObservabilityChartProps) {
  const hasCustomXRange = xMin != null || xMax != null;
  const xRange = useMemo<[number, number] | undefined>(() => {
    if (!hasCustomXRange) return undefined;
    const first = timestamps[0] ?? 0;
    const last = timestamps[timestamps.length - 1] ?? 1;
    return [xMin ?? first, xMax ?? (last > first ? last : first + 1)];
  }, [xMin, xMax, hasCustomXRange, timestamps]);

  const allPlugins = useMemo<uPlot.Plugin[]>(() => {
    const list = plugins ? [...plugins] : [];
    if (thresholds && thresholds.length > 0) list.push(thresholdLinesPlugin(thresholds));
    return list;
  }, [plugins, thresholds]);
  const alignedData = useMemo<uPlot.AlignedData>(
    () => [timestamps, ...series.map((item) => item.values)] as uPlot.AlignedData,
    [timestamps, series]
  );

  const options = useMemo<Omit<uPlot.Options, "width" | "height">>(() => {
    const axes = defaultAxes({ yAxisSize });
    axes[1] = {
      ...axes[1],
      values: (_u: uPlot, vals: number[]) => formatUniqueAxisValues(vals, yFormatter),
    };


    return {
      padding: [10, 12, 4, 0],
      legend: { show: legend },
      axes,
      scales: {
        x: {
          time: true,
          ...(xRange ? { range: xRange } : {}),
        },
        y: {
          ...(yMin != null ? { min: yMin } : {}),
          ...(yMax != null ? { max: yMax } : {}),
        },
      },
      series: [
        {},
        ...series.map((item) => {
          if (type === "bar") {
            return uBars(item.label, item.color);
          }
          return uLine(item.label, item.color, {
            fill: type === "area" || item.fill,
            dash: item.dash,
            width: item.width ?? 2,
          });
        }),
      ],
      ...(allPlugins.length > 0 ? { plugins: allPlugins } : {}),
    };
  }, [
    legend,
    series,
    yAxisSize,
    yFormatter,
    xRange,
    yMin,
    yMax,
    type,
    allPlugins,
  ]);

  const tooltipContent = useMemo(() => {
    const defaultXFormatter = (timestampSeconds: number) =>
      new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(timestampSeconds * 1000));

    const valueFormatter = (value: number | null) => {
      if (value == null || Number.isNaN(value)) return "—";
      return yFormatter ? yFormatter(value) : value.toLocaleString();
    };

    return ({ idx }: { u: uPlot; idx: number; data: uPlot.AlignedData }) => {
      const timestampSeconds = timestamps[idx];
      if (timestampSeconds == null) {
        return null;
      }

      const rows = series
        .filter((item) => item.showInTooltip !== false)
        .map((item, seriesIndex) => ({
          label: item.label,
          value: valueFormatter(
            (item.tooltipValues ? item.tooltipValues[idx] : item.values[idx]) ?? null
          ),
          color: item.color,
          order: seriesIndex,
        }))
        .filter((item) => item.value !== "—");

      if (rows.length === 0) {
        return null;
      }

      return {
        title: (xFormatter ?? defaultXFormatter)(timestampSeconds),
        rows: rows.map(({ order: _order, ...row }) => row),
      };
    };
  }, [timestamps, series, yFormatter, xFormatter]);

  return (
    <div className={cn("h-full min-h-0", className)}>
      <UPlotChart
        options={options}
        data={alignedData}
        height={height}
        fillHeight={fillHeight}
        tooltipContent={tooltipContent}
        onTimeBrush={onTimeBrush}
      />
    </div>
  );
}

export default memo(ObservabilityChart);
