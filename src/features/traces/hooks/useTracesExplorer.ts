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

  return {
    state,
    query,
    traces: query.data?.traces ?? [],
    nextCursor: query.data?.nextCursor ?? null,
    summary: query.data?.summary,
    warnings: query.data?.warnings ?? [],
  };
}
