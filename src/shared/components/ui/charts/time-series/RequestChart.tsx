import { memo, useMemo } from "react";

import { firstValue, tsMs } from "@shared/utils/chartDataUtils";
import { getChartColor } from "@shared/utils/charting";

import ObservabilityChart, { type ObservabilityChartSeries } from "../ObservabilityChart";

interface ChartRow {
  [key: string]: unknown;
}

interface RequestChartEndpoint {
  key?: string;
  endpoint?: string;
  seriesKey?: string;
  series_key?: string;
  service_name?: string;
  http_method?: string;
  httpMethod?: string;
  operation_name?: string;
  endpoint_name?: string;
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
  valueKey = "request_count",
  yFormatter,
  legend = false,
}: RequestChartProps) {
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
        .map((row) => tsMs(firstValue(row, ["timestamp", "time_bucket"], "")) / 1000)
        .filter((t) => !Number.isNaN(t));

      seriesList = activeEntries.map(([svcName, rows], idx) => {
        const values = rows.map((row) => {
          return Number(firstValue(row, [valueKey, "request_count", "value"], 0));
        });
        return { label: svcName, values, color: getChartColor(idx), fill: false };
      });
    } else {
      activeTimestamps = data
        .map((d) => tsMs(firstValue(d, ["timestamp", "time_bucket"], "")) / 1000)
        .filter((t) => !Number.isNaN(t));
      seriesList = [
        {
          label: datasetLabel,
          values: data.map((d) => Number(firstValue(d, [valueKey, "request_count", "value"], 0))),
          color,
          fill: true,
        },
      ];
    }

    return { timestamps: activeTimestamps, chartData: seriesList };
  }, [
    data,
    serviceTimeseriesMap,
    hasServiceData,
    selectedEndpoints,
    valueKey,
    datasetLabel,
    color,
  ]);

  const yAxisMax = useMemo(() => {
    let maxVal = 0;
    chartData.forEach((s) => {
      const dsMax = Math.max(...s.values.map((v) => Number(v) || 0), 0);
      if (dsMax > maxVal) maxVal = dsMax;
    });
    if (maxVal <= 0) return 1;
    if (maxVal < 1) return Math.max(Number((maxVal * 1.4).toFixed(3)), 0.05);
    if (maxVal < 10) return Math.max(Number((maxVal * 1.25).toFixed(2)), 1);
    return Math.max(Math.ceil(maxVal * 1.5), 1);
  }, [chartData]);

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
        yMax={yAxisMax}
        yFormatter={yFormatter || formatAxisValue}
        height={height}
        fillHeight={fillHeight}
        legend={legend}
      />
    </div>
  );
});
