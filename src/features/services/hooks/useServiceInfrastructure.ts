import { useMemo } from 'react';

import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';
import { metricsService } from '@shared/api/metricsService';
import type { ServiceInfraMetricsDto } from '@shared/api/schemas/metricsSchemas';

import type { ServiceInfraMetrics } from '../types';

function normalize(dto: ServiceInfraMetricsDto): ServiceInfraMetrics {
  return {
    serviceName: dto.service_name,
    avgCpuUtil: dto.avg_cpu_util,
    avgMemoryUtil: dto.avg_memory_util,
    avgDiskUtil: dto.avg_disk_util,
    avgNetworkUtil: dto.avg_network_util,
    avgConnPoolUtil: dto.avg_conn_pool_util,
    sampleCount: dto.sample_count,
  };
}

export function useServiceInfrastructure(serviceName: string, enabled: boolean) {
  const { data: raw, isLoading } = useTimeRangeQuery<ServiceInfraMetricsDto>(
    'service-infrastructure',
    (teamId, startTime, endTime) =>
      metricsService.getServiceInfraMetrics(teamId, startTime, endTime, serviceName),
    { extraKeys: [serviceName], enabled: enabled && serviceName.length > 0 }
  );

  const infra: ServiceInfraMetrics | null = useMemo(
    () => (raw ? normalize(raw) : null),
    [raw]
  );

  return { infra, isLoading };
}
