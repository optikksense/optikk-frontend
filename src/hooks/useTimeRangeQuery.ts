import {
  keepPreviousData,
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { TimeRange } from '@/types';

import { useAppStore } from '@store/appStore';

type QueryTime = string | number;

interface TimeRangeBounds {
  startTime: QueryTime;
  endTime: QueryTime;
}

type TimeRangeQueryFunction<TData> = (
  teamId: number | null,
  startTime: QueryTime,
  endTime: QueryTime
) => Promise<TData>;

type TimeRangeQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData, QueryKey>,
  'queryKey' | 'queryFn'
> & {
  extraKeys?: QueryKey;
};

function getBounds(timeRange: TimeRange): TimeRangeBounds {
  if (timeRange.value === 'custom' && timeRange.startTime != null && timeRange.endTime != null) {
    return { startTime: timeRange.startTime, endTime: timeRange.endTime };
  }

  const endTime = Date.now();
  const startTime = endTime - (timeRange.minutes || 0) * 60 * 1000;
  return { startTime, endTime };
}

/**
 * Wraps React Query with team/time-range state from appStore.
 * @param key
 * @param queryFn
 * @param options
 */
export function useTimeRangeQuery<TData = unknown>(
  key: string,
  queryFn: TimeRangeQueryFunction<TData>,
  options: TimeRangeQueryOptions<TData> = {},
): UseQueryResult<TData, Error> {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const { extraKeys = [], enabled, ...queryOptions } = options;

  return useQuery<TData, Error>({
    queryKey: [key, selectedTeamId, timeRange.value, refreshKey, ...extraKeys],
    queryFn: async (): Promise<TData> => {
      const { startTime, endTime } = getBounds(timeRange);
      return queryFn(selectedTeamId, startTime, endTime);
    },
    enabled: Boolean(selectedTeamId) && enabled !== false,
    staleTime: 0,
    gcTime: 30_000,
    refetchOnMount: 'always',
    placeholderData: keepPreviousData,
    ...queryOptions,
  });
}

/**
 * Exposes time range state and a helper to compute current bounds.
 */
export function useTimeRange(): {
  selectedTeamId: number | null;
  timeRange: TimeRange;
  refreshKey: number;
  getTimeRange: () => TimeRangeBounds;
} {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  return {
    selectedTeamId,
    timeRange,
    refreshKey,
    getTimeRange: (): TimeRangeBounds => getBounds(timeRange),
  };
}
