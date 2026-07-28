import { useEffect, useMemo } from "react";

import { useTenantId, useTimeRange } from "@app/store/appStore";
import { useExplorerQuery, useExplorerSubQuery } from "@shared/search/hooks/useExplorerQuery";
import { useExplorerState } from "@shared/search/hooks/useExplorerState";
import type { ExplorerFilter } from "@shared/search/types/filters";

import {
  type LogsFacets,
  type LogsSummary,
  type LogsTrendBucket,
  getLogsFacets,
  getLogsSummary,
  getLogsTrend,
} from "@shared/logs/api/logsAnalyticsApi";
import { queryLogs } from "@shared/logs/api/logsQueryApi";
import { useLogsExplorerStore } from "@shared/logs/store/logsExplorerStore";
import type { LogRecord } from "@shared/logs/types/log";

const DEFAULT_PAGE_SIZE = 100;
const EMPTY_FILTERS: readonly ExplorerFilter[] = [];

interface UseLogsExplorerArgs {
  readonly limit?: number;
  readonly enabled?: boolean;
                                                                              
  readonly baseFilters?: readonly ExplorerFilter[];
                                                                  
  readonly includeFacets?: boolean;
}

   
                                                              
   
export function useLogsExplorer(args: UseLogsExplorerArgs = {}) {
  const explorerState = useExplorerState();
  const tenantId = useTenantId();
  const timeRange = useTimeRange();

  const pageIndex = useLogsExplorerStore((s) => s.pageIndex);
  const cursors = useLogsExplorerStore((s) => s.cursors);
  const hasMore = useLogsExplorerStore((s) => s.hasMore);
  const setPageResponse = useLogsExplorerStore((s) => s.setPageResponse);
  const resetPagination = useLogsExplorerStore((s) => s.resetPagination);

  const currentCursor = cursors[pageIndex];

  const baseFilters = args.baseFilters ?? EMPTY_FILTERS;
  const includeFacets = args.includeFacets ?? true;
  const effectiveFilters = useMemo<readonly ExplorerFilter[]>(
    () =>
      baseFilters.length > 0 ? [...baseFilters, ...explorerState.filters] : explorerState.filters,
    [baseFilters, explorerState.filters]
  );

  const filtersJson = useMemo(() => JSON.stringify(effectiveFilters), [effectiveFilters]);
  const paginationScope = useMemo(
    () => JSON.stringify([tenantId, timeRange, filtersJson]),
    [tenantId, timeRange, filtersJson]
  );

  useEffect(() => {
    if (paginationScope) resetPagination();
  }, [paginationScope, resetPagination]);

  const limit = args.limit ?? DEFAULT_PAGE_SIZE;

  const listQuery = useExplorerQuery({
    scope: "logs",
    filters: effectiveFilters,
    cursor: currentCursor ?? null,
    limit,
    include: [],
    enabled: args.enabled,
    fetcher: queryLogs,
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

  const summary = useExplorerSubQuery<LogsSummary>({
    scope: "logs",
    subKey: "summary",
    filters: effectiveFilters,
    enabled: args.enabled ?? true,
    fetcher: (req) => getLogsSummary(req),
  });

  const trend = useExplorerSubQuery<readonly LogsTrendBucket[]>({
    scope: "logs",
    subKey: "trend",
    filters: effectiveFilters,
    enabled: args.enabled ?? true,
    fetcher: (req) => getLogsTrend(req),
  });

  const facets = useExplorerSubQuery<LogsFacets>({
    scope: "logs",
    subKey: "facets",
    filters: effectiveFilters,
    enabled: (args.enabled ?? true) && includeFacets,
    fetcher: (req) => getLogsFacets(req),
  });

  return { state: explorerState, list, summary, trend, facets };
}
