import { useMemo } from "react";

import type {
  DashboardDataSources,
  DashboardPanelSpec,
  DashboardPanelType,
  DashboardRecord,
} from "@/types/dashboardConfig";

import type { BaseChartComponentProps } from "../dashboardPanelRegistry";
import {
  firstValue,
  normalizeDashboardRows,
  numValue,
  resolveComponentData,
  resolveComponentKey,
  strValue,
} from "../utils/dashboardFormatters";
import {
  buildEndpointList,
  buildGroupedListFromTimeseries,
  buildQueueEndpoints,
  buildServiceListFromMetrics,
  defaultListTypeForChart,
  groupTimeseries,
} from "../utils/dashboardListBuilders";
import { getDashboardRecordArrayField } from "../utils/runtimeValue";

/**
 * Pure function: maps flat timeseries rows to chart data points based on panel type.
 */
export function buildFlatChartData(
  timeseriesData: DashboardRecord[],
  chartConfig: DashboardPanelSpec,
  panelType: DashboardPanelType
): DashboardRecord[] {
  return timeseriesData.map((d: DashboardRecord) => ({
    timestamp: strValue(d, ["timestamp", "time_bucket", "timeBucket"], ""),
    value: (() => {
      const explicit = firstValue(
        d,
        [chartConfig.valueField || chartConfig.valueKey || "value", "value"],
        null
      );
      if (explicit !== null && explicit !== undefined && explicit !== "") {
        const parsed = Number(explicit);
        return Number.isFinite(parsed) ? parsed : 0;
      }

      if (panelType === "request") {
        return numValue(d, ["request_count", "requestCount", "req_count", "value", "val"], 0);
      }
      if (panelType === "error-rate") {
        const total = numValue(d, ["request_count", "requestCount", "req_count"], 0);
        const errors = numValue(d, ["error_count", "errorCount"], 0);
        if (total > 0) return (errors * 100.0) / total;
        return numValue(d, ["error_rate", "errorRate"], 0);
      }
      if (panelType === "latency") {
        return numValue(
          d,
          [
            "avg_latency",
            "avgLatency",
            "avg_latency_ms",
            "avgLatencyMs",
            "p50_latency",
            "p50Latency",
            "p50",
          ],
          0
        );
      }
      return 0;
    })(),
    ...(panelType === "latency"
      ? {
          p50: numValue(
            d,
            ["p50_latency", "p50Latency", "p50", "avg_latency_ms", "avgLatencyMs"],
            0
          ),
          p95: numValue(d, ["p95_latency", "p95Latency", "p95", "p95_latency_ms"], 0),
          p99: numValue(d, ["p99_latency", "p99Latency", "p99"], 0),
        }
      : {}),
  }));
}

export interface ChartCardData {
  panelType: DashboardPanelType;
  rawData: unknown;
  hasNoData: boolean;
  timeseriesData: DashboardRecord[];
  serviceTimeseriesMap: Record<string, DashboardRecord[]>;
  endpoints: any[];
  chartProps: BaseChartComponentProps;
}

export function useChartCardData(
  chartConfig: DashboardPanelSpec,
  dataSources: DashboardDataSources,
  selectedEndpoints: string[]
): ChartCardData {
  const panelType = resolveComponentKey(chartConfig);
  const rawData = resolveComponentData(chartConfig, dataSources);

  const hasNoData = useMemo(() => {
    if (rawData === undefined || rawData === null) return true;
    if (Array.isArray(rawData)) {
      if (rawData.length === 0) return true;

      const primaryKey = chartConfig.valueKey || chartConfig.valueField || "value";
      const fallbacks = ["span_count", "request_count", "error_count"];
      const metricsToCheck = [primaryKey, ...fallbacks].filter(Boolean) as string[];

      if (metricsToCheck.length > 0) {
        const hasPositiveMetric = rawData.some((row) =>
          metricsToCheck.some((key) => {
            const val = Number(row[key]);
            return !Number.isNaN(val) && val > 0;
          })
        );
        if (!hasPositiveMetric) return true;
      }
    }
    return false;
  }, [rawData, chartConfig.valueKey, chartConfig.valueField]);

  const timeseriesData = normalizeDashboardRows(rawData, chartConfig.dataKey);

  const serviceTimeseriesMap = useMemo(() => {
    if (chartConfig.groupByKey) {
      return groupTimeseries(timeseriesData, chartConfig.groupByKey);
    }
    const endpointDataSourceId = chartConfig.endpointDataSource;
    if (endpointDataSourceId && dataSources?.[endpointDataSourceId]) {
      const endpointData = normalizeDashboardRows(dataSources[endpointDataSourceId]);
      return groupTimeseries(endpointData, "endpoint");
    }
    return {};
  }, [timeseriesData, dataSources, chartConfig]);

  const endpoints = useMemo(() => {
    if (chartConfig.groupByKey === "queue") {
      const topQueues = getDashboardRecordArrayField(rawData, "topQueues");
      return buildQueueEndpoints(
        topQueues,
        chartConfig.listSortField || chartConfig.valueKey || "value",
        chartConfig.listType || "default"
      );
    }

    const metricsSourceId = chartConfig.endpointMetricsSource;
    if (metricsSourceId && dataSources?.[metricsSourceId]) {
      const metricsData = normalizeDashboardRows(dataSources[metricsSourceId]);
      const listType = defaultListTypeForChart(chartConfig);
      const metricEndpoints =
        chartConfig.groupByKey === "service"
          ? buildServiceListFromMetrics(metricsData, listType)
          : buildEndpointList(metricsData, listType);
      if (metricEndpoints.length > 0) {
        return metricEndpoints;
      }
    }

    if (chartConfig.groupByKey) {
      return buildGroupedListFromTimeseries(serviceTimeseriesMap, chartConfig);
    }

    return [];
  }, [rawData, dataSources, serviceTimeseriesMap, chartConfig]);

  const chartProps: BaseChartComponentProps = useMemo(() => {
    const props: BaseChartComponentProps = {
      serviceTimeseriesMap,
      endpoints,
      selectedEndpoints,
      fillHeight: true,
    };

    if (chartConfig.valueKey) props.valueKey = chartConfig.valueKey;
    if (chartConfig.datasetLabel) props.datasetLabel = chartConfig.datasetLabel;
    if (chartConfig.color) props.color = chartConfig.color;
    if (chartConfig.targetThreshold != null)
      props.targetThreshold = Number(chartConfig.targetThreshold);

    if (!chartConfig.groupByKey && !chartConfig.endpointDataSource) {
      props.data = buildFlatChartData(timeseriesData, chartConfig, panelType);
    }

    return props;
  }, [
    serviceTimeseriesMap,
    endpoints,
    selectedEndpoints,
    chartConfig,
    timeseriesData,
    panelType,
  ]);

  return {
    panelType,
    rawData,
    hasNoData,
    timeseriesData,
    serviceTimeseriesMap,
    endpoints,
    chartProps,
  };
}
