import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

import { upsertFacetFilter } from "./utils";

export type TracesFacetSelectionContext = {
  filters: StructuredFilter[];
  setFilters: (next: StructuredFilter[]) => void;
  setSelectedService: (value: string | null) => void;
  setErrorsOnly: (value: boolean) => void;
  setPage: (page: number) => void;
};

export function handleTracesFacetSelect(
  groupKey: string,
  value: string | null,
  ctx: TracesFacetSelectionContext
): void {
  if (groupKey === "service_name") {
    ctx.setSelectedService(value);
    ctx.setPage(1);
    return;
  }
  if (groupKey === "status") {
    ctx.setErrorsOnly(value === "ERROR");
    ctx.setPage(1);
    return;
  }
  ctx.setFilters(upsertFacetFilter(ctx.filters, groupKey, value));
  ctx.setPage(1);
}
