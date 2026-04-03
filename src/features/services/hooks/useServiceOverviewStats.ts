import { useMemo } from 'react';

import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';
import { metricsService, type ServiceMetric } from '@shared/api/metricsService';

import { deriveHealthStatus, type ServiceOverviewStats } from '../types';

export function useServiceOverviewStats(serviceName: string) {
  const { data: allMetrics, isLoading } = useTimeRangeQuery<ServiceMetric[]>(
    'service-overview-stats',
    (teamId, startTime, endTime) =>
      metricsService.getServiceMetrics(teamId, startTime, endTime),
    { extraKeys: [serviceName], enabled: serviceName.length > 0 }
  );

  const stats: ServiceOverviewStats | null = useMemo(() => {
    if (!allMetrics) return null;
    const metric = allMetrics.find((m) => m.serviceName === serviceName);
    if (!metric) return null;

    const errorRate =
      metric.requestCount > 0 ? (metric.errorCount / metric.requestCount) * 100 : 0;

    return {
      serviceName: metric.serviceName,
      requestCount: metric.requestCount,
      errorCount: metric.errorCount,
      errorRate,
      avgLatencyMs: metric.avgLatency,
      p50LatencyMs: metric.p50Latency,
      p95LatencyMs: metric.p95Latency,
      p99LatencyMs: metric.p99Latency,
      healthStatus: deriveHealthStatus(errorRate),
    };
  }, [allMetrics, serviceName]);

  return { stats, isLoading };
}
