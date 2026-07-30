import { useMemo } from "react";

import { useTenantId } from "@app/store/appStore";
import { useCursorPager } from "@shared/search/hooks/useCursorPager";
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
import type { LogRecord } from "@shared/logs/types/log";

const DEFAULT_PAGE_SIZE = 100;
const EMPTY_FILTERS: readonly ExplorerFilter[] = [];

interface UseLogsExplorerArgs {
  readonly limit?: number;
  readonly enabled?: boolean;
  /** Always-applied scope (e.g. service lock) merged ahead of URL filters. */
  readonly baseFilters?: readonly ExplorerFilter[];
  /** Skip the facets read when there is no facet rail to feed. */
  readonly includeFacets?: boolean;
}

/**
 * Logs explorer foundation — URL state + four parallel reads.
 */
export function useLogsExplorer(args: UseLogsExplorerArgs = {}) {
  const explorerState = useExplorerState();
  const tenantId = useTenantId();

  const baseFilters = args.baseFilters ?? EMPTY_FILTERS;
  const includeFacets = args.includeFacets ?? true;
  const effectiveFilters = useMemo<readonly ExplorerFilter[]>(
    () =>
      baseFilters.length > 0 ? [...baseFilters, ...explorerState.filters] : explorerState.filters,
    [baseFilters, explorerState.filters]
  );

  const limit = args.limit ?? DEFAULT_PAGE_SIZE;

  const listQuery = useExplorerQuery({
    scope: "logs",
    filters: effectiveFilters,
    cursor: explorerState.cursor,
    limit,
    include: [],
    enabled: args.enabled,
    fetcher: queryLogs,
  });

  const listData = listQuery.data;
  const results: readonly LogRecord[] = listData?.results ?? [];
  const pager = useCursorPager(explorerState, listData?.hasMore ? listData.cursor : undefined, [
    tenantId,
    listQuery.startTime,
    listQuery.endTime,
    baseFilters,
  ]);

  const list = {
    results,
    isPending: listQuery.isPending && !listData,
    isError: listQuery.isError,
    error: listQuery.error,
    pageSize: limit,
    refetch: () => listQuery.refetch(),
    ...pager,
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
