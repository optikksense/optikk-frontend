import { describe, expect, it } from 'vitest';

import { calculateTrends } from './trendCalculators';

function point(requestCount, errorCount) {
  return { request_count: requestCount, error_count: errorCount };
}

describe('calculateTrends', () => {
  it('returns zero trends when there is not enough data', () => {
    expect(calculateTrends([])).toEqual({ requestTrend: 0, errorTrend: 0 });
    expect(calculateTrends([point(10, 1)])).toEqual({ requestTrend: 0, errorTrend: 0 });
  });

  it('computes request and error rate trends from older versus recent windows', () => {
    const metrics = [
      ...new Array(10).fill(null).map(() => point(100, 1)),
      ...new Array(10).fill(null).map(() => point(150, 6)),
    ];

    const result = calculateTrends(metrics);

    expect(result.requestTrend).toBeCloseTo(50, 5);
    expect(result.errorTrend).toBeCloseTo(300, 5);
  });

  it('handles zero-volume baselines without dividing by zero', () => {
    const metrics = [
      ...new Array(10).fill(null).map(() => point(0, 0)),
      ...new Array(10).fill(null).map(() => point(25, 2)),
    ];

    expect(calculateTrends(metrics)).toEqual({ requestTrend: 0, errorTrend: 0 });
  });
});
