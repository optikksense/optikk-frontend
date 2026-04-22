import { useExplorerFacets } from "@/features/explorer/hooks/useExplorerFacets";
import { useExplorerQuery } from "@/features/explorer/hooks/useExplorerQuery";
import { useExplorerState } from "@/features/explorer/hooks/useExplorerState";

import { tracesExplorerApi } from "../api/tracesExplorerApi";
import { TRACES_FIELD_LABELS } from "../config/facetFields";
import type { TracesQueryResponse } from "../types/trace";

/**
 * Facets-only fetch (include:["facets"]). Derives ordered FacetGroup list
 * consumed by the facet rail. Separate from the main list query so the
 * rail doesn't re-render on every page-turn.
 */
export function useTracesFacets() {
  const state = useExplorerState();
  const query = useExplorerQuery<TracesQueryResponse>({
    scope: "traces",
    filters: state.filters,
    cursor: null,
    limit: 0,
    include: ["facets"],
    fetcher: tracesExplorerApi.query,
  });
  const groups = useExplorerFacets(query.data?.facets, TRACES_FIELD_LABELS);
  return { groups, isLoading: query.isPending, isError: query.isError };
}
