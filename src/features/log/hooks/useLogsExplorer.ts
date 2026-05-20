import { useCallback, useEffect, useMemo, useRef } from "react";

import { useTeamId, useTimeRange, useRefreshKey } from "@app/store/appStore";
import { useExplorerState } from "@features/explorer/hooks/useExplorerState";
import { resolveTimeBounds } from "@features/explorer/utils/timeRange";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type LogsAnalyticsArgs,
  type LogsFacets,
  type LogsTrendBucket,
  getLogsFacets,
  getLogsTrend,
} from "../api/logsAnalyticsApi";
import { queryLogs } from "../api/logsQueryApi";
import type { LogRecord } from "../types/log";
import { useLogsExplorerStore } from "../store/logsExplorerStore";

const DEFAULT_PAGE_SIZE = 100;

interface UseLogsExplorerArgs {
  readonly limit?: number;
  readonly enabled?: boolean;
}

/**
 * Logs explorer foundation — URL state + four parallel reads.
 *
 * ## Pagination strategy
 * Uses a single `useQuery` for the current page, with cursor state tracked
 * in the Zustand store. This avoids the `useInfiniteQuery` pitfalls:
 * - Auto-refresh only refetches the CURRENT page (one query)
 * - No opaque TanStack refetch-all-pages cascade
 * - Prev/Next uses TanStack cache for instant back-navigation
 *
 * ## Refresh strategy
 * Summary/trend/facets include `refreshKey` in their query key so they
 * refetch on every auto-refresh tick.
 * The list query does NOT include `refreshKey` — instead we invalidate
 * it explicitly so it refetches in-place without losing cursor state.
 * The `queryFn` resolves relative time bounds at call time.
 */
export function useLogsExplorer(args: UseLogsExplorerArgs = {}) {
  const explorerState = useExplorerState();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const timeRange = useTimeRange();


  // Zustand pagination state
  const pageIndex = useLogsExplorerStore((s) => s.pageIndex);
  const cursors = useLogsExplorerStore((s) => s.cursors);
  const hasMore = useLogsExplorerStore((s) => s.hasMore);
  const setPageResponse = useLogsExplorerStore((s) => s.setPageResponse);
  const resetPagination = useLogsExplorerStore((s) => s.resetPagination);

  const currentCursor = cursors[pageIndex];

  const filtersJson = useMemo(() => JSON.stringify(explorerState.filters), [explorerState.filters]);
  const timeRangeKey = useMemo(() => JSON.stringify(timeRange), [timeRange]);

  // Base key for the list query — stable across auto-refresh
  const listBaseKey = useMemo(
    () => ["logs", teamId ?? "none", timeRangeKey, filtersJson] as const,
    [teamId, timeRangeKey, filtersJson]
  );

  // Base key for analytics queries — includes refreshKey for auto-refresh
  const analyticsBaseKey = useMemo(
    () => ["logs-analytics", teamId ?? "none", refreshKey, timeRangeKey, filtersJson] as const,
    [teamId, refreshKey, timeRangeKey, filtersJson]
  );

  // Reset pagination when filters or time range change
  const prevListBaseKeyRef = useRef(listBaseKey);
  useEffect(() => {
    const prev = prevListBaseKeyRef.current;
    if (prev[1] !== listBaseKey[1] || prev[2] !== listBaseKey[2] || prev[3] !== listBaseKey[3]) {
      prevListBaseKeyRef.current = listBaseKey;
      resetPagination();
    }
  }, [listBaseKey, resetPagination]);

  // Analytics queries auto-refresh via refreshKey in their query key.
  // List queries do NOT auto-refresh — cursor pagination is tied to specific
  // time bounds and invalidation would shift the data window, corrupting cursors.

  // Build analytics args at fetch time — resolves relative time ranges
  // against the current clock so each refetch uses up-to-date bounds.
  const buildAnalyticsArgs = useCallback((): LogsAnalyticsArgs => {
    const { startTime, endTime } = resolveTimeBounds(timeRange);
    return { startTime, endTime, filters: explorerState.filters };
  }, [timeRange, explorerState.filters]);

  const limit = args.limit ?? DEFAULT_PAGE_SIZE;

  // Single-page list query: key includes cursor so each page is its own query.
  // Previous pages stay in TanStack cache for instant back-navigation.
  const listQuery = useStandardQuery({
    queryKey: [...listBaseKey, "list", limit, currentCursor ?? "page0"],
    queryFn: () => {
      const analyticsArgs = buildAnalyticsArgs();
      return queryLogs({ ...analyticsArgs, cursor: currentCursor, limit });
    },
    enabled: args.enabled ?? true,
  });

  // Record the response cursor ONLY when the data is fresh for THIS page.
  // `isPlaceholderData` is true when keepPreviousData is showing the old page's
  // data during a page transition — we must NOT record that stale cursor.
  const listData = listQuery.data;
  const isPlaceholder = listQuery.isPlaceholderData;
  useEffect(() => {
    if (listData && !isPlaceholder) {
      setPageResponse(listData.cursor, listData.hasMore);
    }
  }, [listData, isPlaceholder, setPageResponse]);

  const results: readonly LogRecord[] = listData?.results ?? [];

  const list = {
    results,
    isPending: listQuery.isPending && !listData,
    isError: listQuery.isError,
    error: listQuery.error,
    hasMore,
    pageSize: limit,
    pageIndex,
    pageCount: cursors.length,
    isFetchingMore: false,
    refetch: () => listQuery.refetch(),
  };

  const trend = useStandardQuery<readonly LogsTrendBucket[]>({
    queryKey: [...analyticsBaseKey, "trend"],
    queryFn: () => getLogsTrend(buildAnalyticsArgs()),
    enabled: args.enabled ?? true,
  });

  const facets = useStandardQuery<LogsFacets>({
    queryKey: [...analyticsBaseKey, "facets"],
    queryFn: () => getLogsFacets(buildAnalyticsArgs()),
    enabled: args.enabled ?? true,
  });

  return { state: explorerState, list, trend, facets };
}

export type UseLogsExplorerReturn = ReturnType<typeof useLogsExplorer>;
