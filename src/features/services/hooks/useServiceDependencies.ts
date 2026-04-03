import { useMemo } from 'react';

import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';
import { metricsService } from '@shared/api/metricsService';
import type { ServiceDependencyDetailDto } from '@shared/api/schemas/metricsSchemas';

import type { ServiceDependencyDetail } from '../types';

function normalize(dto: ServiceDependencyDetailDto): ServiceDependencyDetail {
  return {
    source: dto.source,
    target: dto.target,
    callCount: dto.call_count,
    p95LatencyMs: dto.p95_latency_ms,
    errorRate: dto.error_rate,
    direction: dto.direction,
  };
}

export function useServiceDependencies(serviceName: string, enabled: boolean) {
  const { data: raw, isLoading } = useTimeRangeQuery<ServiceDependencyDetailDto[]>(
    'service-dependencies',
    (teamId, startTime, endTime) =>
      metricsService.getServiceUpstreamDownstream(teamId, startTime, endTime, serviceName),
    { extraKeys: [serviceName], enabled: enabled && serviceName.length > 0 }
  );

  const dependencies: ServiceDependencyDetail[] = useMemo(
    () => (raw ?? []).map(normalize),
    [raw]
  );

  const upstream = useMemo(
    () => dependencies.filter((d) => d.direction === 'upstream'),
    [dependencies]
  );

  const downstream = useMemo(
    () => dependencies.filter((d) => d.direction === 'downstream'),
    [dependencies]
  );

  return { dependencies, upstream, downstream, isLoading };
}
