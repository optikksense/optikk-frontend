import { memo, useMemo } from "react";

import { APP_COLORS } from "@config/colorLiterals";
import { extractTimeseries, firstValue } from "@shared/utils/chartDataUtils";

import ObservabilityChart from "../ObservabilityChart";

type ChartRow = Record<string, unknown>;

interface ErrorRateChartProps {
  data?: ChartRow[];
  selectedEndpoints?: string[];
  serviceTimeseriesMap?: Record<string, ChartRow[]>;
  height?: number;
  fillHeight?: boolean;
  targetThreshold?: number | null;
  datasetLabel?: string;
  color?: string;
}

export default memo(function ErrorRateChart({
  data = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  height = 280,
  fillHeight = false,
  targetThreshold = null,
  datasetLabel = "Error Rate %",
  color = APP_COLORS.hex_f04438,
}: ErrorRateChartProps) {
  const { timestamps, chartData } = useMemo(() => {
    const { timestamps, chartData: seriesList } = extractTimeseries(
      data,
      serviceTimeseriesMap,
      selectedEndpoints,
      ["value", "errorRate"],
      datasetLabel,
      color,
      true,
      (row) => {
        const total = Number(firstValue(row, ["requestCount", "reqCount"], 0));
        const errors = Number(firstValue(row, ["errorCount"], 0));
        return total === 0 ? 0 : (errors / total) * 100;
      }
    );

    if (targetThreshold !== null) {
      const formattedLimit = Number.isInteger(Number(targetThreshold))
        ? targetThreshold
        : Number(targetThreshold)
            .toFixed(2)
            .replace(/\.?0+$/, "");
      seriesList.push({
        label: `Limit (${formattedLimit}%)`,
        values: timestamps.map(() => targetThreshold),
        color: APP_COLORS.hex_f79009,
        fill: false,
        dash: [5, 5],
        showInTooltip: false,
      });
    }

    seriesList.push({
      label: "100% Error",
      values: timestamps.map(() => 100),
      color: APP_COLORS.rgba_240_68_56_0p5,
      fill: false,
      dash: [5, 5],
      showInTooltip: false,
    });

    return { timestamps, chartData: seriesList };
  }, [data, selectedEndpoints, serviceTimeseriesMap, targetThreshold, datasetLabel, color]);

  if (timestamps.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <div style={{ color: "var(--text-muted)" }}>No error data in selected time range</div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0">
      <ObservabilityChart
        timestamps={timestamps}
        series={chartData}
        yMin={0}
        yFormatter={(value) => (Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`)}
        height={height}
        fillHeight={fillHeight}
      />
    </div>
  );
});
