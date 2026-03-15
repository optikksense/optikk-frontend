import type {
  MetricSummary,
  MetricTimeSeriesPoint,
  ServiceMetricPoint,
} from '@features/metrics/types';

export function buildOverviewSummary(services: ServiceMetricPoint[]): MetricSummary {
  const totalRequests = services.reduce((sum, service) => sum + Number(service.request_count || 0), 0);
  const errorCount = services.reduce((sum, service) => sum + Number(service.error_count || 0), 0);
  const weightedLatencySum = services.reduce(
    (sum, service) => sum + Number(service.avg_latency || 0) * Number(service.request_count || 0),
    0,
  );
  const p95Latency = services.reduce(
    (maxLatency, service) => Math.max(maxLatency, Number(service.p95_latency || 0)),
    0,
  );

  return {
    total_requests: totalRequests,
    error_count: errorCount,
    error_rate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
    avg_latency: totalRequests > 0 ? weightedLatencySum / totalRequests : 0,
    p95_latency: p95Latency,
    p99_latency: services.reduce(
      (maxLatency, service) => Math.max(maxLatency, Number(service.p99_latency || 0)),
      0,
    ),
  };
}

export function buildOverviewSparklines(timeseries: MetricTimeSeriesPoint[]): {
  requests: number[];
  errors: number[];
  latency: number[];
} {
  return {
    requests: timeseries.map((point) => Number(point.request_count || 0)),
    errors: timeseries.map((point) => {
      const total = Number(point.request_count || 0);
      const errors = Number(point.error_count || 0);
      return total > 0 ? (errors / total) * 100 : 0;
    }),
    latency: timeseries.map((point) => Number(point.avg_latency || 0)),
  };
}
