export /**
        *
        */
const normalizeMetricSummary = (summary: any = {}) => ({
    ...summary,
    total_requests: Number(summary.total_requests ?? summary.totalRequests ?? 0),
    error_count: Number(summary.error_count ?? summary.errorCount ?? 0),
    error_rate: Number(summary.error_rate ?? summary.errorRate ?? 0),
    avg_latency: Number(summary.avg_latency ?? summary.avgLatency ?? 0),
    p95_latency: Number(summary.p95_latency ?? summary.p95Latency ?? 0),
    p99_latency: Number(summary.p99_latency ?? summary.p99Latency ?? 0),
});

export /**
        *
        */
const normalizeTimeSeriesPoint = (point: any = {}) => ({
    ...point,
    timestamp: point.timestamp ?? point.time_bucket ?? point.timeBucket ?? '',
    request_count: Number(point.request_count ?? point.requestCount ?? 0),
    error_count: Number(point.error_count ?? point.errorCount ?? 0),
    avg_latency: Number(point.avg_latency ?? point.avgLatency ?? 0),
    p50: Number(point.p50 ?? point.p50_latency ?? point.p50Latency ?? 0),
    p95: Number(point.p95 ?? point.p95_latency ?? point.p95Latency ?? 0),
    p99: Number(point.p99 ?? point.p99_latency ?? point.p99Latency ?? 0),
});

export /**
        *
        */
const normalizeServiceMetric = (metric: any = {}) => ({
    ...metric,
    service_name: metric.service_name ?? metric.serviceName ?? metric.name ?? '',
    request_count: Number(metric.request_count ?? metric.requestCount ?? 0),
    error_count: Number(metric.error_count ?? metric.errorCount ?? 0),
    avg_latency: Number(metric.avg_latency ?? metric.avgLatency ?? 0),
    p50_latency: Number(metric.p50_latency ?? metric.p50Latency ?? 0),
    p95_latency: Number(metric.p95_latency ?? metric.p95Latency ?? 0),
    p99_latency: Number(metric.p99_latency ?? metric.p99Latency ?? 0),
});

export /**
        *
        */
const normalizeEndpointMetric = (metric: any = {}) => ({
    ...metric,
    service_name: metric.service_name ?? metric.serviceName ?? '',
    operation_name: metric.operation_name ?? metric.operationName ?? '',
    http_method: metric.http_method ?? metric.httpMethod ?? '',
    request_count: Number(metric.request_count ?? metric.requestCount ?? 0),
    error_count: Number(metric.error_count ?? metric.errorCount ?? 0),
    avg_latency: Number(metric.avg_latency ?? metric.avgLatency ?? 0),
    p50_latency: Number(metric.p50_latency ?? metric.p50Latency ?? 0),
    p95_latency: Number(metric.p95_latency ?? metric.p95Latency ?? 0),
    p99_latency: Number(metric.p99_latency ?? metric.p99Latency ?? 0),
});
