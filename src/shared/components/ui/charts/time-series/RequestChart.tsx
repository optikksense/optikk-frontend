import { memo, useMemo } from "react";

import { extractTimeseries } from "@shared/utils/chartDataUtils";
import { getChartColor } from "@shared/utils/charting";

import ObservabilityChart from "../ObservabilityChart";

interface ChartRow {
  [key: string]: unknown;
}

interface RequestChartEndpoint {
  key?: string;
  endpoint?: string;
  seriesKey?: string;
  serviceName?: string;
  httpMethod?: string;
  operationName?: string;
  endpointName?: string;
}

interface RequestChartProps {
  data?: ChartRow[];
  endpoints?: RequestChartEndpoint[];
  selectedEndpoints?: string[];
  serviceTimeseriesMap?: Record<string, ChartRow[]>;
  height?: number;
  fillHeight?: boolean;
  datasetLabel?: string;
  color?: string;
  valueKey?: string;
  yFormatter?: (value: number) => string;
  legend?: boolean;
}

function formatAxisValue(value: number | string) {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}K`;
  if (abs >= 10) return n.toFixed(0);
  if (abs >= 1) return n.toFixed(1);
  if (abs >= 0.1) return n.toFixed(2);
  if (abs > 0) return n.toFixed(3);
  return "0";
}

export default memo(function RequestChart({
  data = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  height = 280,
  fillHeight = false,
  datasetLabel = "Requests/min",
  color = getChartColor(0),
  valueKey = "requestCount",
  yFormatter,
  legend = false,
}: RequestChartProps) {
  const { timestamps, chartData } = useMemo(
    () =>
      extractTimeseries(
        data,
        serviceTimeseriesMap,
        selectedEndpoints,
        [valueKey, "requestCount", "value"],
        datasetLabel,
        color
      ),
    [data, serviceTimeseriesMap, selectedEndpoints, valueKey, datasetLabel, color]
  );

  if (timestamps.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <div style={{ color: "var(--text-muted)" }}>No request data in selected time range</div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0">
      <ObservabilityChart
        timestamps={timestamps}
        series={chartData}
        yMin={0}
        yFormatter={yFormatter || formatAxisValue}
        height={height}
        fillHeight={fillHeight}
        legend={legend}
      />
    </div>
  );
});
