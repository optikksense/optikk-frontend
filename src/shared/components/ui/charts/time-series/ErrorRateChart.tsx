import { memo, useMemo } from "react";

import { APP_COLORS } from "@config/colorLiterals";
import { firstValue, tsMs } from "@shared/utils/chartDataUtils";
import { getChartColor } from "@shared/utils/charting";

import ObservabilityChart, { type ObservabilityChartSeries } from "../ObservabilityChart";

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
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;

  const { timestamps, chartData } = useMemo(() => {
    let activeTimestamps: number[] = [];
    let seriesList: ObservabilityChartSeries[] = [];

    if (hasServiceData) {
      const activeEntries = Object.entries(serviceTimeseriesMap)
        .filter(([key]) => selectedEndpoints.length === 0 || selectedEndpoints.includes(key))
        .slice(0, 10);

      const firstSvc = activeEntries[0]?.[1] ?? [];
      activeTimestamps = firstSvc
        .map((row) => tsMs(firstValue(row, ["timestamp", "timeBucket"], "")) / 1000)
        .filter((t) => !Number.isNaN(t));

      seriesList = activeEntries.map(([svcName, rows], idx) => {
        const values = rows.map((row) => {
          const total = Number(firstValue(row, ["requestCount", "reqCount"], 0));
          const errors = Number(firstValue(row, ["errorCount"], 0));
          return total === 0 ? 0 : (errors / total) * 100;
        });
        return { label: svcName, values, color: getChartColor(idx), fill: false };
      });
    } else {
      activeTimestamps = data
        .map((d) => tsMs(firstValue(d, ["timestamp", "timeBucket"], "")) / 1000)
        .filter((t) => !Number.isNaN(t));
      seriesList = [
        {
          label: datasetLabel,
          values: data.map((d) => Number(firstValue(d, ["value", "errorRate"], 0))),
          color,
          fill: true,
        },
      ];
    }

    if (targetThreshold !== null) {
      const formattedLimit = Number.isInteger(Number(targetThreshold))
        ? targetThreshold
        : Number(targetThreshold)
            .toFixed(2)
            .replace(/\.?0+$/, "");
      seriesList.push({
        label: `Limit (${formattedLimit}%)`,
        values: activeTimestamps.map(() => targetThreshold),
        color: APP_COLORS.hex_f79009,
        fill: false,
        dash: [5, 5],
        showInTooltip: false,
      });
    }

    seriesList.push({
      label: "100% Error",
      values: activeTimestamps.map(() => 100),
      color: APP_COLORS.rgba_240_68_56_0p5,
      fill: false,
      dash: [5, 5],
      showInTooltip: false,
    });

    return { timestamps: activeTimestamps, chartData: seriesList };
  }, [
    data,
    selectedEndpoints,
    serviceTimeseriesMap,
    hasServiceData,
    targetThreshold,
    datasetLabel,
    color,
  ]);

  const maxDataVal = useMemo(() => {
    let max = 0;
    chartData.forEach((s) => {
      s.values.forEach((v) => {
        const numVal = Number(v) || 0;
        if (numVal > max) max = numVal;
      });
    });
    return Math.max(max, targetThreshold || 0, 0);
  }, [chartData, targetThreshold]);

  const yAxisMax = Math.min(Math.max(Math.ceil(maxDataVal * 1.2), 1), 100);
  const effectiveYMax =
    targetThreshold && targetThreshold > yAxisMax ? Math.min(targetThreshold * 1.2, 100) : yAxisMax;

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
        yMax={effectiveYMax}
        yFormatter={(value) => (Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`)}
        height={height}
        fillHeight={fillHeight}
      />
    </div>
  );
});
