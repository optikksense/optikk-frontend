import { useMemo } from 'react';

import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';
import { metricsService } from '@shared/api/metricsService';
import type { ErrorGroupDto } from '@shared/api/schemas/metricsSchemas';

import type { ServiceErrorGroup } from '../types';

function normalize(dto: ErrorGroupDto): ServiceErrorGroup {
  return {
    serviceName: dto.service_name,
    operationName: dto.operation_name,
    statusMessage: dto.status_message,
    httpStatusCode: dto.http_status_code,
    errorCount: dto.error_count,
    lastOccurrence: dto.last_occurrence,
    firstOccurrence: dto.first_occurrence,
    sampleTraceId: dto.sample_trace_id,
  };
}

export function useServiceErrors(serviceName: string, enabled: boolean) {
  const { data: raw, isLoading } = useTimeRangeQuery<ErrorGroupDto[]>(
    'service-errors',
    (teamId, startTime, endTime) =>
      metricsService.getErrorGroups(teamId, startTime, endTime, serviceName),
    { extraKeys: [serviceName], enabled: enabled && serviceName.length > 0 }
  );

  const errorGroups: ServiceErrorGroup[] = useMemo(
    () => (raw ?? []).map(normalize),
    [raw]
  );

  return { errorGroups, isLoading };
}
