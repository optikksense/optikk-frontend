import { describe, expect, it } from 'vitest';

import { buildOverviewSparklines, buildOverviewSummary } from './summary';

describe('overview summary helpers', () => {
  it('derives summary cards from overview services data', () => {
    expect(
      buildOverviewSummary([
        {
          service_name: 'checkout-service',
          request_count: 10,
          error_count: 2,
          avg_latency: 120,
          p95_latency: 200,
          p99_latency: 250,
        },
        {
          service_name: 'inventory-service',
          request_count: 30,
          error_count: 3,
          avg_latency: 40,
          p95_latency: 80,
          p99_latency: 120,
        },
      ]),
    ).toEqual({
      total_requests: 40,
      error_count: 5,
      error_rate: 12.5,
      avg_latency: 60,
      p95_latency: 200,
      p99_latency: 250,
    });
  });

  it('builds safe zero summaries for empty service windows', () => {
    expect(buildOverviewSummary([])).toEqual({
      total_requests: 0,
      error_count: 0,
      error_rate: 0,
      avg_latency: 0,
      p95_latency: 0,
      p99_latency: 0,
    });
  });

  it('builds request, error-rate, and latency sparklines from metrics timeseries', () => {
    expect(
      buildOverviewSparklines([
        { timestamp: '2026-03-01T10:00:00Z', request_count: 10, error_count: 1, avg_latency: 50, p50: 0, p95: 0, p99: 0 },
        { timestamp: '2026-03-01T10:05:00Z', request_count: 0, error_count: 0, avg_latency: 65, p50: 0, p95: 0, p99: 0 },
        { timestamp: '2026-03-01T10:10:00Z', request_count: 5, error_count: 2, avg_latency: 80, p50: 0, p95: 0, p99: 0 },
      ]),
    ).toEqual({
      requests: [10, 0, 5],
      errors: [10, 0, 40],
      latency: [50, 65, 80],
    });
  });
});
