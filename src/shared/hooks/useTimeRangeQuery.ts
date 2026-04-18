import {
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import type { TimeRange } from "@/types";
import { resolveTimeRangeBounds } from "@/types";

import { useTimeRange as useAppStoreTimeRange, useRefreshKey, useTeamId } from "@store/appStore";
import { useInvalidateQueriesOnAppRefresh } from "./useInvalidateQueriesOnAppRefresh";

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
  "queryKey" | "queryFn"
> & {
  extraKeys?: QueryKey;
};

function getBounds(timeRange: TimeRange): TimeRangeBounds {
  const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
  return { startTime, endTime };
}

/** Stable key for cache invalidation */
function rangeKey(timeRange: TimeRange): string {
  if (timeRange.kind === "relative") return timeRange.preset;
  return `${timeRange.startMs}-${timeRange.endMs}`;
}

/**
 * Wraps React Query with team/time-range state from appStore.
 */
export function useTimeRangeQuery<TData = unknown>(
  key: string,
  queryFn: TimeRangeQueryFunction<TData>,
  options: TimeRangeQueryOptions<TData> = {}
): UseQueryResult<TData, Error> {
  const selectedTeamId = useTeamId();
  const timeRange = useAppStoreTimeRange();
  const refreshKey = useRefreshKey();
  const { extraKeys = [], enabled, ...queryOptions } = options;

  useInvalidateQueriesOnAppRefresh(refreshKey, "component-query", selectedTeamId);

  return useQuery<TData, Error>({
    queryKey: ["component-query", selectedTeamId, key, rangeKey(timeRange), ...extraKeys],
    queryFn: async (): Promise<TData> => {
      const { startTime, endTime } = getBounds(timeRange);
      return queryFn(selectedTeamId, startTime, endTime);
    },
    enabled: Boolean(selectedTeamId) && enabled !== false,
    staleTime: 30_000,
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
  const selectedTeamId = useTeamId();
  const timeRange = useAppStoreTimeRange();
  const refreshKey = useRefreshKey();

  return {
    selectedTeamId,
    timeRange,
    refreshKey,
    getTimeRange: (): TimeRangeBounds => getBounds(timeRange),
  };
}
