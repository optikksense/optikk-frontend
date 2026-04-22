import type { ExplorerFilter } from "../types/filters";

const OP_TO_SYMBOL: Record<string, string> = {
  eq: ":",
  neq: "!=",
  contains: "~",
  not_contains: "!~",
  gt: ">",
  lt: "<",
  gte: ">=",
  lte: "<=",
  in: "IN",
  not_in: "NOT IN",
  exists: "EXISTS",
  not_exists: "NOT EXISTS",
};

/**
 * Flattens a list of structured filters into a compact, log-readable
 * `field:value` form consumed by the backend `FromStructured` parser seam.
 * This is NOT a DSL — the wire format is still JSON on POST bodies; this
 * helper is for debug surfaces, share links, and empty-state messaging.
 */
export function describeFilters(filters: readonly ExplorerFilter[]): string {
  return filters
    .map((filter) => `${filter.field}${OP_TO_SYMBOL[filter.op] ?? ":"}${filter.value}`)
    .join(" AND ");
}

export function addFilter(
  current: readonly ExplorerFilter[],
  next: ExplorerFilter
): ExplorerFilter[] {
  return [...current, next];
}

export function removeFilter(
  current: readonly ExplorerFilter[],
  field: string,
  value: string
): ExplorerFilter[] {
  return current.filter((filter) => !(filter.field === field && filter.value === value));
}

export function hasFilter(
  current: readonly ExplorerFilter[],
  field: string,
  value: string
): boolean {
  return current.some((filter) => filter.field === field && filter.value === value);
}
