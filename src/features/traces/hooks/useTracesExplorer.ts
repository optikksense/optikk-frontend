import { useMemo } from "react";

import { useExplorerQuery, useExplorerSubQuery } from "@shared/search/hooks/useExplorerQuery";
import { useExplorerState } from "@shared/search/hooks/useExplorerState";
import type { ExplorerIncludeFlag } from "@shared/search/types";

import { query, queryFacets, queryTrend } from "@shared/api/traces/tracesApi";
import type { TracesQueryResponse } from "@shared/api/traces/types";

interface UseTracesExplorerArgs {
  readonly include?: readonly ExplorerIncludeFlag[];
  readonly limit?: number;
  readonly enabled?: boolean;
}

/**
 * Composes `useExplorerState` (URL snapshot) + `useExplorerQuery` for the
 * traces scope. Pages consume this to get rows, cursor, filters, mode.
 */
export function useTracesExplorer(args: UseTracesExplorerArgs = {}) {
  const state = useExplorerState();
  const include = useMemo<readonly ExplorerIncludeFlag[]>(
    () => args.include ?? ["summary"],
    [args.include]
  );
  const explorerQuery = useExplorerQuery<TracesQueryResponse>({
    scope: "traces",
    filters: state.filters,
    cursor: state.cursor,
    limit: args.limit ?? 100,
    include,
    enabled: args.enabled,
    fetcher: query,
  });

  // The list response now carries trace-level aggregates directly; the query
  // service folds enrichment into /traces/query in one round trip.
  const enrichedTraces = useMemo(() => explorerQuery.data?.traces ?? [], [explorerQuery.data]);

  const facetsQuery = useExplorerSubQuery({
    scope: "traces",
    subKey: "facets",
    filters: state.filters,
    enabled: (args.enabled ?? true) && include.includes("facets"),
    fetcher: (req) => queryFacets({ ...req, limit: 0 }),
  });

  const trendQuery = useExplorerSubQuery({
    scope: "traces",
    subKey: "trend",
    filters: state.filters,
    enabled: (args.enabled ?? true) && (include.includes("trend") || include.includes("summary")),
    fetcher: (req) => queryTrend({ ...req, limit: 0 }),
  });

  const summary = useMemo(() => {
    if (!trendQuery.data) return undefined;
    const total = trendQuery.data.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
    const errors = trendQuery.data.reduce((sum, b) => sum + (Number(b.errors) || 0), 0);

    return { total, errors };
  }, [trendQuery.data]);

  const list = {
    results: enrichedTraces,
    isPending: explorerQuery.isPending && !explorerQuery.data,
    isError: explorerQuery.isError,
    error: explorerQuery.error,
    hasMore: !!explorerQuery.data?.nextCursor,
    nextCursor: explorerQuery.data?.nextCursor ?? null,
    pageSize: args.limit ?? 100,
    pageIndex: 0,
    refetch: () => explorerQuery.refetch(),
  };

  return {
    state,
    list,
    query: explorerQuery, // keep for compat temporarily
    facetsQuery, // keep for compat
    trendQuery, // keep for compat
    traces: enrichedTraces, // keep for compat
    nextCursor: explorerQuery.data?.nextCursor ?? null, // keep for compat
    summary,
    facets: facetsQuery.data,
    trend: trendQuery.data,
  };
}
