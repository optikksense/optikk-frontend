import { useExplorerFacets } from "@features/explorer/hooks/useExplorerFacets";
import { useExplorerQuery } from "@features/explorer/hooks/useExplorerQuery";
import type { ExplorerFilter } from "@features/explorer/types";

import { queryLogs } from "../api/logsExplorerApi";
import { LOG_FIELD_LABELS } from "../config/facetFields";
import type { LogsQueryResponse } from "../types/log";

interface UseLogsFacetsArgs {
  readonly filters: readonly ExplorerFilter[];
  readonly enabled?: boolean;
}

/**
 * Facets are a *separate* query key from the main list so the rail doesn't
 * refetch every page-turn, and a filter change invalidates both in one pass.
 *
 * Backend: `POST /api/v1/logs/query` with `include:["facets"]` + `limit:0`.
 * Repository branch: `repo_facets.go` (hits `logs_facets_rollup_5m` for
 * wide-window HLL counts — see plan §A.2).
 */
export function useLogsFacets(args: UseLogsFacetsArgs) {
  const query = useExplorerQuery<LogsQueryResponse>({
    scope: "logs",
    filters: args.filters,
    cursor: null,
    limit: 0,
    include: ["facets"],
    enabled: args.enabled,
    fetcher: queryLogs,
  });

  const groups = useExplorerFacets(query.data?.facets, LOG_FIELD_LABELS);

  return { ...query, groups };
}

export type UseLogsFacetsReturn = ReturnType<typeof useLogsFacets>;
