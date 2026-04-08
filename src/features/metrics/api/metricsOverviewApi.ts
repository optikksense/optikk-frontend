import { z } from "zod";

import api from "@/shared/api/api/client";
import type { QueryParams, RequestTime } from "@/shared/api/service-types";
import { validateResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";

import type {
  EndpointMetricPoint,
  MetricSummary,
  MetricTimeSeriesPoint,
  MetricsServiceOption,
  ServiceMetricPoint,
} from "../types";

export interface OverviewRequestRatePoint {
  readonly timestamp: string;
  readonly serviceName: string;
  readonly requestCount: number;
}

export interface OverviewErrorRatePoint {
  readonly timestamp: string;
  readonly serviceName: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
}

export interface OverviewP95LatencyPoint {
  readonly timestamp: string;
  readonly serviceName: string;
  readonly p95: number;
}

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const numericValue = z.coerce.number().default(0);
const stringValue = z.string().default("");

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
    endpoint_name: stringValue.optional(),
    http_method: stringValue,
    request_count: numericValue,
    error_count: numericValue,
    avg_latency: numericValue,
    p50_latency: numericValue,
    p95_latency: numericValue,
    p99_latency: numericValue,
  })
  .strict();

const requestRatePointSchema = z
  .object({
    timestamp: stringValue,
    service_name: stringValue.optional(),
    request_count: numericValue,
  })
  .strict();

const errorRatePointSchema = z
  .object({
    timestamp: stringValue,
    service_name: stringValue.optional(),
    request_count: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
  })
  .strict();

const p95LatencyPointSchema = z
  .object({
    timestamp: stringValue,
    service_name: stringValue.optional(),
    p95: numericValue,
  })
  .strict();

type MetricsRequestParams = Readonly<
  QueryParams & {
    startTime: RequestTime;
    endTime: RequestTime;
  }
>;

type ComparisonPayload<T> = {
  data: T;
  comparison?: unknown;
};

function unwrapComparisonPayload<T>(value: unknown): T {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return value as T;
  }

  const record = value as Record<string, unknown>;
  if (!("data" in record)) {
    return value as T;
  }

  const keys = Object.keys(record);
  if (keys.length <= 2 && (keys.length === 1 || "comparison" in record)) {
    return record.data as T;
  }

  return value as T;
}

async function getArrayResponse<TSchema extends z.ZodTypeAny>(
  endpoint: string,
  schema: TSchema,
  params: MetricsRequestParams
): Promise<Array<z.infer<TSchema>>> {
  const data = await api.get(endpoint, { params });
  return validateResponse(z.array(schema), unwrapComparisonPayload<Array<z.infer<TSchema>>>(data));
}

async function getObjectResponse<TSchema extends z.ZodTypeAny>(
  endpoint: string,
  schema: TSchema,
  params: MetricsRequestParams
): Promise<z.infer<TSchema>> {
  const data = await api.get(endpoint, { params });
  return validateResponse(schema, unwrapComparisonPayload<z.infer<TSchema>>(data));
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
    timestamp: row.timestamp || row.time_bucket || "",
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
    endpoint_name: row.endpoint_name,
    http_method: row.http_method,
    request_count: row.request_count,
    error_count: row.error_count,
    avg_latency: row.avg_latency,
    p50_latency: row.p50_latency,
    p95_latency: row.p95_latency,
    p99_latency: row.p99_latency,
  };
}

function normalizeRequestRatePoint(
  row: z.infer<typeof requestRatePointSchema>
): OverviewRequestRatePoint {
  return {
    timestamp: row.timestamp,
    serviceName: row.service_name ?? "",
    requestCount: row.request_count,
  };
}

function normalizeErrorRatePoint(
  row: z.infer<typeof errorRatePointSchema>
): OverviewErrorRatePoint {
  return {
    timestamp: row.timestamp,
    serviceName: row.service_name ?? "",
    requestCount: row.request_count,
    errorCount: row.error_count,
    errorRate: row.error_rate,
  };
}

function normalizeP95LatencyPoint(
  row: z.infer<typeof p95LatencyPointSchema>
): OverviewP95LatencyPoint {
  return {
    timestamp: row.timestamp,
    serviceName: row.service_name ?? "",
    p95: row.p95,
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

  async getOverviewServiceMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ServiceMetricPoint[]> {
    const rows = await getArrayResponse(`${BASE}/overview/services`, serviceSummarySchema, {
      startTime,
      endTime,
    });
    return rows.map(normalizeServiceMetric);
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

  async getOverviewRequestRate(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<OverviewRequestRatePoint[]> {
    const rows = await getArrayResponse(`${BASE}/overview/request-rate`, requestRatePointSchema, {
      startTime,
      endTime,
      serviceName,
    });
    return rows.map(normalizeRequestRatePoint);
  },

  async getOverviewErrorRate(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<OverviewErrorRatePoint[]> {
    const rows = await getArrayResponse(`${BASE}/overview/error-rate`, errorRatePointSchema, {
      startTime,
      endTime,
      serviceName,
    });
    return rows.map(normalizeErrorRatePoint);
  },

  async getOverviewP95Latency(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<OverviewP95LatencyPoint[]> {
    const rows = await getArrayResponse(`${BASE}/overview/p95-latency`, p95LatencyPointSchema, {
      startTime,
      endTime,
      serviceName,
    });
    return rows.map(normalizeP95LatencyPoint);
  },

  async getMetricsTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = "5m"
  ): Promise<MetricTimeSeriesPoint[]> {
    const rows = await getArrayResponse(
      `${BASE}/services/timeseries`,
      metricsTimeSeriesPointSchema,
      {
        startTime,
        endTime,
        serviceName,
        interval,
      }
    );
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
    const rows = await getArrayResponse(
      `${BASE}/overview/endpoints/metrics`,
      endpointMetricSchema,
      {
        startTime,
        endTime,
        serviceName,
      }
    );
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
