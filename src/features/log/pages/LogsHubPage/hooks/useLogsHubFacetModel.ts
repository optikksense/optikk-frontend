import { useMemo } from "react";

import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

import type { LogFacet } from "../../../types";

type FacetBuckets = {
  serviceFacets: LogFacet[];
  levelFacets: LogFacet[];
  hostFacets: LogFacet[];
  podFacets: LogFacet[];
  containerFacets: LogFacet[];
  environmentFacets: LogFacet[];
  scopeNameFacets: LogFacet[];
};

export function useLogsHubFacetModel(
  filters: StructuredFilter[],
  errorsOnly: boolean,
  buckets: FacetBuckets
) {
  const {
    serviceFacets,
    levelFacets,
    hostFacets,
    podFacets,
    containerFacets,
    environmentFacets,
    scopeNameFacets,
  } = buckets;

  const activeSelections = useMemo(
    () => ({
      service_name:
        filters.find((filter) => filter.field === "service_name" && filter.operator === "equals")
          ?.value ?? null,
      level: errorsOnly
        ? "ERROR"
        : (filters.find((filter) => filter.field === "level" && filter.operator === "equals")
            ?.value ?? null),
      host: filters.find((f) => f.field === "host")?.value ?? null,
      pod: filters.find((f) => f.field === "pod")?.value ?? null,
      container: filters.find((f) => f.field === "container")?.value ?? null,
      environment: filters.find((f) => f.field === "environment")?.value ?? null,
      scope_name: filters.find((f) => f.field === "logger")?.value ?? null,
    }),
    [errorsOnly, filters]
  );

  const facetGroups = useMemo(
    () => [
      { key: "service_name", label: "Service", buckets: serviceFacets },
      { key: "level", label: "Severity", buckets: levelFacets },
      { key: "host", label: "Host", buckets: hostFacets },
      { key: "pod", label: "Pod", buckets: podFacets },
      { key: "container", label: "Container", buckets: containerFacets },
      { key: "environment", label: "Environment", buckets: environmentFacets },
      { key: "scope_name", label: "Scope / logger", buckets: scopeNameFacets },
    ],
    [
      containerFacets,
      environmentFacets,
      hostFacets,
      levelFacets,
      podFacets,
      scopeNameFacets,
      serviceFacets,
    ]
  );

  return { activeSelections, facetGroups };
}
