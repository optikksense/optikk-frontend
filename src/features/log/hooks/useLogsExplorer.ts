import { useCallback, useEffect, useMemo, useRef } from "react";

import { useExplorerState } from "@/features/explorer/hooks/useExplorerState";
import { resolveTimeBounds } from "@/features/explorer/utils/timeRange";
import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type LogsAnalyticsArgs,
  type LogsFacets,
  type LogsSummary,
  type LogsTrendBucket,
  getLogsFacets,
  getLogsSummary,
  getLogsTrend,
} from "../api/logsAnalyticsApi";
import { queryLogs } from "../api/logsQueryApi";
import { useLogsExplorerStore } from "../store/logsExplorerStore";
import type { LogRecord } from "../types/log";

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

  const pageIndex = useLogsExplorerStore((s) => s.pageIndex);
  const cursors = useLogsExplorerStore((s) => s.cursors);
  const hasMore = useLogsExplorerStore((s) => s.hasMore);
  const setPageResponse = useLogsExplorerStore((s) => s.setPageResponse);
  const resetPagination = useLogsExplorerStore((s) => s.resetPagination);

  const currentCursor = cursors[pageIndex];

  const filtersJson = useMemo(() => JSON.stringify(explorerState.filters), [explorerState.filters]);
  const timeRangeKey = useMemo(() => JSON.stringify(timeRange), [timeRange]);

  const listBaseKey = useMemo(
    () => ["logs", teamId ?? "none", timeRangeKey, filtersJson] as const,
    [teamId, timeRangeKey, filtersJson]
  );

  const analyticsBaseKey = useMemo(
    () => ["logs-analytics", teamId ?? "none", refreshKey, timeRangeKey, filtersJson] as const,
    [teamId, refreshKey, timeRangeKey, filtersJson]
  );

  const prevListBaseKeyRef = useRef(listBaseKey);
  useEffect(() => {
    const prev = prevListBaseKeyRef.current;
    if (prev[1] !== listBaseKey[1] || prev[2] !== listBaseKey[2] || prev[3] !== listBaseKey[3]) {
      prevListBaseKeyRef.current = listBaseKey;
      resetPagination();
    }
  }, [listBaseKey, resetPagination]);

  const buildAnalyticsArgs = useCallback((): LogsAnalyticsArgs => {
    const { startTime, endTime } = resolveTimeBounds(timeRange);
    return { startTime, endTime, filters: explorerState.filters };
  }, [timeRange, explorerState.filters]);

  const limit = args.limit ?? DEFAULT_PAGE_SIZE;

  const listQuery = useStandardQuery({
    queryKey: [...listBaseKey, "list", limit, currentCursor ?? "page0"],
    queryFn: () => {
      const analyticsArgs = buildAnalyticsArgs();
      return queryLogs({ ...analyticsArgs, cursor: currentCursor, limit });
    },
    enabled: args.enabled ?? true,
  });

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

  const summary = useStandardQuery<LogsSummary>({
    queryKey: [...analyticsBaseKey, "summary"],
    queryFn: () => getLogsSummary(buildAnalyticsArgs()),
    enabled: args.enabled ?? true,
  });

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

  return { state: explorerState, list, summary, trend, facets };
}

export type UseLogsExplorerReturn = ReturnType<typeof useLogsExplorer>;
