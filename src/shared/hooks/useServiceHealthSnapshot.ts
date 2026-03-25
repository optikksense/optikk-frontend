import type { HealthStatus } from '@shared/components/ui/calm/HealthRing';
import type { ServiceHealthSummary } from '@shared/components/ui/calm/HealthSnapshotStrip';
import { metricsService } from '@shared/api/metricsService';

import { useTimeRangeQuery } from './useTimeRangeQuery';

function deriveStatus(errorRate: number, p95Latency: number): HealthStatus {
  if (errorRate >= 10 || p95Latency >= 5000) return 'critical';
  if (errorRate >= 2 || p95Latency >= 1000) return 'degraded';
  return 'healthy';
}

export function useServiceHealthSnapshot() {
  return useTimeRangeQuery<ServiceHealthSummary[]>(
    'service-health-summary',
    async (teamId, startTime, endTime) => {
      const metrics = await metricsService.getServiceMetrics(teamId, startTime, endTime);
      return metrics
        .filter((metric) => metric.serviceName)
        .map((metric) => ({
          name: metric.serviceName,
          status: deriveStatus(metric.errorRate, metric.p95Latency),
          rps: metric.requestCount > 0
            ? metric.requestCount / ((Number(endTime) - Number(startTime)) / 1000)
            : 0,
          errorPct: metric.errorRate,
          p95Ms: metric.p95Latency,
        }));
    },
    { staleTime: 30_000 },
  );
}
