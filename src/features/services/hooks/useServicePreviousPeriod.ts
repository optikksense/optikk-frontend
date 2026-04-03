import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '@store/appStore';
import { resolveTimeRangeBounds, timeRangeDurationMs } from '@/types';
import { metricsService, type ServiceMetric, type TimeSeriesPoint } from '@shared/api/metricsService';

export function useServicePreviousPeriod(serviceName: string) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const currentBounds = resolveTimeRangeBounds(timeRange);
  const durationMs = timeRangeDurationMs(timeRange);
  const prevStartTime = currentBounds.startTime - durationMs;
  const prevEndTime = currentBounds.startTime;

  const rangeKey =
    timeRange.kind === 'relative' ? timeRange.preset : `${timeRange.startMs}-${timeRange.endMs}`;

  // Previous period aggregate stats
  const { data: prevMetrics } = useQuery<ServiceMetric[]>({
    queryKey: ['service-prev-stats', selectedTeamId, rangeKey, serviceName, refreshKey],
    queryFn: () =>
      metricsService.getServiceMetrics(selectedTeamId, prevStartTime, prevEndTime),
    enabled: !!selectedTeamId && serviceName.length > 0,
    staleTime: 60_000,
  });

  // Previous period timeseries
  const { data: prevTimeSeries } = useQuery<TimeSeriesPoint[]>({
    queryKey: ['service-prev-timeseries', selectedTeamId, rangeKey, serviceName, refreshKey],
    queryFn: () =>
      metricsService.getMetricsTimeSeries(
        selectedTeamId,
        prevStartTime,
        prevEndTime,
        serviceName,
        '5m'
      ),
    enabled: !!selectedTeamId && serviceName.length > 0,
    staleTime: 60_000,
  });

  const prevStats = useMemo(() => {
    if (!prevMetrics) return null;
    return prevMetrics.find((m) => m.serviceName === serviceName) ?? null;
  }, [prevMetrics, serviceName]);

  return {
    prevStats,
    prevTimeSeries: prevTimeSeries ?? [],
  };
}
