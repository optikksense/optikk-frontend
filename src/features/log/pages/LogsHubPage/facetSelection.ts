import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

import { upsertLogFacetFilter } from "../../utils/logUtils";

export type LogsFacetSelectionContext = {
  filters: StructuredFilter[];
  setFilters: (next: StructuredFilter[]) => void;
  setErrorsOnly: (value: boolean) => void;
  resetPage: () => void;
};

export function handleLogsFacetSelect(
  groupKey: string,
  value: string | null,
  ctx: LogsFacetSelectionContext
): void {
  if (groupKey === "level") {
    ctx.setErrorsOnly(false);
  }
  if (groupKey === "scope_name") {
    ctx.setFilters(upsertLogFacetFilter(ctx.filters, "logger", value));
    ctx.resetPage();
    return;
  }
  ctx.setFilters(upsertLogFacetFilter(ctx.filters, groupKey, value));
  ctx.resetPage();
}
