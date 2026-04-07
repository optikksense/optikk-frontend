import {
  keepPreviousData,
  useQuery,
  type QueryKey,
  type UseQueryResult,
} from '@tanstack/react-query';

import { resolveTimeRangeBounds, timeRangeDurationMs } from '@/types';
import { useTeamId, useTimeRange, useRefreshKey, useComparisonMode } from '@store/appStore';
import type { ComparisonMode } from '@shared/components/ui/TimeSelector/constants';

type QueryTime = string | number;

type ComparisonQueryFunction<TData> = (
  teamId: number | null,
  startTime: QueryTime,
  endTime: QueryTime
) => Promise<TData>;

function computeComparisonBounds(
  mode: ComparisonMode,
  startMs: number,
  endMs: number
): { startTime: number; endTime: number } | null {
  if (mode === 'off') return null;
  const duration = endMs - startMs;
  switch (mode) {
    case 'previous_period':
      return { startTime: startMs - duration, endTime: startMs };
    case 'previous_day':
      return { startTime: startMs - 86400000, endTime: endMs - 86400000 };
    case 'previous_week':
      return { startTime: startMs - 604800000, endTime: endMs - 604800000 };
    default:
      return null;
  }
}

interface UseComparisonQueryResult<TData> {
  primary: UseQueryResult<TData, Error>;
  comparison: UseQueryResult<TData, Error> | null;
  comparisonMode: ComparisonMode;
}

/**
 * Like useTimeRangeQuery but also fires a comparison query when comparison mode is active.
 * Use this for charts that should support overlay comparisons.
 */
export function useComparisonQuery<TData = unknown>(
  key: string,
  queryFn: ComparisonQueryFunction<TData>,
  options: { extraKeys?: QueryKey; enabled?: boolean } = {}
): UseComparisonQueryResult<TData> {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();
  const comparisonMode = useComparisonMode();
  const { extraKeys = [], enabled } = options;

  const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
  const rangeKey =
    timeRange.kind === 'relative' ? timeRange.preset : `${timeRange.startMs}-${timeRange.endMs}`;

  const isEnabled = Boolean(selectedTeamId) && enabled !== false;

  const primary = useQuery<TData, Error>({
    queryKey: [key, selectedTeamId, rangeKey, refreshKey, ...extraKeys],
    queryFn: async () => queryFn(selectedTeamId, startTime, endTime),
    enabled: isEnabled,
    staleTime: 0,
    gcTime: 30_000,
    refetchOnMount: 'always',
    placeholderData: keepPreviousData,
  });

  const comparisonBounds = computeComparisonBounds(
    comparisonMode,
    Number(startTime),
    Number(endTime)
  );

  const comparisonQuery = useQuery<TData, Error>({
    queryKey: [
      key,
      'comparison',
      selectedTeamId,
      rangeKey,
      comparisonMode,
      refreshKey,
      ...extraKeys,
    ],
    queryFn: async () => {
      if (!comparisonBounds) throw new Error('No comparison bounds');
      return queryFn(selectedTeamId, comparisonBounds.startTime, comparisonBounds.endTime);
    },
    enabled: isEnabled && comparisonBounds !== null,
    staleTime: 0,
    gcTime: 30_000,
    refetchOnMount: 'always',
    placeholderData: keepPreviousData,
  });

  return {
    primary,
    comparison: comparisonBounds ? comparisonQuery : null,
    comparisonMode,
  };
}
