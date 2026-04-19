import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

import { upsertFacetFilter } from "./utils";

export type TracesFacetSelectionContext = {
  filters: StructuredFilter[];
  setFilters: (next: StructuredFilter[]) => void;
  setSelectedService: (value: string | null) => void;
  setErrorsOnly: (value: boolean) => void;
  resetPage: () => void;
};

export function handleTracesFacetSelect(
  groupKey: string,
  value: string | null,
  ctx: TracesFacetSelectionContext
): void {
  if (groupKey === "service_name") {
    ctx.setSelectedService(value);
    ctx.resetPage();
    return;
  }
  if (groupKey === "status") {
    ctx.setErrorsOnly(value === "ERROR");
    ctx.resetPage();
    return;
  }
  ctx.setFilters(upsertFacetFilter(ctx.filters, groupKey, value));
  ctx.resetPage();
}
