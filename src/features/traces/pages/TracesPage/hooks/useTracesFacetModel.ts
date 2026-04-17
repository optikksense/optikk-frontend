import { useMemo } from "react";

import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

import type { TraceExplorerFacets } from "../../../types";

export function useTracesFacetModel(
  facets: TraceExplorerFacets,
  filters: StructuredFilter[],
  errorsOnly: boolean,
  selectedService: string | null
) {
  const facetGroups = useMemo(
    () => [
      { key: "service_name", label: "Services", buckets: facets.service_name ?? [] },
      { key: "status", label: "Status", buckets: facets.status ?? [] },
      { key: "operation_name", label: "Operations", buckets: facets.operation_name ?? [] },
      { key: "span_kind", label: "Span kind", buckets: facets.span_kind ?? [] },
      { key: "http_method", label: "HTTP method", buckets: facets.http_method ?? [] },
      {
        key: "http_status_code",
        label: "HTTP status",
        buckets: facets.http_status_code ?? [],
      },
      { key: "db_system", label: "DB system", buckets: facets.db_system ?? [] },
    ],
    [
      facets.db_system,
      facets.http_method,
      facets.http_status_code,
      facets.operation_name,
      facets.service_name,
      facets.span_kind,
      facets.status,
    ]
  );

  const selectedFacetState = useMemo(
    () => ({
      service_name: selectedService,
      status: errorsOnly ? "ERROR" : null,
      operation_name: filters.find((filter) => filter.field === "operation_name")?.value ?? null,
      span_kind: filters.find((filter) => filter.field === "span_kind")?.value ?? null,
      http_method: filters.find((filter) => filter.field === "http_method")?.value ?? null,
      http_status_code: filters.find((filter) => filter.field === "http_status")?.value ?? null,
      db_system: filters.find((filter) => filter.field === "db_system")?.value ?? null,
    }),
    [errorsOnly, filters, selectedService]
  );

  return { facetGroups, selectedFacetState };
}
