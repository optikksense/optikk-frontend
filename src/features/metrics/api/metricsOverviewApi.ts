import { z } from 'zod';

import { API_CONFIG } from '@config/apiConfig';
import api from '@/shared/api/api/client';
import type { QueryParams, RequestTime } from '@/shared/api/service-types';
import { validateResponse } from '@/shared/api/utils/validate';

import type {
  EndpointMetricPoint,
  MetricSummary,
  MetricTimeSeriesPoint,
  MetricsServiceOption,
  ServiceMetricPoint,
} from '../types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const numericValue = z.coerce.number().default(0);
const stringValue = z.string().default('');

const serviceSummarySchema = z
  .object({
    service_name: stringValue,
    request_count: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
    avg_latency: numericValue,
    p50_latency: numericValue,
    p95_latency: numericValue,
    p99_latency: numericValue,
  })
  .strict();

const metricsSummarySchema = z
  .object({
    total_requests: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
    avg_latency: numericValue,
    p95_latency: numericValue,
    p99_latency: numericValue,
  })
  .strict();

const metricsTimeSeriesPointSchema = z
  .object({
    timestamp: stringValue,
    time_bucket: stringValue.optional(),
    request_count: numericValue,
    error_count: numericValue,
    avg_latency: numericValue,
    p50_latency: numericValue,
    p95_latency: numericValue,
    p99_latency: numericValue,
  })
  .strict();

const endpointMetricSchema = z
  .object({
    service_name: stringValue,
    operation_name: stringValue,
    http_method: stringValue,
    request_count: numericValue,
    error_count: numericValue,
    avg_latency: numericValue,
    p50_latency: numericValue,
    p95_latency: numericValue,
    p99_latency: numericValue,
  })
  .strict();

type MetricsRequestParams = Readonly<
  QueryParams & {
    startTime: RequestTime;
    endTime: RequestTime;
  }
>;

async function getArrayResponse<TSchema extends z.ZodTypeAny>(
  endpoint: string,
  schema: TSchema,
  params: MetricsRequestParams
): Promise<Array<z.infer<TSchema>>> {
  const data = await api.get(endpoint, { params });
  return validateResponse(z.array(schema), data);
}

async function getObjectResponse<TSchema extends z.ZodTypeAny>(
  endpoint: string,
  schema: TSchema,
  params: MetricsRequestParams
): Promise<z.infer<TSchema>> {
  const data = await api.get(endpoint, { params });
  return validateResponse(schema, data);
}

function normalizeServiceOption(row: z.infer<typeof serviceSummarySchema>): MetricsServiceOption {
  return {
    name: row.service_name,
    service_name: row.service_name,
    serviceName: row.service_name,
  };
}

function normalizeMetricSummary(row: z.infer<typeof metricsSummarySchema>): MetricSummary {
  return {
    total_requests: row.total_requests,
    error_count: row.error_count,
    error_rate: row.error_rate,
    avg_latency: row.avg_latency,
    p95_latency: row.p95_latency,
    p99_latency: row.p99_latency,
  };
}

function normalizeTimeSeriesPoint(
  row: z.infer<typeof metricsTimeSeriesPointSchema>
): MetricTimeSeriesPoint {
  return {
    timestamp: row.timestamp || row.time_bucket || '',
    request_count: row.request_count,
    error_count: row.error_count,
    avg_latency: row.avg_latency,
    p50: row.p50_latency,
    p95: row.p95_latency,
    p99: row.p99_latency,
  };
}

function normalizeServiceMetric(row: z.infer<typeof serviceSummarySchema>): ServiceMetricPoint {
  return {
    service_name: row.service_name,
    request_count: row.request_count,
    error_count: row.error_count,
    avg_latency: row.avg_latency,
    p50_latency: row.p50_latency,
    p95_latency: row.p95_latency,
    p99_latency: row.p99_latency,
  };
}

function normalizeEndpointMetric(row: z.infer<typeof endpointMetricSchema>): EndpointMetricPoint {
  return {
    service_name: row.service_name,
    operation_name: row.operation_name,
    http_method: row.http_method,
    request_count: row.request_count,
    error_count: row.error_count,
    avg_latency: row.avg_latency,
    p50_latency: row.p50_latency,
    p95_latency: row.p95_latency,
    p99_latency: row.p99_latency,
  };
}

export const metricsOverviewApi = {
  async getOverviewServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<MetricsServiceOption[]> {
    const rows = await getArrayResponse(`${BASE}/overview/services`, serviceSummarySchema, {
      startTime,
      endTime,
    });
    return rows.map(normalizeServiceOption);
  },

  async getMetricsSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<MetricSummary> {
    const row = await getObjectResponse(`${BASE}/metrics/summary`, metricsSummarySchema, {
      startTime,
      endTime,
    });
    return normalizeMetricSummary(row);
  },

  async getMetricsTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m'
  ): Promise<MetricTimeSeriesPoint[]> {
    const rows = await getArrayResponse(`${BASE}/services/timeseries`, metricsTimeSeriesPointSchema, {
      startTime,
      endTime,
      serviceName,
      interval,
    });
    return rows.map(normalizeTimeSeriesPoint);
  },

  async getServiceMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ServiceMetricPoint[]> {
    const rows = await getArrayResponse(`${BASE}/services/metrics`, serviceSummarySchema, {
      startTime,
      endTime,
    });
    return rows.map(normalizeServiceMetric);
  },

  async getOverviewEndpointMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<EndpointMetricPoint[]> {
    const rows = await getArrayResponse(`${BASE}/overview/endpoints/metrics`, endpointMetricSchema, {
      startTime,
      endTime,
      serviceName,
    });
    return rows.map(normalizeEndpointMetric);
  },

  async getOverviewEndpointTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<MetricTimeSeriesPoint[]> {
    const rows = await getArrayResponse(
      `${BASE}/overview/endpoints/timeseries`,
      metricsTimeSeriesPointSchema,
      {
        startTime,
        endTime,
        serviceName,
      }
    );
    return rows.map(normalizeTimeSeriesPoint);
  },
};
