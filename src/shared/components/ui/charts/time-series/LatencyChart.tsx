import { memo, useMemo } from "react";

import { APP_COLORS } from "@config/colorLiterals";
import { extractTimeseries, firstValue, tsMs } from "@shared/utils/chartDataUtils";
import { getChartColor } from "@shared/utils/charting";

import ObservabilityChart, { type ObservabilityChartSeries } from "../ObservabilityChart";

interface EndpointData {
  key?: string;
  serviceName?: string;
  service?: string;
  endpoint?: string;
  operationName?: string;
  endpointName?: string;
  httpMethod?: string;
}

interface LatencyDataPoint {
  timestamp?: string;
  timeBucket?: string;
  value?: number;
  avgLatency?: number;
  avgLatencyMs?: number;
  p50?: number;
  p50Latency?: number;
  p95?: number;
  p95Latency?: number;
  p99?: number;
  p99Latency?: number;
  [key: string]: unknown;
}

interface LatencyChartProps {
  data?: LatencyDataPoint[];
  endpoints?: EndpointData[];
  selectedEndpoints?: string[];
  serviceTimeseriesMap?: Record<string, LatencyDataPoint[]>;
  height?: number;
  fillHeight?: boolean;
  targetThreshold?: number | null;
  datasetLabel?: string;
  color?: string;
  valueKey?: string;
}

export default memo(function LatencyChart({
  data = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  height = 280,
  fillHeight = false,
  targetThreshold = null,
  datasetLabel = "Avg Latency (ms)",
  color = getChartColor(0),
  valueKey = "avgLatency",
}: LatencyChartProps) {
  const { timestamps, chartData } = useMemo(() => {
    const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
    let activeTimestamps: number[] = [];
    let seriesList: ObservabilityChartSeries[] = [];

    if (!hasServiceData && data.length > 0 && firstValue(data[0], ["value"], null) === null) {
      activeTimestamps = data
        .map((d) => tsMs(firstValue(d, ["timestamp", "timeBucket"], "")) / 1000)
        .filter((t) => !Number.isNaN(t));
      seriesList = [
        {
          label: "P50",
          values: data.map((d) => Number(firstValue(d, ["p50Ms", "p50", "p50Latency"], 0))),
          color: APP_COLORS.hex_73c991,
          fill: false,
        },
        {
          label: "P95",
          values: data.map((d) => Number(firstValue(d, ["p95Ms", "p95", "p95Latency"], 0))),
          color: APP_COLORS.hex_f79009,
          fill: false,
        },
        {
          label: "P99",
          values: data.map((d) => Number(firstValue(d, ["p99Ms", "p99", "p99Latency"], 0))),
          color: APP_COLORS.hex_f04438,
          fill: false,
        },
      ];
    } else {
      const extracted = extractTimeseries(
        data,
        serviceTimeseriesMap,
        selectedEndpoints,
        ["value", valueKey, "avgLatency", "avgLatencyMs"],
        datasetLabel,
        color
      );
      activeTimestamps = extracted.timestamps;
      seriesList = extracted.chartData;
    }

    if (targetThreshold !== null) {
      seriesList.push({
        label: `Target (${targetThreshold}ms)`,
        values: activeTimestamps.map(() => targetThreshold),
        color: APP_COLORS.hex_f79009,
        fill: false,
        dash: [5, 5],
        showInTooltip: false,
      });
    }

    return { timestamps: activeTimestamps, chartData: seriesList };
  }, [
    data,
    selectedEndpoints,
    serviceTimeseriesMap,
    targetThreshold,
    datasetLabel,
    color,
    valueKey,
  ]);

  if (timestamps.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <div style={{ color: "var(--text-muted)" }}>No latency data in selected time range</div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0">
      <ObservabilityChart
        timestamps={timestamps}
        series={chartData}
        yMin={0}
        yFormatter={(value) => `${value}ms`}
        height={height}
        fillHeight={fillHeight}
      />
    </div>
  );
});
