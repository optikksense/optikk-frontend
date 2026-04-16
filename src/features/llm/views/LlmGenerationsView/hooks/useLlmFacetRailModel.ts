import { useMemo } from "react";

import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

import type { LlmExplorerFacets } from "../../../types";

export type LlmFacetRailSource = {
  facets: LlmExplorerFacets;
  selectedProvider: string | null;
  selectedModel: string | null;
  errorsOnly: boolean;
  filters: StructuredFilter[];
};

export function useLlmFacetRailModel(source: LlmFacetRailSource) {
  const { facets, selectedProvider, selectedModel, errorsOnly, filters } = source;

  const facetGroups = useMemo(
    () => [
      { key: "ai_system", label: "Provider", buckets: facets.ai_system },
      { key: "ai_model", label: "Model", buckets: facets.ai_model },
      { key: "ai_operation", label: "Operation", buckets: facets.ai_operation },
      { key: "service_name", label: "Service", buckets: facets.service_name },
      { key: "prompt_template", label: "Prompt template", buckets: facets.prompt_template },
      { key: "status", label: "Status", buckets: facets.status },
      { key: "finish_reason", label: "Finish Reason", buckets: facets.finish_reason },
    ],
    [facets]
  );

  const selectedFacetState = useMemo(
    () => ({
      ai_system: selectedProvider,
      ai_model: selectedModel,
      ai_operation: filters.find((f) => f.field === "operation")?.value ?? null,
      service_name: filters.find((f) => f.field === "service_name")?.value ?? null,
      prompt_template: filters.find((f) => f.field === "prompt")?.value ?? null,
      status: errorsOnly ? "ERROR" : null,
      finish_reason: filters.find((f) => f.field === "finish_reason")?.value ?? null,
    }),
    [errorsOnly, filters, selectedModel, selectedProvider]
  );

  return { facetGroups, selectedFacetState };
}
