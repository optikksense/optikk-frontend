import { useExplorerQuery } from "@features/explorer/hooks/useExplorerQuery";
import { useExplorerState } from "@features/explorer/hooks/useExplorerState";
import type { ExplorerIncludeFlag } from "@features/explorer/types";

import { queryLogs } from "../api/logsExplorerApi";
import type { LogsQueryResponse } from "../types/log";

const DEFAULT_LIMIT = 100;

interface UseLogsExplorerArgs {
  readonly include?: readonly ExplorerIncludeFlag[];
  readonly limit?: number;
  readonly enabled?: boolean;
}

/**
 * Composes the explorer foundation (URL state + explorer query) for the logs
 * scope. Callers get:
 *   - snapshot of URL-synced filters / mode / cursor / detail
 *   - mutators for all of the above
 *   - TanStack Query state for the list endpoint
 *
 * Analytics + facets have their own hooks (keyed separately) so switching
 * between list / analytics tabs doesn't trash the list cache.
 */
export function useLogsExplorer(args: UseLogsExplorerArgs = {}) {
  const state = useExplorerState();
  const include = args.include ?? (["trend", "summary"] as const);

  const query = useExplorerQuery<LogsQueryResponse>({
    scope: "logs",
    filters: state.filters,
    cursor: state.cursor,
    limit: args.limit ?? DEFAULT_LIMIT,
    include,
    enabled: args.enabled,
    fetcher: queryLogs,
  });

  return {
    ...state,
    query,
  };
}

export type UseLogsExplorerReturn = ReturnType<typeof useLogsExplorer>;
