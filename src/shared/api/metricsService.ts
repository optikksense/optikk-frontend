/**
 * Metrics Service — API calls for core metrics (services, endpoints, timeseries).
 */
import { API_CONFIG } from '@config/apiConfig';
import { z } from 'zod';

import api from './api';
import {
  errorGroupSchema,
  type ErrorGroupDto,
  enrichedTopologySchema,
  type EnrichedTopologyDto,
  endpointMetricSchema,
  type EndpointMetricDto,
  metricNumericValueSchema,
  type MetricNumericValue,
  metricsTimeSeriesPointSchema,
  type MetricsTimeSeriesPointDto,
  resourceUsageByInstanceRowSchema,
  type ResourceUsageByInstanceRowDto,
  resourceUsageByServiceRowSchema,
  type ResourceUsageByServiceRowDto,
  resourceUsageTimeSeriesPointSchema,
  type ResourceUsageTimeSeriesPointDto,
  serviceDependencySchema,
  type ServiceDependencyDto,
  serviceDependencyDetailSchema,
  type ServiceDependencyDetailDto,
  serviceDependencyGraphSchema,
  type ServiceDependencyGraphDto,
  serviceErrorTimeSeriesSchema,
  type ServiceErrorTimeSeriesDto,
  spanAnalysisRowSchema,
  type SpanAnalysisRowDto,
  serviceInfraMetricsSchema,
  type ServiceInfraMetricsDto,
  topologyClusterSchema,
  type TopologyClusterDto,
} from './schemas/metricsSchemas';
const serviceSummarySchema = z
  .object({
    service_name: z.string().default(''),
    request_count: z.coerce.number().default(0),
    error_count: z.coerce.number().default(0),
    error_rate: z.coerce.number().default(0),
    avg_latency: z.coerce.number().default(0),
    p50_latency: z.coerce.number().default(0),
    p95_latency: z.coerce.number().default(0),
    p99_latency: z.coerce.number().default(0),
  })
  .strict();

type ServiceSummary = z.infer<typeof serviceSummarySchema>;
import type { QueryParams, RequestTime } from './service-types';
import { validateResponse } from './utils/validate';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

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

