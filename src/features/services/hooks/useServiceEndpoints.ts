import { useMemo } from 'react';

import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';
import { metricsService } from '@shared/api/metricsService';
import type { EndpointMetricDto } from '@shared/api/schemas/metricsSchemas';

import type { ServiceEndpoint } from '../types';

function normalize(dto: EndpointMetricDto): ServiceEndpoint {
  const errorRate =
    dto.request_count > 0 ? (dto.error_count / dto.request_count) * 100 : 0;

  return {
    serviceName: dto.service_name,
    operationName: dto.operation_name,
    httpMethod: dto.http_method,
    requestCount: dto.request_count,
    errorCount: dto.error_count,
    errorRate,
    avgLatencyMs: dto.avg_latency,
    p95LatencyMs: dto.p95_latency,
    p99LatencyMs: dto.p99_latency,
  };
}

export function useServiceEndpoints(serviceName: string) {
  const { data: raw, isLoading } = useTimeRangeQuery<EndpointMetricDto[]>(
    'service-endpoints',
    (teamId, startTime, endTime) =>
      metricsService.getEndpointBreakdown(teamId, startTime, endTime, serviceName),
    { extraKeys: [serviceName], enabled: serviceName.length > 0 }
  );

  const endpoints: ServiceEndpoint[] = useMemo(
    () => (raw ?? []).map(normalize),
    [raw]
  );

  return { endpoints, isLoading };
}
