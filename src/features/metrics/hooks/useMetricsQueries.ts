import { useQuery } from '@tanstack/react-query';

import { metricsService } from '@shared/api/metricsService';

import { useAppStore } from '@store/appStore';

import {
  normalizeEndpointMetric,
  normalizeMetricSummary,
  normalizeServiceMetric,
  normalizeTimeSeriesPoint,
} from '../utils/metricNormalizers';

import type {
  EndpointMetricPoint,
  MetricSummary,
  MetricTimeSeriesPoint,
  MetricsServiceOption,
  ServiceMetricPoint,
  UseMetricsQueriesParams,
  UseMetricsQueriesResult,
} from '../types';

function asArray<T>(value: unknown, normalize: (row: unknown) => T): T[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(normalize);
}

/**
 *
 */
export function useMetricsQueries({
  selectedService,
  showErrorsOnly,
  activeTab,
}: UseMetricsQueriesParams): UseMetricsQueriesResult {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const getTimeRange = (): { startTime: number; endTime: number } => {
    const endTime = Date.now();
    const minutes = timeRange.minutes ?? 0;
    const startTime = endTime - minutes * 60 * 1000;
    return { startTime, endTime };
  };

  const { data: servicesData } = useQuery<unknown, Error, MetricsServiceOption[]>({
    queryKey: ['services', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsService.getOverviewServices(selectedTeamId, startTime, endTime);
    },
    select: (data) => asArray(data, (row) => row as MetricsServiceOption),
    enabled: Boolean(selectedTeamId),
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery<unknown, Error, MetricSummary>({
    queryKey: ['metrics-summary', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsService.getMetricsSummary(selectedTeamId, startTime, endTime);
    },
    select: (data) => normalizeMetricSummary(data),
    enabled: Boolean(selectedTeamId),
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery<
    unknown,
    Error,
    MetricTimeSeriesPoint[]
  >({
    queryKey: ['metrics-timeseries', selectedTeamId, timeRange.value, selectedService, showErrorsOnly, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsService.getMetricsTimeSeries(selectedTeamId, startTime, endTime, selectedService || undefined, '5m');
    },
    select: (data) => asArray(data, normalizeTimeSeriesPoint),
    enabled: Boolean(selectedTeamId),
  });

  const { data: serviceMetricsData } = useQuery<unknown, Error, ServiceMetricPoint[]>({
    queryKey: ['service-metrics', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsService.getServiceMetrics(selectedTeamId, startTime, endTime);
    },
    select: (data) => asArray(data, normalizeServiceMetric),
    enabled: Boolean(selectedTeamId) && activeTab === 'services',
  });

  const { data: endpointMetricsData } = useQuery<unknown, Error, EndpointMetricPoint[]>({
    queryKey: ['endpoints-metrics', selectedTeamId, timeRange.value, selectedService, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsService.getOverviewEndpointMetrics(selectedTeamId, startTime, endTime, selectedService || undefined);
    },
    select: (data) => asArray(data, normalizeEndpointMetric),
    enabled: Boolean(selectedTeamId),
  });

  const { data: endpointTimeSeriesData } = useQuery<unknown, Error, MetricTimeSeriesPoint[]>({
    queryKey: ['endpoints-timeseries', selectedTeamId, timeRange.value, selectedService, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return metricsService.getOverviewEndpointTimeSeries(selectedTeamId, startTime, endTime, selectedService || undefined);
    },
    select: (data) => asArray(data, normalizeTimeSeriesPoint),
    enabled: Boolean(selectedTeamId) && activeTab === 'overview',
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
