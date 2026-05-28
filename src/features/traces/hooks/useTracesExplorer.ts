import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useMemo } from "react";

import { useExplorerQuery } from "@/features/explorer/hooks/useExplorerQuery";
import { useExplorerState } from "@/features/explorer/hooks/useExplorerState";
import type { ExplorerIncludeFlag } from "@/features/explorer/types";

import { tracesExplorerApi } from "../api/tracesExplorerApi";
import type { TracesQueryResponse } from "../types/trace";

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
  const query = useExplorerQuery<TracesQueryResponse>({
    scope: "traces",
    filters: state.filters,
    cursor: state.cursor,
    limit: args.limit ?? 50,
    include,
    enabled: args.enabled,
    fetcher: tracesExplorerApi.query,
  });

  const { startTime, endTime, teamId, refreshKey } = query;

  const needsFacets = include.includes("facets");
  const facetsQuery = useStandardQuery({
    queryKey: [
      "traces",
      "explorer",
      "facets",
      teamId ?? "none",
      refreshKey,
      startTime,
      endTime,
      JSON.stringify(state.filters),
    ],
    queryFn: () =>
      tracesExplorerApi.queryFacets({ startTime, endTime, filters: state.filters, limit: 0 }),
    enabled: (args.enabled ?? true) && needsFacets,
  });

  const needsTrend = include.includes("trend") || include.includes("summary");
  const trendQuery = useStandardQuery({
    queryKey: [
      "traces",
      "explorer",
      "trend",
      teamId ?? "none",
      refreshKey,
      startTime,
      endTime,
      JSON.stringify(state.filters),
    ],
    queryFn: () =>
      tracesExplorerApi.queryTrend({ startTime, endTime, filters: state.filters, limit: 0 }),
    enabled: (args.enabled ?? true) && needsTrend,
  });

  const summary = useMemo(() => {
    if (!trendQuery.data) return undefined;
    const total = trendQuery.data.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
    const errors = trendQuery.data.reduce((sum, b) => sum + (Number(b.errors) || 0), 0);
    // ExplorerSummary expects { total: number, errors: number }
    return { total, errors };
  }, [trendQuery.data]);

  return {
    state,
    query,
    facetsQuery,
    trendQuery,
    traces: query.data?.traces ?? [],
    nextCursor: query.data?.nextCursor ?? null,
    summary,
    facets: facetsQuery.data,
    trend: trendQuery.data,
    warnings: query.data?.warnings ?? [],
  };
}
