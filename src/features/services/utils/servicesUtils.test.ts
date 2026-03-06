import { describe, expect, it } from 'vitest';

import {
  calcRiskScore,
  getServiceStatus,
  normalizeServiceMetric,
  normalizeTimeSeriesPoint,
  normalizeTopologyEdge,
  normalizeTopologyNode,
} from './servicesUtils';

describe('services utils', () => {
  it('normalizes service and time series metrics', () => {
    expect(
      normalizeServiceMetric({
        name: 'checkout',
        requestCount: '500',
        errorCount: '5',
        avgLatency: '20',
        p50Latency: '12',
        p95Latency: '50',
        p99Latency: '75',
      }),
    ).toMatchObject({
      service_name: 'checkout',
      request_count: 500,
      error_count: 5,
      avg_latency: 20,
      p50_latency: 12,
      p95_latency: 50,
      p99_latency: 75,
    });

    expect(
      normalizeTimeSeriesPoint({
        time_bucket: '2026-03-01T10:00:00.000Z',
        serviceName: 'checkout',
        operationName: 'POST /pay',
        httpMethod: 'POST',
        requestCount: '100',
        errorCount: '3',
        avgLatency: '22',
        p50Latency: '11',
        p95_latency: '42',
        p99_latency: '60',
      }),
    ).toMatchObject({
      timestamp: '2026-03-01T10:00:00.000Z',
      service_name: 'checkout',
      operation_name: 'POST /pay',
      http_method: 'POST',
      request_count: 100,
      error_count: 3,
      avg_latency: 22,
      p50: 11,
      p95: 42,
      p99: 60,
    });
  });

  it('normalizes topology nodes and edges', () => {
    expect(
      normalizeTopologyNode({
        serviceName: 'orders',
        request_count: '120',
        error_rate: '0.8',
        avg_latency: '15',
      }),
    ).toMatchObject({
      name: 'orders',
      requestCount: 120,
      errorRate: 0.8,
      avgLatency: 15,
      status: '',
    });

    expect(
      normalizeTopologyEdge({
        source_service: 'frontend',
        targetService: 'orders',
        call_count: '44',
        avg_latency: '18',
        errorRate: '1.4',
      }),
    ).toMatchObject({
      source: 'frontend',
      target: 'orders',
      callCount: 44,
      avgLatency: 18,
      errorRate: 1.4,
    });
  });

  it('classifies service health and computes weighted risk scores', () => {
    expect(getServiceStatus(0.5)).toBe('healthy');
    expect(getServiceStatus(3)).toBe('degraded');
    expect(getServiceStatus(8)).toBe('unhealthy');

    expect(calcRiskScore({ errorRate: 2, avgLatency: 160, dependencyCount: 3 })).toBe(17.4);
    expect(calcRiskScore({ errorRate: 99, avgLatency: 99_999, dependencyCount: 99 })).toBe(100);
  });
});
