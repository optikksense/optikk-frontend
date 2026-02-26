export const normalizeServiceMetric = (service = {}) => ({
    ...service,
    service_name: service.service_name ?? service.serviceName ?? service.name ?? '',
    request_count: Number(service.request_count ?? service.requestCount ?? 0),
    error_count: Number(service.error_count ?? service.errorCount ?? 0),
    avg_latency: Number(service.avg_latency ?? service.avgLatency ?? 0),
    p50_latency: Number(service.p50_latency ?? service.p50Latency ?? 0),
    p95_latency: Number(service.p95_latency ?? service.p95Latency ?? 0),
    p99_latency: Number(service.p99_latency ?? service.p99Latency ?? 0),
});

export const normalizeTimeSeriesPoint = (point = {}) => ({
    ...point,
    timestamp: point.timestamp ?? point.time_bucket ?? point.timeBucket ?? '',
    service_name: point.service_name ?? point.serviceName ?? '',
    operation_name: point.operation_name ?? point.operationName ?? '',
    http_method: point.http_method ?? point.httpMethod ?? '',
    request_count: Number(point.request_count ?? point.requestCount ?? 0),
    error_count: Number(point.error_count ?? point.errorCount ?? 0),
    avg_latency: Number(point.avg_latency ?? point.avgLatency ?? 0),
    p50: Number(point.p50 ?? point.p50_latency ?? point.p50Latency ?? 0),
    p95: Number(point.p95 ?? point.p95_latency ?? point.p95Latency ?? 0),
    p99: Number(point.p99 ?? point.p99_latency ?? point.p99Latency ?? 0),
});

export const normalizeTopologyNode = (node = {}) => ({
    ...node,
    name: node.name ?? node.service_name ?? node.serviceName ?? '',
    requestCount: Number(node.requestCount ?? node.request_count ?? 0),
    errorRate: Number(node.errorRate ?? node.error_rate ?? 0),
    avgLatency: Number(node.avgLatency ?? node.avg_latency ?? 0),
    status: node.status ?? '',
});

export const normalizeTopologyEdge = (edge = {}) => ({
    ...edge,
    source: edge.source ?? edge.source_service ?? edge.sourceService ?? '',
    target: edge.target ?? edge.target_service ?? edge.targetService ?? '',
    callCount: Number(edge.callCount ?? edge.call_count ?? 0),
    avgLatency: Number(edge.avgLatency ?? edge.avg_latency ?? 0),
    errorRate: Number(edge.errorRate ?? edge.error_rate ?? 0),
});


export function getServiceStatus(errorRate) {
    if (errorRate > 5) return 'unhealthy';
    if (errorRate > 1) return 'degraded';
    return 'healthy';
}

export function calcRiskScore({ errorRate, avgLatency, dependencyCount }) {
    const errFactor = Math.min(errorRate * 12, 100);
    const latencyFactor = Math.min((avgLatency || 0) / 80, 100);
    const dependencyFactor = Math.min((dependencyCount || 0) * 8, 100);
    return Number((errFactor * 0.5 + latencyFactor * 0.3 + dependencyFactor * 0.2).toFixed(1));
}
