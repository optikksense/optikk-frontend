import { memo, useMemo, useRef } from "react";
import type uPlot from "uplot";

import { cn } from "@shared/lib/utils";

import UPlotChart from "./UPlotChart";
import type { ChartMarker } from "./chartMarkers";
import {
  type ObservabilityChartSeries,
  buildChartOptions,
  buildTooltipFactory,
} from "./observabilityChartBuilders";
import { type ThresholdLine, thresholdLinesPlugin } from "./uplotHelpers";

export type { ObservabilityChartSeries } from "./observabilityChartBuilders";

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
  markers?: readonly ChartMarker[];
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
  yAxisSize = 44,
  yFormatter,
  xFormatter,
  legend = false,
  className,
  plugins,
  thresholds,
  markers,
  onTimeBrush,
  isLoading = false,
}: ObservabilityChartProps) {
  // Keep display-only inputs live without rebuilding uPlot for inline formatters.
  const yFormatterRef = useRef(yFormatter);
  yFormatterRef.current = yFormatter;
  const xFormatterRef = useRef(xFormatter);
  xFormatterRef.current = xFormatter;
  const timestampsRef = useRef(timestamps);
  timestampsRef.current = timestamps;
  const seriesRef = useRef(series);
  seriesRef.current = series;
  const onTimeBrushRef = useRef(onTimeBrush);
  onTimeBrushRef.current = onTimeBrush;

  const hasBrush = onTimeBrush != null;
  const handleTimeBrush = useMemo(
    () =>
      hasBrush
        ? (startMs: number, endMs: number) => onTimeBrushRef.current?.(startMs, endMs)
        : undefined,
    [hasBrush]
  );

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

  const seriesKey = useMemo(
    () =>
      series
        .map(
          (s) =>
            `${s.label}:${s.color}:${s.fill ? 1 : 0}:${s.dash?.join(",") ?? ""}:${s.width ?? ""}:${s.scale ?? ""}`
        )
        .join("|"),
    [series]
  );
  const structuralSeries = useMemo(() => (seriesKey === "" ? [] : seriesRef.current), [seriesKey]);

  const options = useMemo<Omit<uPlot.Options, "width" | "height">>(() => {
    return buildChartOptions({
      series: structuralSeries,
      type,
      xRange,
      yMin,
      yMax,
      yAxisSize,
      legend,
      plugins: allPlugins,
      yFormatter: yFormatterRef,
    });
  }, [legend, structuralSeries, yAxisSize, xRange, yMin, yMax, type, allPlugins]);

  // Stable identity: reads live data/formatters via refs so it never changes
  // reference. uPlot invokes it on cursor move against the latest drawn data.
  const tooltipContent = useMemo(() => {
    return buildTooltipFactory({
      timestamps: timestampsRef,
      series: seriesRef,
      xFormatter: xFormatterRef,
      yFormatter: yFormatterRef,
    });
  }, []);

  return (
    <div className={cn("relative h-full min-h-0", className)}>
      <UPlotChart
        options={options}
        data={alignedData}
        height={height}
        fillHeight={fillHeight}
        tooltipContent={tooltipContent}
        onTimeBrush={handleTimeBrush}
        markers={markers}
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
