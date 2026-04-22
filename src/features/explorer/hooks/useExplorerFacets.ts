import { useMemo } from "react";

import type { ExplorerFacetBucket } from "../types/queries";

export interface FacetGroup {
  readonly key: string;
  readonly label: string;
  readonly buckets: readonly ExplorerFacetBucket[];
}

/**
 * Pure derivation: turns a raw facet map from the server into a stable ordered
 * `FacetGroup[]` the `FacetRail` can render. No IO here — that belongs to the
 * scope-specific hook (`useLogsFacets` / `useTracesFacets`), which wraps
 * `useExplorerQuery({ include: ["facets"] })` and hands the result to this.
 */
export function useExplorerFacets(
  raw: Readonly<Record<string, readonly ExplorerFacetBucket[]>> | undefined,
  fieldLabels: Readonly<Record<string, string>>
): readonly FacetGroup[] {
  return useMemo(() => {
    if (!raw) return [];
    return Object.entries(raw)
      .map(([key, buckets]) => ({
        key,
        label: fieldLabels[key] ?? key,
        buckets: [...buckets].sort((a, b) => b.count - a.count),
      }))
      .filter((group) => group.buckets.length > 0);
  }, [raw, fieldLabels]);
}
