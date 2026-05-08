import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { useExplorerState } from "@features/explorer/hooks/useExplorerState";
import { resolveTimeBounds } from "@features/explorer/utils/timeRange";
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
import type { LogRecord, LogsQueryResponse } from "../types/log";

const DEFAULT_PAGE_SIZE = 100;

interface UseLogsExplorerArgs {
  readonly limit?: number;
  readonly enabled?: boolean;
}

/**
 * Logs explorer foundation — URL state + four parallel reads.
 *
 * - `list` uses `useInfiniteQuery` so the page can move through cursor-backed
 *   pages without losing already-loaded results. Pages flatten into `results`
 *   for aggregate helpers, while `pages` keeps the cursor pagination boundary.
 * - The peer endpoints (summary / trend / facets) intentionally stay
 *   independent so KPI strip / histogram / facet rail render as soon as
 *   each lands — bundling would gate the fastest by the slowest.
 */
export function useLogsExplorer(args: UseLogsExplorerArgs = {}) {
  const state = useExplorerState();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const filtersJson = useMemo(() => JSON.stringify(state.filters), [state.filters]);
  const baseKey = useMemo(
    () => ["logs", teamId ?? "none", refreshKey, startTime, endTime, filtersJson] as const,
    [teamId, refreshKey, startTime, endTime, filtersJson]
  );

  const analyticsArgs: LogsAnalyticsArgs = useMemo(
    () => ({ startTime, endTime, filters: state.filters }),
    [startTime, endTime, state.filters]
  );

  const limit = args.limit ?? DEFAULT_PAGE_SIZE;
  const listQuery = useInfiniteQuery<LogsQueryResponse, Error>({
    queryKey: [...baseKey, "list", limit],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      queryLogs({ ...analyticsArgs, cursor: pageParam as string | undefined, limit }),
    getNextPageParam: (last) => (last.hasMore ? last.cursor : undefined),
    enabled: args.enabled ?? true,
    staleTime: 5_000,
    retry: 2,
  });

  const flatResults: readonly LogRecord[] = useMemo(
    () => listQuery.data?.pages.flatMap((p) => p.results) ?? [],
    [listQuery.data?.pages]
  );
  const pages = useMemo(() => listQuery.data?.pages ?? [], [listQuery.data?.pages]);

  const loadMore = useCallback(async () => {
    if (listQuery.hasNextPage && !listQuery.isFetchingNextPage) {
      await listQuery.fetchNextPage();
    }
  }, [listQuery]);

  const list = {
    results: flatResults,
    pages,
    isPending: listQuery.isPending,
    isError: listQuery.isError,
    error: listQuery.error,
    isFetchingMore: listQuery.isFetchingNextPage,
    hasMore: listQuery.hasNextPage ?? false,
    pageSize: limit,
    refetch: () => listQuery.refetch(),
    loadMore,
  };

  const summary = useStandardQuery<LogsSummary>({
    queryKey: [...baseKey, "summary"],
    queryFn: () => getLogsSummary(analyticsArgs),
    enabled: args.enabled ?? true,
  });

  const trend = useStandardQuery<readonly LogsTrendBucket[]>({
    queryKey: [...baseKey, "trend"],
    queryFn: () => getLogsTrend(analyticsArgs),
    enabled: args.enabled ?? true,
  });

  const facets = useStandardQuery<LogsFacets>({
    queryKey: [...baseKey, "facets"],
    queryFn: () => getLogsFacets(analyticsArgs),
    enabled: args.enabled ?? true,
  });

  return { state, list, summary, trend, facets };
}

export type UseLogsExplorerReturn = ReturnType<typeof useLogsExplorer>;
