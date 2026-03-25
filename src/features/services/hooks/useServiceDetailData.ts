import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { metricsService } from '@shared/api/metricsService';
import { logsService } from '@shared/api/logsService';

import { resolveTimeRangeBounds } from '@/types';
import { useAppStore } from '@store/appStore';

import type {
  EndpointMetricDto,
  ErrorGroupDto,
  ServiceDependencyDto,
} from '@shared/api/schemas/metricsSchemas';
import type {
  ServiceDependency,
  ServiceEndpointRow,
  ServiceErrorGroupRow,
  ServiceLogRow,
  ServiceTimeSeriesPoint,
} from '../types';

const n = (value: unknown): number => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

export const normalizeEndpoint = (row: EndpointMetricDto): ServiceEndpointRow => ({
  service_name: row.service_name,
  operation_name: row.operation_name,
  http_method: row.http_method,
  request_count: row.request_count,
  error_count: row.error_count,
  avg_latency: row.avg_latency,
  p95_latency: row.p95_latency,
  p99_latency: row.p99_latency,
});

export const normalizeErrorGroup = (row: ErrorGroupDto): ServiceErrorGroupRow => ({
  service_name: row.service_name,
  operation_name: row.operation_name,
  status_message: row.status_message,
  http_status_code: row.http_status_code,
  error_count: row.error_count,
  last_occurrence: row.last_occurrence,
  first_occurrence: row.first_occurrence,
  sample_trace_id: row.sample_trace_id,
});

type ServiceTimeSeriesInput =
  | Record<string, unknown>
  | {
    timestamp?: string;
    serviceName?: string;
    operationName?: string;
    httpMethod?: string;
    requestCount?: number;
    errorCount?: number;
    avgLatency?: number;
    p50?: number;
    p95?: number;
    p99?: number;
  };

export const normalizeTimeSeriesPoint = (row: ServiceTimeSeriesInput = {}): ServiceTimeSeriesPoint => ({
  ...row,
  timestamp: String(row.timestamp ?? ''),
  service_name: String(('service_name' in row ? row.service_name : row.serviceName) ?? ''),
  operation_name: String(('operation_name' in row ? row.operation_name : row.operationName) ?? ''),
  http_method: String(('http_method' in row ? row.http_method : row.httpMethod) ?? ''),
  request_count: n('request_count' in row ? row.request_count : row.requestCount),
  error_count: n('error_count' in row ? row.error_count : row.errorCount),
  avg_latency: n('avg_latency' in row ? row.avg_latency : row.avgLatency),
  p50: n(row.p50),
  p95: n(row.p95),
  p99: n(row.p99),
});

export const normalizeLog = (row: Record<string, unknown> = {}): ServiceLogRow => ({
  ...row,
  timestamp: String(row.timestamp ?? ''),
  level: String(row.level ?? 'INFO'),
  message: String(row.message ?? ''),
  trace_id: String(row.trace_id ?? ''),
  span_id: String(row.span_id ?? ''),
});

export const normalizeDependency = (row: ServiceDependencyDto): ServiceDependency => ({
  source: row.source,
  target: row.target,
  call_count: row.call_count,
});

export interface UseServiceDetailDataProps {
  serviceName: string;
  activeTab: 'overview' | 'errors' | 'logs' | 'dependencies';
}

