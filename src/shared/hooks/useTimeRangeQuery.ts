import {
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import type { TimeRange } from "@shared/types";

import {
  useTimeRange as useAppStoreTimeRange,
  useResolvedTimeBounds,
  useTenantId,
} from "@app/store/appStore";
import { retryUnlessClientError } from "./useStandardQuery";

type QueryTime = string | number;

interface TimeRangeBounds {
  startTime: QueryTime;
  endTime: QueryTime;
}

type TimeRangeQueryFunction<TData> = (
  tenantId: number | null,
  startTime: QueryTime,
  endTime: QueryTime,
  signal: AbortSignal
) => Promise<TData>;

type TimeRangeQueryOptions<TData> = Omit<
  UseQueryOptions<TData, Error, TData, QueryKey>,
  "queryKey" | "queryFn"
> & {
  extraKeys?: QueryKey;
};

/**
 * Time-scoped variant of the standard query wrapper. Follows the same key
 * convention (see useStandardQuery): tenantId last, bounds from the store,
 * refresh handled by the app-level subscriber via invalidation.
 */
export function useTimeRangeQuery<TData = unknown>(
  key: string,
  queryFn: TimeRangeQueryFunction<TData>,
  options: TimeRangeQueryOptions<TData> = {}
): UseQueryResult<TData, Error> {
  const selectedTenantId = useTenantId();
  const { startTime, endTime } = useResolvedTimeBounds();
  const { extraKeys = [], enabled, ...queryOptions } = options;

  return useQuery<TData, Error>({
    queryKey: ["component-query", key, startTime, endTime, ...extraKeys, selectedTenantId],
    queryFn: async ({ signal }): Promise<TData> =>
      queryFn(selectedTenantId, startTime, endTime, signal),
    enabled: Boolean(selectedTenantId) && enabled !== false,
    staleTime: 30_000,
    gcTime: 30_000,
    placeholderData: keepPreviousData,
    retry: retryUnlessClientError,
    ...queryOptions,
  });
}

export function useTimeRange(): {
  selectedTenantId: number | null;
  timeRange: TimeRange;
  getTimeRange: () => TimeRangeBounds;
} {
  const selectedTenantId = useTenantId();
  const timeRange = useAppStoreTimeRange();
  const bounds = useResolvedTimeBounds();

  return {
    selectedTenantId,
    timeRange,
    getTimeRange: (): TimeRangeBounds => bounds,
  };
}
