import { memo, useMemo } from "react";

import { APP_COLORS } from "@config/colorLiterals";
import { CHART_COLORS } from "@config/constants";
import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { firstValue, tsKey, tsMs } from "@shared/utils/chartDataUtils";

import ObservabilityChart from "../ObservabilityChart";

function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

interface EndpointData {
  key?: string;
  service_name?: string;
  serviceName?: string;
  service?: string;
  endpoint?: string;
  operation_name?: string;
  operationName?: string;
  endpoint_name?: string;
  endpointName?: string;
  http_method?: string;
  httpMethod?: string;
}

interface LatencyDataPoint {
  timestamp?: string;
  time_bucket?: string;
  timeBucket?: string;
  value?: number;
  avg_latency?: number;
  avgLatency?: number;
  avg_latency_ms?: number;
  avgLatencyMs?: number;
  p50?: number;
  p50_latency?: number;
  p50Latency?: number;
  p95?: number;
  p95_latency?: number;
  p95Latency?: number;
  p99?: number;
  p99_latency?: number;
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

/**
 *
 * @param root0
 * @param root0.data
 * @param root0.endpoints
 * @param root0.selectedEndpoints
 * @param root0.serviceTimeseriesMap
 * @param root0.targetThreshold
 * @param root0.datasetLabel
 * @param root0.color
 * @param root0.valueKey
 */
export default memo(function LatencyChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  height = 280,
  fillHeight = false,
  targetThreshold = null,
  datasetLabel = "Avg Latency (ms)",
  color = CHART_COLORS[0],
  valueKey = "avg_latency",
}: LatencyChartProps) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets } = useChartTimeBuckets();

  const buildServiceDatasets = (endpointList: EndpointData[]) => {
    const targetMap: Record<string, { label: string }> = {};
    for (const ep of endpointList) {
      const key = ep.key || firstValue(ep, ["service_name", "serviceName", "service"], "");
      const label =
        ep.endpoint || firstValue(ep, ["service_name", "serviceName", "service"], "") || key;
      if (!targetMap[key]) targetMap[key] = { label };
    }
    const stepMs =
      timeBuckets.length >= 2
        ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
        : 60000;

    return Object.entries(targetMap).map(([key, info], idx) => {
      const tsData = serviceTimeseriesMap[key] || [];
      const tsMap: Record<string, number> = {};
      for (const row of tsData) {
        const rowTimestamp = firstValue(row, ["timestamp", "time_bucket", "timeBucket"], "");
        if (!rowTimestamp) continue;
        const rowTime = new Date(rowTimestamp).getTime();
        if (!Number.isFinite(rowTime)) continue;
        const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
        const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

        const latency = Number(
          firstValue(
            row,
            [valueKey, "avg_latency", "avgLatency", "avg_latency_ms", "avgLatencyMs", "value"],
            0
          )
        );
        tsMap[bucketKey] = Math.max(tsMap[bucketKey] || 0, Number.isFinite(latency) ? latency : 0);
      }
      const values = timeBuckets.map((d) => tsMap[tsKey(d)] ?? 0);
      return { label: info.label, values, color: getChartColor(idx), fill: false };
    });
  };

  const chartData = useMemo(() => {
    interface SeriesEntry {
      label: string;
      values: number[];
      color: string;
      fill: boolean;
      dash?: number[];
      showInTooltip?: boolean;
    }
    let seriesList: SeriesEntry[];

    if (endpoints.length > 0) {
      const list =
        selectedEndpoints.length > 0
          ? endpoints.filter((ep) => {
              const key =
                ep.key ||
                (() => {
                  const method = String(
                    firstValue(ep, ["http_method", "httpMethod"], "")
                  ).toUpperCase();
                  const op = String(
                    firstValue(
                      ep,
                      ["operation_name", "operationName", "endpoint_name", "endpointName"],
                      "Unknown"
                    )
                  );
                  const cleanOp = op.startsWith(`${method} `)
                    ? op.substring(method.length + 1)
                    : op;
                  const serviceName = firstValue(ep, ["service_name", "serviceName"], "");
                  return `${method} ${cleanOp}_${serviceName}`;
                })();
              return selectedEndpoints.includes(key);
            })
          : endpoints;

      if (hasServiceData) {
        seriesList = buildServiceDatasets(list);
      } else {
        seriesList = list.map((ep, idx) => {
          const method = firstValue(ep, ["http_method", "httpMethod"], "N/A");
          const operation = firstValue(
            ep,
            ["operation_name", "operationName", "endpoint_name", "endpointName"],
            "Unknown"
          );
          return {
            label: `${method} ${operation}`,
            values: timeBuckets.map(() => 0),
            color: getChartColor(idx),
            fill: false,
          };
        });
      }
    } else if (hasServiceData) {
      const stepMs =
        timeBuckets.length >= 2
          ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
          : 60000;
      seriesList = Object.entries(serviceTimeseriesMap)
        .slice(0, 10)
        .map(([svcName, rows], idx) => {
          const tsMap: Record<string, number> = {};
          for (const row of rows) {
            const rowTimestamp = firstValue(row, ["timestamp", "time_bucket", "timeBucket"], "");
            if (!rowTimestamp) continue;
            const rowTime = new Date(rowTimestamp).getTime();
            if (!Number.isFinite(rowTime)) continue;
            const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
            const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());
            const latency = Number(
              firstValue(
                row,
                [valueKey, "avg_latency", "avgLatency", "avg_latency_ms", "avgLatencyMs", "value"],
                0
              )
            );
            tsMap[bucketKey] = Math.max(
              tsMap[bucketKey] || 0,
              Number.isFinite(latency) ? latency : 0
            );
          }
          const values = timeBuckets.map((d) => tsMap[tsKey(d)] ?? 0);
          return { label: svcName, values, color: getChartColor(idx), fill: false };
        });
    } else {
      if (data.length > 0 && firstValue(data[0], ["value"], null) !== null) {
        const dataMap: Record<string, number> = {};
        for (const d of data) {
          const ts = firstValue(d, ["timestamp", "time_bucket", "timeBucket"], "");
          dataMap[tsKey(ts)] = Number(
            firstValue(
              d,
              ["value", valueKey, "avg_latency", "avgLatency", "avg_latency_ms", "avgLatencyMs"],
              0
            )
          );
        }
        seriesList = [
          {
            label: datasetLabel,
            values: timeBuckets.map((ts) => dataMap[tsKey(ts)] ?? 0),
            color,
            fill: true,
          },
        ];
      } else {
        const p50Map: Record<string, number> = {};
        const p95Map: Record<string, number> = {};
        const p99Map: Record<string, number> = {};
        for (const d of data) {
          const key = tsKey(firstValue(d, ["timestamp", "time_bucket", "timeBucket"], ""));
          p50Map[key] = Number(firstValue(d, ["p50_ms", "p50", "p50_latency", "p50Latency"], 0));
          p95Map[key] = Number(firstValue(d, ["p95_ms", "p95", "p95_latency", "p95Latency"], 0));
          p99Map[key] = Number(firstValue(d, ["p99_ms", "p99", "p99_latency", "p99Latency"], 0));
        }
        seriesList = [
          {
            label: "P50",
            values: timeBuckets.map((ts) => p50Map[tsKey(ts)] ?? 0),
            color: APP_COLORS.hex_73c991,
            fill: false,
          },
          {
            label: "P95",
            values: timeBuckets.map((ts) => p95Map[tsKey(ts)] ?? 0),
            color: APP_COLORS.hex_f79009,
            fill: false,
          },
          {
            label: "P99",
            values: timeBuckets.map((ts) => p99Map[tsKey(ts)] ?? 0),
            color: APP_COLORS.hex_f04438,
            fill: false,
          },
        ];
      }
    }

    if (targetThreshold !== null) {
      seriesList.push({
        label: `Target (${targetThreshold}ms)`,
        values: timeBuckets.map(() => targetThreshold),
        color: APP_COLORS.hex_f79009,
        fill: false,
        dash: [5, 5],
        showInTooltip: false,
      });
    }

    return seriesList;
  }, [
    data,
    endpoints,
    selectedEndpoints,
    serviceTimeseriesMap,
    hasServiceData,
    targetThreshold,
    timeBuckets,
  ]);

  const timestamps = useMemo(() => timeBuckets.map((t) => tsMs(t) / 1000), [timeBuckets]);

  const yAxisMax = useMemo(() => {
    let maxVal = 0;
    chartData.forEach((s) => {
      const dsMax = Math.max(...s.values.map((v) => Number(v) || 0), 0);
      if (dsMax > maxVal) maxVal = dsMax;
    });
    if (maxVal <= 0) return 10;
    if (maxVal < 10) return Math.max(Number((maxVal * 1.8).toFixed(2)), 5);
    if (maxVal < 100) return Math.max(Math.ceil(maxVal * 1.4), 10);
    return Math.max(Math.ceil(maxVal * 1.25), 10);
  }, [chartData]);

  if (data.length === 0 && timeBuckets.length === 0) {
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
        yMax={yAxisMax}
        yFormatter={(value) => `${value}ms`}
        height={height}
        fillHeight={fillHeight}
      />
    </div>
  );
});