export function useServiceDetailData({ serviceName, activeTab }: UseServiceDetailDataProps) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const rangeKey = timeRange.kind === 'relative' ? timeRange.preset : `${timeRange.startMs}-${timeRange.endMs}`;

  const getBounds = () => resolveTimeRangeBounds(timeRange);

  const { data: endpointData, isLoading: endpointsLoading } = useQuery({
    queryKey: ['endpoint-breakdown', selectedTeamId, rangeKey, serviceName, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getBounds();
      return metricsService.getEndpointBreakdown(selectedTeamId, startTime, endTime, serviceName);
    },
    enabled: !!selectedTeamId && serviceName.length > 0,
  });

  const { data: errorData, isLoading: errorsLoading } = useQuery({
    queryKey: ['error-groups', selectedTeamId, rangeKey, serviceName, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getBounds();
      return metricsService.getErrorGroups(selectedTeamId, startTime, endTime, serviceName);
    },
    enabled: !!selectedTeamId && serviceName.length > 0,
  });

  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['metrics-timeseries', selectedTeamId, rangeKey, serviceName, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getBounds();
      return metricsService.getMetricsTimeSeries(selectedTeamId, startTime, endTime, serviceName, '5m');
    },
    enabled: !!selectedTeamId && serviceName.length > 0,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['service-logs', selectedTeamId, rangeKey, serviceName, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getBounds();
      return logsService.getLogs(selectedTeamId, startTime, endTime, {
        services: [serviceName],
        limit: 50,
        offset: 0,
      });
    },
    enabled: !!selectedTeamId && serviceName.length > 0 && activeTab === 'logs',
  });

  const { data: dependenciesData } = useQuery({
    queryKey: ['service-dependencies', selectedTeamId, rangeKey, serviceName, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getBounds();
      return metricsService.getServiceDependencies(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId && serviceName.length > 0 && activeTab === 'dependencies',
  });

  const endpoints = Array.isArray(endpointData)
    ? endpointData.map((row) => normalizeEndpoint(row))
    : [];
  const errorGroups = Array.isArray(errorData)
    ? errorData.map((row) => normalizeErrorGroup(row))
    : [];
  const timeSeries = Array.isArray(timeSeriesData)
    ? timeSeriesData.map((row) => normalizeTimeSeriesPoint(row))
    : [];
  const logsRaw = (logsData as { logs?: unknown[] } | undefined)?.logs;
  const logs = Array.isArray(logsRaw)
    ? logsRaw.map((row) => normalizeLog((row as Record<string, unknown>) || {}))
    : [];
  const dependencies = Array.isArray(dependenciesData)
    ? dependenciesData.map((row) => normalizeDependency(row))
    : [];
  const isLoading = endpointsLoading || errorsLoading || timeSeriesLoading;

  // Filter dependencies for this service
  const serviceDependencies = useMemo(() => {
    return dependencies.filter(
      (dependency: ServiceDependency) =>
        dependency.source === serviceName || dependency.target === serviceName,
    );
  }, [dependencies, serviceName]);

  const stats = useMemo(
    () =>
      endpoints.reduce(
        (
          accumulator: { totalRequests: number; totalErrors: number; latencies: number[]; p95Latencies: number[] },
          endpoint: ServiceEndpointRow,
        ) => {
          accumulator.totalRequests += endpoint.request_count || 0;
          accumulator.totalErrors += endpoint.error_count || 0;
          accumulator.latencies.push(endpoint.avg_latency || 0);
          accumulator.p95Latencies.push(endpoint.p95_latency || 0);
          return accumulator;
        },
        { totalRequests: 0, totalErrors: 0, latencies: [], p95Latencies: [] },
      ),
    [endpoints],
  );

  const errorRate = stats.totalRequests > 0 ? (stats.totalErrors / stats.totalRequests) * 100 : 0;

  const avgLatency =
    stats.latencies.length > 0
      ? stats.latencies.reduce((left: number, right: number) => left + right, 0) /
        stats.latencies.length
      : 0;

  const p95Latency = stats.p95Latencies.length > 0 ? Math.max(...stats.p95Latencies) : 0;

  // Build sparkline data from timeseries
  const requestsSparkline = useMemo(
    () => timeSeries.map((point: ServiceTimeSeriesPoint) => point.request_count || 0),
    [timeSeries],
  );

  const errorSparkline = useMemo(() => {
    return timeSeries.map((point: ServiceTimeSeriesPoint) => {
      const total = point.request_count || 0;
      const errors = point.error_count || 0;
      return total > 0 ? (errors / total) * 100 : 0;
    });
  }, [timeSeries]);

  return {
    endpoints,
    errorGroups,
    timeSeries,
    logs,
    serviceDependencies,
    stats,
    errorRate,
    avgLatency,
    p95Latency,
    requestsSparkline,
    errorSparkline,
    isLoading,
    endpointsLoading,
    errorsLoading,
    timeSeriesLoading,
    logsLoading,
  };
}
