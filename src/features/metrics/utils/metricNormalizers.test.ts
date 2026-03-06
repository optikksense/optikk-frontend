import { describe, expect, it } from 'vitest';

import {
  normalizeEndpointMetric,
  normalizeMetricSummary,
  normalizeServiceMetric,
  normalizeTimeSeriesPoint,
} from './metricNormalizers';

describe('metric normalizers', () => {
  it('normalizes summary payloads from camelCase and snake_case APIs', () => {
    expect(
      normalizeMetricSummary({
        totalRequests: '120',
        error_count: '7',
        errorRate: '1.2',
        avgLatency: '22.5',
        p95_latency: '90',
        p99Latency: '120',
      }),
    ).toMatchObject({
      total_requests: 120,
      error_count: 7,
      error_rate: 1.2,
      avg_latency: 22.5,
      p95_latency: 90,
      p99_latency: 120,
    });
  });

  it('normalizes time series points and preserves original fields', () => {
    expect(
      normalizeTimeSeriesPoint({
        timeBucket: '2026-03-01T12:00:00.000Z',
        requestCount: '25',
        error_count: '2',
        avgLatency: '18',
        p50_latency: '8',
        p95Latency: '35',
        p99: '55',
        raw: 'keep-me',
      }),
    ).toEqual({
      timeBucket: '2026-03-01T12:00:00.000Z',
      requestCount: '25',
      avgLatency: '18',
      p50_latency: '8',
      p95Latency: '35',
      raw: 'keep-me',
      timestamp: '2026-03-01T12:00:00.000Z',
      request_count: 25,
      error_count: 2,
      avg_latency: 18,
      p50: 8,
      p95: 35,
      p99: 55,
    });
  });

  it('normalizes service and endpoint metrics with sensible defaults', () => {
    expect(
      normalizeServiceMetric({
        name: 'payments',
        requestCount: '100',
        errorCount: '4',
        avgLatency: '12',
        p50Latency: '5',
        p95Latency: '20',
        p99Latency: '30',
      }),
    ).toMatchObject({
      service_name: 'payments',
      request_count: 100,
      error_count: 4,
      avg_latency: 12,
      p50_latency: 5,
      p95_latency: 20,
      p99_latency: 30,
    });

    expect(
      normalizeEndpointMetric({
        serviceName: 'payments',
        operationName: 'CreateCharge',
        httpMethod: 'POST',
        requestCount: '100',
        errorCount: '2',
        avgLatency: '18',
      }),
    ).toMatchObject({
      service_name: 'payments',
      operation_name: 'CreateCharge',
      http_method: 'POST',
      request_count: 100,
      error_count: 2,
      avg_latency: 18,
      p50_latency: 0,
      p95_latency: 0,
      p99_latency: 0,
    });
  });
});
