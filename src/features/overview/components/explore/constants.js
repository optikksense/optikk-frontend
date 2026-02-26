export const METRIC_OPTIONS = [
    { label: 'Request Count', value: 'request_count' },
    { label: 'Error Count', value: 'error_count' },
    { label: 'Average Latency (ms)', value: 'avg_latency' },
    { label: 'P50 Latency (ms)', value: 'p50' },
    { label: 'P95 Latency (ms)', value: 'p95' },
    { label: 'P99 Latency (ms)', value: 'p99' },
];

export const DEFAULT_METRICS_QUERY = {
    operation: 'ratio',
    metricA: 'error_count',
    metricB: 'request_count',
    service: '',
};

export const DEFAULT_TRACES_QUERY = {
    expression: 'http.status_code=500 AND service=cart AND duration>1s',
    limit: 50,
};
