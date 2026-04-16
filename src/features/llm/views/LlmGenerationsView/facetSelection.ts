import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

import { upsertFacetFilter } from "./facetFilters";

export type LlmFacetSelectionHandlers = {
  filters: StructuredFilter[];
  setFilters: (next: StructuredFilter[]) => void;
  setSelectedProvider: (value: string | null) => void;
  setSelectedModel: (value: string | null) => void;
  setErrorsOnly: (value: boolean) => void;
  setPage: (page: number) => void;
};

function resetPage(h: LlmFacetSelectionHandlers) {
  h.setPage(1);
}

export function handleFacetSelect(
  groupKey: string,
  value: string | null,
  h: LlmFacetSelectionHandlers
): void {
  if (groupKey === "ai_system") {
    h.setSelectedProvider(value);
    resetPage(h);
    return;
  }
  if (groupKey === "ai_model") {
    h.setSelectedModel(value);
    resetPage(h);
    return;
  }
  if (groupKey === "status") {
    h.setErrorsOnly(value === "ERROR");
    resetPage(h);
    return;
  }
  if (groupKey === "ai_operation") {
    h.setFilters(upsertFacetFilter(h.filters, "operation", value));
    resetPage(h);
    return;
  }
  if (groupKey === "service_name") {
    h.setFilters(upsertFacetFilter(h.filters, "service_name", value));
    resetPage(h);
    return;
  }
  if (groupKey === "finish_reason") {
    h.setFilters(upsertFacetFilter(h.filters, "finish_reason", value));
    resetPage(h);
    return;
  }
  if (groupKey === "prompt_template") {
    h.setFilters(upsertFacetFilter(h.filters, "prompt", value));
    resetPage(h);
    return;
  }
  h.setFilters(upsertFacetFilter(h.filters, groupKey, value));
  resetPage(h);
}
