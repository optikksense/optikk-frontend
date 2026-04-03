import { useMemo } from 'react';

import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';
import { metricsService, type TimeSeriesPoint } from '@shared/api/metricsService';

import type { ServiceTimeSeriesPoint } from '../types';

function normalize(p: TimeSeriesPoint): ServiceTimeSeriesPoint {
  return {
    timestamp: p.timestamp,
    requestCount: p.requestCount,
    errorCount: p.errorCount,
    avgLatencyMs: p.avgLatency,
    p50Ms: 0, // not returned by the timeseries endpoint yet
    p95Ms: 0,
    p99Ms: 0,
  };
}

export function useServiceTimeSeries(serviceName: string, interval = '5m') {
  const { data: raw, isLoading } = useTimeRangeQuery<TimeSeriesPoint[]>(
    'service-timeseries',
    (teamId, startTime, endTime) =>
      metricsService.getMetricsTimeSeries(teamId, startTime, endTime, serviceName, interval),
    { extraKeys: [serviceName, interval], enabled: serviceName.length > 0 }
  );

  const timeSeries: ServiceTimeSeriesPoint[] = useMemo(
    () => (raw ?? []).map(normalize),
    [raw]
  );

  const requestSparkline = useMemo(
    () => timeSeries.map((p) => p.requestCount),
    [timeSeries]
  );

  const errorRateSparkline = useMemo(
    () =>
      timeSeries.map((p) =>
        p.requestCount > 0 ? (p.errorCount / p.requestCount) * 100 : 0
      ),
    [timeSeries]
  );

  const avgLatencySparkline = useMemo(
    () => timeSeries.map((p) => p.avgLatencyMs),
    [timeSeries]
  );

  return {
    timeSeries,
    requestSparkline,
    errorRateSparkline,
    avgLatencySparkline,
    isLoading,
  };
}
