import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

export function upsertFacetFilter(
  filters: StructuredFilter[],
  nextField: string,
  nextValue: string | null
): StructuredFilter[] {
  const withoutField = filters.filter((filter) => filter.field !== nextField);
  if (!nextValue) return withoutField;
  return [...withoutField, { field: nextField, operator: "equals", value: nextValue }];
}
