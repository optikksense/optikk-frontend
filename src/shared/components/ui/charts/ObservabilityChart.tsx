import { useMemo } from "react";
import type uPlot from "uplot";

import { cn } from "@/lib/utils";

import UPlotChart, { defaultAxes, uLine, uBars } from "./UPlotChart";

export interface ObservabilityChartSeries {
  label: string;
  values: Array<number | null>;
  color: string;
  fill?: boolean;
  dash?: number[];
  width?: number;
  showInTooltip?: boolean;
}

export interface ObservabilityChartProps {
  timestamps: number[];
  series: ObservabilityChartSeries[];
  type?: "line" | "area" | "bar";
  height?: number;
  fillHeight?: boolean;
  yMin?: number;
  yMax?: number;
  yAxisSize?: number;
  yFormatter?: (value: number) => string;
  xFormatter?: (timestampSeconds: number) => string;
  legend?: boolean;
  className?: string;
}

export default function ObservabilityChart({
  timestamps,
  series,
  type = "line",
  height = 280,
  fillHeight = false,
  yMin,
  yMax,
  yAxisSize = 60,
  yFormatter,
  xFormatter,
  legend = false,
  className,
}: ObservabilityChartProps) {
  const alignedData = useMemo<uPlot.AlignedData>(
    () => [timestamps, ...series.map((item) => item.values)] as uPlot.AlignedData,
    [timestamps, series]
  );

  const options = useMemo<Omit<uPlot.Options, "width" | "height">>(() => {
    const axes = defaultAxes({ yAxisSize });
    axes[1] = {
      ...axes[1],
      values: yFormatter
        ? (_u: uPlot, vals: number[]) => vals.map((value) => yFormatter(value))
        : axes[1].values,
    };

    return {
      padding: [10, 12, 4, 0],
      legend: { show: legend },
      axes,
      scales: {
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
            width: item.width ?? 1.85,
          });
        }),
      ],
    };
  }, [legend, series, yAxisSize, yFormatter, yMin, yMax, type]);

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
          value: valueFormatter(item.values[idx] ?? null),
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
      />
    </div>
  );
}
