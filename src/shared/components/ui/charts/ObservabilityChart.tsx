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

import { resolveThemeColor } from "@shared/utils/chartTheme";

export interface ObservabilityChartSeries {
  label: string;
  values: Array<number | null>;
  tooltipValues?: Array<number | null>;
  color: string;
  fill?: boolean;
  dash?: number[];
  width?: number;
  showInTooltip?: boolean;
  scale?: string;
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
  isLoading?: boolean;
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
  isLoading = false,
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

    const scales: uPlot.Scales = {
      x: {
        time: true,
        ...(xRange ? { range: xRange } : {}),
      },
      y: {
        ...(yMin != null ? { min: yMin } : {}),
        ...(yMax != null ? { max: yMax } : {}),
      },
    };

    const labelColor = resolveThemeColor("--chart-axis", "#b9c0cf");
    const font = "11px Inter, sans-serif";

    for (const item of series) {
      if (item.scale && item.scale !== "y" && item.scale !== "x" && !scales[item.scale]) {
        scales[item.scale] = { min: 0 };
        axes.push({
          scale: item.scale,
          side: 1,
          stroke: resolveThemeColor(item.color, labelColor),
          grid: { show: false },
          ticks: { show: false },
          font,
          size: yAxisSize,
          gap: 8,
          values: (_u, vals) => formatUniqueAxisValues(vals, yFormatter),
        });
      }
    }

    return {
      padding: [10, 16, 6, 12],
      legend: { show: legend },
      axes,
      scales,
      series: [
        {},
        ...series.map((item) => {
          const s =
            type === "bar"
              ? uBars(item.label, item.color)
              : uLine(item.label, item.color, {
                  fill: type === "area" || item.fill,
                  dash: item.dash,
                  width: item.width ?? 2,
                });
          if (item.scale) {
            s.scale = item.scale;
          }
          return s;
        }),
      ],
      ...(allPlugins.length > 0 ? { plugins: allPlugins } : {}),
    };
  }, [legend, series, yAxisSize, yFormatter, xRange, yMin, yMax, type, allPlugins]);

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
    <div className={cn("relative h-full min-h-0", className)}>
      <UPlotChart
        options={options}
        data={alignedData}
        height={height}
        fillHeight={fillHeight}
        tooltipContent={tooltipContent}
        onTimeBrush={onTimeBrush}
      />
      {isLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : null}
    </div>
  );
}

export default memo(ObservabilityChart);
