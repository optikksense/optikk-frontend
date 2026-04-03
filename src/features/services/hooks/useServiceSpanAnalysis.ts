import { useMemo } from 'react';

import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';
import { metricsService } from '@shared/api/metricsService';
import type { SpanAnalysisRowDto } from '@shared/api/schemas/metricsSchemas';

import type { SpanAnalysisEntry } from '../types';

function normalize(dto: SpanAnalysisRowDto): SpanAnalysisEntry {
  return {
    spanKind: dto.span_kind,
    operationName: dto.operation_name,
    spanCount: dto.span_count,
    totalDurationMs: dto.total_duration,
    avgDurationMs: dto.avg_duration,
    p95DurationMs: dto.p95_duration,
    errorCount: dto.error_count,
    errorRate: dto.error_rate,
  };
}

export function useServiceSpanAnalysis(serviceName: string, enabled: boolean) {
  const { data: raw, isLoading } = useTimeRangeQuery<SpanAnalysisRowDto[]>(
    'service-span-analysis',
    (teamId, startTime, endTime) =>
      metricsService.getSpanAnalysis(teamId, startTime, endTime, serviceName),
    { extraKeys: [serviceName], enabled: enabled && serviceName.length > 0 }
  );

  const spans: SpanAnalysisEntry[] = useMemo(
    () => (raw ?? []).map(normalize),
    [raw]
  );

  return { spans, isLoading };
}
