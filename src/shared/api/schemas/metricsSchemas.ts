import { z } from 'zod';

const numericValue = z.coerce.number().default(0);
const stringValue = z.string().default('');

export const metricNumericValueSchema = z
  .object({
    value: numericValue,
  })
  .strict();

export const metricsTimeSeriesPointSchema = z
  .object({
    timestamp: stringValue,
    time_bucket: stringValue.optional(),
    service_name: stringValue,
    operation_name: stringValue,
    http_method: stringValue,
    request_count: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
    avg_latency: numericValue,
    p50_latency: numericValue,
    p95_latency: numericValue,
    p99_latency: numericValue,
    value: numericValue,
  })
  .strict();

export const endpointMetricSchema = z
  .object({
    service_name: stringValue,
    operation_name: stringValue,
    endpoint_name: stringValue.optional(),
    http_method: stringValue,
    request_count: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
    avg_latency: numericValue,
    p50_latency: numericValue,
    p95_latency: numericValue,
    p99_latency: numericValue,
  })
  .strict();

export const errorGroupSchema = z
  .object({
    group_id: stringValue,
    service_name: stringValue,
    operation_name: stringValue,
    status_message: stringValue,
    http_status_code: numericValue,
    error_count: numericValue,
    last_occurrence: stringValue,
    first_occurrence: stringValue,
    sample_trace_id: stringValue,
  })
  .strict();

export const serviceDependencySchema = z
  .object({
    source: stringValue,
    target: stringValue,
    call_count: numericValue,
    avg_latency: numericValue,
    error_rate: numericValue,
  })
  .strict();

export const resourceUsageTimeSeriesPointSchema = z
  .object({
    timestamp: stringValue,
    pod: stringValue,
    value: numericValue,
  })
  .strict();

export const resourceUsageByServiceRowSchema = z
  .object({
    service_name: stringValue,
    avg_cpu_util: numericValue,
    avg_memory_util: numericValue,
    avg_disk_util: numericValue,
    avg_network_util: numericValue,
    avg_connection_pool_util: numericValue,
    sample_count: numericValue,
  })
  .strict();

export const resourceUsageByInstanceRowSchema = z
  .object({
    host: stringValue,
    pod: stringValue,
    container: stringValue,
    service_name: stringValue,
    avg_cpu_util: numericValue,
    avg_memory_util: numericValue,
    avg_connection_pool_util: numericValue,
  })
  .strict();

export type MetricNumericValue = z.infer<typeof metricNumericValueSchema>;
export type MetricsTimeSeriesPointDto = z.infer<typeof metricsTimeSeriesPointSchema>;
export type EndpointMetricDto = z.infer<typeof endpointMetricSchema>;
export type ErrorGroupDto = z.infer<typeof errorGroupSchema>;
export type ServiceDependencyDto = z.infer<typeof serviceDependencySchema>;

export const serviceDependencyDetailSchema = z
  .object({
    source: stringValue,
    target: stringValue,
    call_count: numericValue,
    p95_latency_ms: numericValue,
    error_rate: numericValue,
    direction: z.enum(['upstream', 'downstream']),
  })
  .strict();

export type ServiceDependencyDetailDto = z.infer<typeof serviceDependencyDetailSchema>;

export const topologyNodeSchema = z
  .object({
    name: stringValue,
    status: stringValue,
    request_count: numericValue,
    error_rate: numericValue,
    avg_latency: numericValue,
  })
  .strict();

export const topologyEdgeSchema = z
  .object({
    source: stringValue,
    target: stringValue,
    call_count: numericValue,
    avg_latency: numericValue,
    p95_latency_ms: numericValue,
    error_rate: numericValue,
  })
  .strict();

export const serviceDependencyGraphSchema = z
  .object({
    center: stringValue,
    nodes: z.array(topologyNodeSchema),
    edges: z.array(topologyEdgeSchema),
  })
  .strict();

export type TopologyNodeDto = z.infer<typeof topologyNodeSchema>;
export type TopologyEdgeDto = z.infer<typeof topologyEdgeSchema>;
export type ServiceDependencyGraphDto = z.infer<typeof serviceDependencyGraphSchema>;

export const enrichedTopologyNodeSchema = topologyNodeSchema
  .extend({
    service_type: stringValue,
    sparkline: z.array(numericValue),
  })
  .strict();

export const enrichedTopologySchema = z
  .object({
    nodes: z.array(enrichedTopologyNodeSchema),
    edges: z.array(topologyEdgeSchema),
  })
  .strict();

export type EnrichedTopologyNodeDto = z.infer<typeof enrichedTopologyNodeSchema>;
export type EnrichedTopologyDto = z.infer<typeof enrichedTopologySchema>;

export const topologyClusterSchema = z
  .object({
    name: stringValue,
    services: z.array(stringValue),
    count: numericValue,
  })
  .strict();

export type TopologyClusterDto = z.infer<typeof topologyClusterSchema>;

export const spanAnalysisRowSchema = z
  .object({
    span_kind: stringValue,
    operation_name: stringValue,
    span_count: numericValue,
    total_duration: numericValue,
    avg_duration: numericValue,
    p95_duration: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
  })
  .strict();

export type SpanAnalysisRowDto = z.infer<typeof spanAnalysisRowSchema>;

export const serviceErrorTimeSeriesSchema = z
  .object({
    service_name: stringValue,
    timestamp: stringValue,
    total_count: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
  })
  .strict();

export type ServiceErrorTimeSeriesDto = z.infer<typeof serviceErrorTimeSeriesSchema>;

export const serviceInfraMetricsSchema = z
  .object({
    service_name: stringValue,
    avg_cpu_util: numericValue,
    avg_memory_util: numericValue,
    avg_disk_util: numericValue,
    avg_network_util: numericValue,
    avg_conn_pool_util: numericValue,
    sample_count: numericValue,
  })
  .strict();

export type ServiceInfraMetricsDto = z.infer<typeof serviceInfraMetricsSchema>;
export type ResourceUsageTimeSeriesPointDto = z.infer<typeof resourceUsageTimeSeriesPointSchema>;
export type ResourceUsageByServiceRowDto = z.infer<typeof resourceUsageByServiceRowSchema>;
export type ResourceUsageByInstanceRowDto = z.infer<typeof resourceUsageByInstanceRowSchema>;