const metricsSummarySchema = z
  .object({
    total_requests: z.coerce.number().default(0),
    error_count: z.coerce.number().default(0),
    error_rate: z.coerce.number().default(0),
    avg_latency: z.coerce.number().default(0),
    p95_latency: z.coerce.number().default(0),
    p99_latency: z.coerce.number().default(0),
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

function normalizeServiceMetric(row: ServiceSummary): ServiceMetric {
  return {
    serviceName: row.service_name,
    requestCount: row.request_count,
    errorCount: row.error_count,
    errorRate: row.error_rate,
    avgLatency: row.avg_latency,
    p50Latency: row.p50_latency,
    p95Latency: row.p95_latency,
    p99Latency: row.p99_latency,
  };
}

function normalizeTimeSeriesPoint(row: MetricsTimeSeriesPointDto): TimeSeriesPoint {
  return {
    timestamp: row.timestamp || row.time_bucket || '',
    serviceName: row.service_name,
    operationName: row.operation_name,
    httpMethod: row.http_method,
    requestCount: row.request_count,
    errorCount: row.error_count,
    avgLatency: row.avg_latency,
  };
}

/**
 * Service wrapper for metrics endpoints.
 */
export const metricsService = {
  async getServiceMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ServiceMetric[]> {
    const rows = await getArrayResponse(`${BASE}/services/metrics`, serviceSummarySchema, {
      startTime,
      endTime,
    });
    return rows.map((row) => normalizeServiceMetric(row));
  },

  async getMetricsTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval?: string
  ): Promise<TimeSeriesPoint[]> {
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
    return rows.map((row) => normalizeTimeSeriesPoint(row));
  },

  async getMetricsSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<MetricsSummary> {
    const row = await getObjectResponse(`${BASE}/metrics/summary`, metricsSummarySchema, {
      startTime,
      endTime,
    });
    return {
      totalRequests: row.total_requests,
      errorCount: row.error_count,
      errorRate: row.error_rate,
      avgLatency: row.avg_latency,
      p95Latency: row.p95_latency,
      p99Latency: row.p99_latency,
    };
  },

  async getServiceTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = '5m'
  ): Promise<MetricsTimeSeriesPointDto[]> {
    return getArrayResponse(`${BASE}/services/timeseries`, metricsTimeSeriesPointSchema, {
      startTime,
      endTime,
      interval,
    });
  },

  async getServiceDependencies(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ServiceDependencyDto[]> {
    return getArrayResponse(`${BASE}/services/dependencies`, serviceDependencySchema, {
      startTime,
      endTime,
    });
  },

  async getServiceUpstreamDownstream(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string
  ): Promise<ServiceDependencyDetailDto[]> {
    return getArrayResponse(
      `${BASE}/services/${encodeURIComponent(serviceName)}/upstream-downstream`,
      serviceDependencyDetailSchema,
      { startTime, endTime }
    );
  },

  async getServiceDependencyGraph(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string
  ): Promise<ServiceDependencyGraphDto> {
    return getObjectResponse(
      `${BASE}/services/${encodeURIComponent(serviceName)}/dependency-graph`,
      serviceDependencyGraphSchema,
      { startTime, endTime }
    );
  },

  async getSpanAnalysis(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string
  ): Promise<SpanAnalysisRowDto[]> {
    return getArrayResponse(
      `${BASE}/services/${encodeURIComponent(serviceName)}/span-analysis`,
      spanAnalysisRowSchema,
      { startTime, endTime }
    );
  },

  async getServiceInfraMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string
  ): Promise<ServiceInfraMetricsDto> {
    return getObjectResponse(
      `${BASE}/services/${encodeURIComponent(serviceName)}/infrastructure`,
      serviceInfraMetricsSchema,
      { startTime, endTime }
    );
  },

  async getServiceErrorTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string
  ): Promise<ServiceErrorTimeSeriesDto[]> {
    return getArrayResponse(
      `${BASE}/services/${encodeURIComponent(serviceName)}/errors/timeseries`,
      serviceErrorTimeSeriesSchema,
      { startTime, endTime }
    );
  },

  async getEnrichedTopology(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<EnrichedTopologyDto> {
    return getObjectResponse(`${BASE}/services/topology/enriched`, enrichedTopologySchema, {
      startTime,
      endTime,
    });
  },

  async getTopologyClusters(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<TopologyClusterDto[]> {
    return getArrayResponse(`${BASE}/services/topology/clusters`, topologyClusterSchema, {
      startTime,
      endTime,
    });
  },

  async getEndpointBreakdown(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string
  ): Promise<EndpointMetricDto[]> {
    return getArrayResponse(
      `${BASE}/services/${encodeURIComponent(serviceName)}/endpoints`,
      endpointMetricSchema,
      { startTime, endTime }
    );
  },

  async getErrorGroups(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName: string
  ): Promise<ErrorGroupDto[]> {
    return getArrayResponse(
      `${BASE}/services/${encodeURIComponent(serviceName)}/errors`,
      errorGroupSchema,
      { startTime, endTime }
    );
  },

  async getGlobalErrorGroups(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {}
  ): Promise<ErrorGroupDto[]> {
    return getArrayResponse(`${BASE}/errors/groups`, errorGroupSchema, {
      startTime,
      endTime,
      ...params,
    });
  },

  async getErrorTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = '5m',
    serviceName?: string
  ): Promise<MetricsTimeSeriesPointDto[]> {
    return getArrayResponse(`${BASE}/errors/timeseries`, metricsTimeSeriesPointSchema, {
      startTime,
      endTime,
      interval,
      serviceName,
    });
  },

  async getAvgCPU(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<MetricNumericValue> {
    return getObjectResponse(
      `${BASE}/infrastructure/resource-utilisation/avg-cpu`,
      metricNumericValueSchema,
      { startTime, endTime }
    );
  },

  async getAvgMemory(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<MetricNumericValue> {
    return getObjectResponse(
      `${BASE}/infrastructure/resource-utilisation/avg-memory`,
      metricNumericValueSchema,
      { startTime, endTime }
    );
  },

  async getAvgNetwork(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<MetricNumericValue> {
    return getObjectResponse(
      `${BASE}/infrastructure/resource-utilisation/avg-network`,
      metricNumericValueSchema,
      { startTime, endTime }
    );
  },

  async getAvgConnPool(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<MetricNumericValue> {
    return getObjectResponse(
      `${BASE}/infrastructure/resource-utilisation/avg-conn-pool`,
      metricNumericValueSchema,
      { startTime, endTime }
    );
  },

  async getCPUUsagePercentage(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ResourceUsageTimeSeriesPointDto[]> {
    return getArrayResponse(
      `${BASE}/infrastructure/resource-utilisation/cpu-usage-percentage`,
      resourceUsageTimeSeriesPointSchema,
      { startTime, endTime }
    );
  },

  async getMemoryUsagePercentage(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ResourceUsageTimeSeriesPointDto[]> {
    return getArrayResponse(
      `${BASE}/infrastructure/resource-utilisation/memory-usage-percentage`,
      resourceUsageTimeSeriesPointSchema,
      { startTime, endTime }
    );
  },

  async getResourceUsageByService(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ResourceUsageByServiceRowDto[]> {
    return getArrayResponse(
      `${BASE}/infrastructure/resource-utilisation/by-service`,
      resourceUsageByServiceRowSchema,
      { startTime, endTime }
    );
  },

  async getResourceUsageByInstance(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ResourceUsageByInstanceRowDto[]> {
    return getArrayResponse(
      `${BASE}/infrastructure/resource-utilisation/by-instance`,
      resourceUsageByInstanceRowSchema,
      { startTime, endTime }
    );
  },

  async getNodeHealth(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/nodes`, { params: { startTime, endTime } });
  },

  async getNodeServices(
    _teamId: number | null,
    host: string,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/infrastructure/nodes/${encodeURIComponent(host)}/services`, {
      params: { startTime, endTime },
    });
  },

  async getOverviewServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ServiceSummary[]> {
    return getArrayResponse(`${BASE}/overview/services`, serviceSummarySchema, {
      startTime,
      endTime,
    });
  },

  async getOverviewEndpointMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<EndpointMetricDto[]> {
    return getArrayResponse(`${BASE}/overview/endpoints/metrics`, endpointMetricSchema, {
      startTime,
      endTime,
      serviceName,
    });
  },

  async getOverviewEndpointTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string
  ): Promise<MetricsTimeSeriesPointDto[]> {
    return getArrayResponse(`${BASE}/overview/endpoints/timeseries`, metricsTimeSeriesPointSchema, {
      startTime,
      endTime,
      serviceName,
    });
  },

  async getOverviewErrorGroups(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {}
  ): Promise<ErrorGroupDto[]> {
    return getArrayResponse(`${BASE}/overview/errors/groups`, errorGroupSchema, {
      startTime,
      endTime,
      ...params,
    });
  },

  async getServiceErrorRate(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m'
  ): Promise<MetricsTimeSeriesPointDto[]> {
    return getArrayResponse(
      `${BASE}/overview/errors/service-error-rate`,
      metricsTimeSeriesPointSchema,
      {
        startTime,
        endTime,
        serviceName,
        interval,
      }
    );
  },

  async getErrorVolume(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m'
  ): Promise<MetricsTimeSeriesPointDto[]> {
    return getArrayResponse(`${BASE}/overview/errors/error-volume`, metricsTimeSeriesPointSchema, {
      startTime,
      endTime,
      serviceName,
      interval,
    });
  },

  async getLatencyDuringErrorWindows(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    serviceName?: string,
    interval = '5m'
  ): Promise<MetricsTimeSeriesPointDto[]> {
    return getArrayResponse(
      `${BASE}/overview/errors/latency-during-error-windows`,
      metricsTimeSeriesPointSchema,
      {
        startTime,
        endTime,
        serviceName,
        interval,
      }
    );
  },
};
