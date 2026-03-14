/**
 * Metrics Service — API calls for core metrics (services, endpoints, timeseries).
 */
import { API_CONFIG } from '@config/apiConfig';

import api from './api';

import type { QueryParams, RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

interface MetricRow extends Record<string, unknown> {
  service_name?: string;
  serviceName?: string;
  operation_name?: string;
  operationName?: string;
  request_count?: number;
  requestCount?: number;
  error_count?: number;
  errorCount?: number;
  error_rate?: number;
  errorRate?: number;
  avg_latency?: number;
  avgLatency?: number;
  p50_latency?: number;
  p50Latency?: number;
  p95_latency?: number;
  p95Latency?: number;
  p99_latency?: number;
  p99Latency?: number;
}

/**
 * Service metric shape consumed across dashboard pages.
 */
export interface ServiceMetric {
  readonly serviceName: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly avgLatency: number;
  readonly p50Latency: number;
  readonly p95Latency: number;
  readonly p99Latency: number;
  readonly [key: string]: unknown;
}

/**
 * Endpoint metric shape.
 */
export interface EndpointMetric extends ServiceMetric {
  readonly operationName: string;
  readonly httpMethod: string;
}

/**
 * Timeseries point shape.
 */
export interface TimeSeriesPoint {
  readonly timestamp: string;
  readonly serviceName: string;
  readonly operationName?: string;
  readonly httpMethod?: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly avgLatency: number;
  readonly [key: string]: unknown;
}

/**
 * Aggregate metrics summary payload.
 */
export interface MetricsSummary {
  readonly totalRequests: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly avgLatency: number;
  readonly p95Latency: number;
  readonly p99Latency: number;
}

function asMetricRow(value: unknown): MetricRow {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  // Backend payloads include dynamic fields that vary by endpoint.
  return value as MetricRow;
}

function getNumber(row: MetricRow, keys: string[]): number {
  for (const key of keys) {
    const raw = row[key];
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function getString(row: MetricRow, keys: string[]): string {
  for (const key of keys) {
    const raw = row[key];
    if (typeof raw === 'string' && raw.length > 0) {
      return raw;
    }
  }
  return '';
}

function normalizeServiceMetric(input: unknown): ServiceMetric {
  const row = asMetricRow(input);
  return {
    ...row,
    serviceName: getString(row, ['service_name', 'serviceName']),
    requestCount: getNumber(row, ['request_count', 'requestCount']),
    errorCount: getNumber(row, ['error_count', 'errorCount']),
    errorRate: getNumber(row, ['error_rate', 'errorRate']),
    avgLatency: getNumber(row, ['avg_latency', 'avgLatency']),
    p50Latency: getNumber(row, ['p50_latency', 'p50Latency']),
    p95Latency: getNumber(row, ['p95_latency', 'p95Latency']),
    p99Latency: getNumber(row, ['p99_latency', 'p99Latency']),
  };
}

function normalizeEndpointMetric(input: unknown): EndpointMetric {
  const row = asMetricRow(input);
  return {
    ...normalizeServiceMetric(row),
    operationName: getString(row, ['operation_name', 'operationName']),
    httpMethod: getString(row, ['http_method', 'httpMethod']),
  };
}

function normalizeTimeSeriesPoint(input: unknown): TimeSeriesPoint {
  const row = asMetricRow(input);
  return {
    ...row,
    timestamp: getString(row, ['timestamp']),
    serviceName: getString(row, ['service_name', 'serviceName']),
    operationName: getString(row, ['operation_name', 'operationName']),
    httpMethod: getString(row, ['http_method', 'httpMethod']),
    requestCount: getNumber(row, ['request_count', 'requestCount']),
    errorCount: getNumber(row, ['error_count', 'errorCount']),
    avgLatency: getNumber(row, ['avg_latency', 'avgLatency']),
  };
}

function asRows(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Service wrapper for metrics endpoints.
 */
export const metricsService = {
  async getServiceMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<ServiceMetric[]> {
    const rows = await api.get(`${BASE}/services/metrics`, { params: { startTime, endTime } });
    return asRows(rows).map((row: unknown) => normalizeServiceMetric(row));
  },

  async getEndpointMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string,
  ): Promise<EndpointMetric[]> {
    const rows = await api.get(`${BASE}/endpoints/metrics`, {
      params: { startTime, endTime, serviceName },
    });
    return asRows(rows).map((row: unknown) => normalizeEndpointMetric(row));
  },

  async getEndpointTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string,
  ): Promise<TimeSeriesPoint[]> {
    const rows = await api.get(`${BASE}/endpoints/timeseries`, {
      params: { startTime, endTime, serviceName },
    });
    return asRows(rows).map((row: unknown) => normalizeTimeSeriesPoint(row));
  },

  async getMetricsTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval?: string,
  ): Promise<TimeSeriesPoint[]> {
    const rows = await api.get(`${BASE}/metrics/timeseries`, {
      params: { startTime, endTime, serviceName, interval },
    });
    return asRows(rows).map((row: unknown) => normalizeTimeSeriesPoint(row));
  },

  async getMetricsSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<MetricsSummary> {
    const response = await api.get(`${BASE}/metrics/summary`, { params: { startTime, endTime } });
    const row = asMetricRow(response);
    return {
      totalRequests: getNumber(row, ['total_requests', 'totalRequests']),
      errorCount: getNumber(row, ['error_count', 'errorCount']),
      errorRate: getNumber(row, ['error_rate', 'errorRate']),
      avgLatency: getNumber(row, ['avg_latency', 'avgLatency']),
      p95Latency: getNumber(row, ['p95_latency', 'p95Latency']),
      p99Latency: getNumber(row, ['p99_latency', 'p99Latency']),
    };
  },

  async getServiceTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/services/timeseries`, { params: { startTime, endTime, interval } });
  },

  async getServiceDependencies(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/dependencies`, { params: { startTime, endTime } });
  },

  async getEndpointBreakdown(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/${serviceName}/endpoints`, { params: { startTime, endTime } });
  },

  async getErrorGroups(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/${serviceName}/errors`, { params: { startTime, endTime } });
  },

  async getGlobalErrorGroups(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/errors/groups`, { params: { startTime, endTime, ...params } });
  },

  async getErrorTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = '5m',
    serviceName?: string,
  ): Promise<unknown> {
    return api.get(`${BASE}/errors/timeseries`, {
      params: { startTime, endTime, interval, serviceName },
    });
  },

  async getIncidents(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/incidents`, { params: { startTime, endTime, ...params } });
  },

  async getAvgCPU(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/resource-utilisation/avg-cpu`, {
      params: { startTime, endTime },
    });
  },

  async getAvgMemory(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/resource-utilisation/avg-memory`, {
      params: { startTime, endTime },
    });
  },

  async getAvgNetwork(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/resource-utilisation/avg-network`, {
      params: { startTime, endTime },
    });
  },

  async getAvgConnPool(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/resource-utilisation/avg-conn-pool`, {
      params: { startTime, endTime },
    });
  },

  async getCPUUsagePercentage(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/resource-utilisation/cpu-usage-percentage`, {
      params: { startTime, endTime },
    });
  },

  async getMemoryUsagePercentage(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/resource-utilisation/memory-usage-percentage`, {
      params: { startTime, endTime },
    });
  },

  async getResourceUsageByService(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/resource-utilisation/by-service`, {
      params: { startTime, endTime },
    });
  },

  async getResourceUsageByInstance(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/resource-utilisation/by-instance`, {
      params: { startTime, endTime },
    });
  },

  async getNodeHealth(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/nodes`, { params: { startTime, endTime } });
  },

  async getNodeServices(
    _teamId: number | null,
    host: string,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/nodes/${encodeURIComponent(host)}/services`, {
      params: { startTime, endTime },
    });
  },

  // Overview endpoints (formerly overviewService)
  async getOverviewSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/summary`, { params: { startTime, endTime } });
  },

  async getOverviewTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/timeseries`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getOverviewServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/services`, { params: { startTime, endTime } });
  },

  async getOverviewEndpointMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/endpoints/metrics`, { params: { startTime, endTime, serviceName } });
  },

  async getOverviewEndpointTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/endpoints/timeseries`, { params: { startTime, endTime, serviceName } });
  },

  async getSloSli(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/slo`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getOverviewErrorGroups(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/errors/groups`, { params: { startTime, endTime, ...params } });
  },

  async getServiceErrorRate(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/errors/service-error-rate`, {
      params: { startTime, endTime, serviceName, interval },
    });
  },

  async getErrorVolume(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/errors/error-volume`, {
      params: { startTime, endTime, serviceName, interval },
    });
  },

  async getLatencyDuringErrorWindows(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/overview/errors/latency-during-error-windows`, {
      params: { startTime, endTime, serviceName, interval },
    });
  },
};
