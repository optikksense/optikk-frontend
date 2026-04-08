import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { resolveTimeRangeBounds } from "@/types";
import { useRefreshKey, useTeamId, useTimeRange } from "@store/appStore";
import { metricsOverviewApi } from "../api/metricsOverviewApi";

import type {
  EndpointMetricPoint,
  MetricSummary,
  MetricTimeSeriesPoint,
  MetricsServiceOption,
  ServiceMetricPoint,
  UseMetricsQueriesParams,
  UseMetricsQueriesResult,
} from "../types";

/**
 *
 */
export function useMetricsQueries({
  selectedService,
  showErrorsOnly,
  activeTab,
}: UseMetricsQueriesParams): UseMetricsQueriesResult {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();

  const rangeKey =
    timeRange.kind === "relative" ? timeRange.preset : `${timeRange.startMs}-${timeRange.endMs}`;
  const getTimeRange = () => resolveTimeRangeBounds(timeRange);

  const { data: servicesData } = useQuery<MetricsServiceOption[]>({
    queryKey: ["services", selectedTeamId, rangeKey, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsOverviewApi.getOverviewServices(selectedTeamId, startTime, endTime);
    },
    enabled: Boolean(selectedTeamId),
    placeholderData: keepPreviousData,
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery<MetricSummary>({
    queryKey: ["metrics-summary", selectedTeamId, rangeKey, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsOverviewApi.getMetricsSummary(selectedTeamId, startTime, endTime);
    },
    enabled: Boolean(selectedTeamId),
    placeholderData: keepPreviousData,
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery<MetricTimeSeriesPoint[]>({
    queryKey: [
      "metrics-timeseries",
      selectedTeamId,
      rangeKey,
      selectedService,
      showErrorsOnly,
      refreshKey,
    ],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsOverviewApi.getMetricsTimeSeries(
        selectedTeamId,
        startTime,
        endTime,
        selectedService || undefined,
        "5m"
      );
    },
    enabled: Boolean(selectedTeamId),
    placeholderData: keepPreviousData,
  });

  const { data: serviceMetricsData } = useQuery<ServiceMetricPoint[]>({
    queryKey: ["service-metrics", selectedTeamId, rangeKey, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsOverviewApi.getServiceMetrics(selectedTeamId, startTime, endTime);
    },
    enabled: Boolean(selectedTeamId) && activeTab === "services",
    placeholderData: keepPreviousData,
  });

  const { data: endpointMetricsData } = useQuery<EndpointMetricPoint[]>({
    queryKey: ["endpoints-metrics", selectedTeamId, rangeKey, selectedService, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsOverviewApi.getOverviewEndpointMetrics(
        selectedTeamId,
        startTime,
        endTime,
        selectedService || undefined
      );
    },
    enabled: Boolean(selectedTeamId),
    placeholderData: keepPreviousData,
  });

  const { data: endpointTimeSeriesData } = useQuery<MetricTimeSeriesPoint[]>({
    queryKey: ["endpoints-timeseries", selectedTeamId, rangeKey, selectedService, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsOverviewApi.getOverviewEndpointTimeSeries(
        selectedTeamId,
        startTime,
        endTime,
        selectedService || undefined
      );
    },
    enabled: Boolean(selectedTeamId) && activeTab === "overview",
    placeholderData: keepPreviousData,
  });

  return {
    servicesData,
    summaryData,
    summaryLoading,
    metricsData,
    metricsLoading,
    serviceMetricsData,
    endpointMetricsData,
    endpointTimeSeriesData,
  };
}
