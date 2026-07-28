import { useCallback, useMemo, useRef } from "react";

import type { FacetGroupModel } from "@shared/search/components/facets/FacetGroup";
import { useExplorerKeyboard } from "@shared/search/hooks/useExplorerKeyboard";

import type { TracesFacetBucket } from "@shared/api/traces/types";
import { useTracesExplorerModel } from "@shared/traces/hooks/useTracesExplorerModel";

   
                                                                     
                                                                                 
                                                                            
                                                               
   
export function useTracesExplorerPage() {
  const model = useTracesExplorerModel({ includeFacets: true });
  const { state, facets } = model;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const facetGroups = useMemo<FacetGroupModel[]>(() => facetsToGroups(facets), [facets]);

  const onInclude = useCallback(
    (field: string, value: string) => state.addFilter({ field, op: "eq", value }),
    [state]
  );
  const onExclude = useCallback(
    (field: string, value: string) => state.addFilter({ field, op: "neq", value }),
    [state]
  );
  const onFreeText = useCallback(
    (text: string) => {
      if (!text) return;
      state.addFilter({ field: "search", op: "contains", value: text });
    },
    [state]
  );
  const onClearFilters = useCallback(() => state.clearAll(), [state]);

  useExplorerKeyboard({
    onSearchFocus: () => searchInputRef.current?.focus(),
  });

  return {
    model,
    state,
    facetGroups,
    searchInputRef,
    onInclude,
    onExclude,
    onFreeText,
    onClearFilters,
    startTime: model.startTime,
    endTime: model.endTime,
  };
}

function facetsToGroups(
  facets: Readonly<Record<string, readonly TracesFacetBucket[]>> | undefined
): FacetGroupModel[] {
  if (!facets) return [];
  return Object.entries(facets).map(([field, buckets]) => ({
    field,
    label: humanLabel(field),
    buckets: [...buckets],
  }));
}

function humanLabel(field: string): string {
  if (field === "service") return "Service";
  if (field === "operation") return "Operation";
  if (field === "httpMethod") return "Method";
  if (field === "httpStatus") return "HTTP";
  if (field === "status") return "Status";
  return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
}
