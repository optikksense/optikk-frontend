import type { StructuredFilter } from "@shared/hooks/useURLFilters";
import { escapeQueryValue } from "@shared/utils/queryEscaping";

function uiFieldToQueryField(field: string): string {
  switch (field) {
    case "provider":
      return "provider";
    case "model":
      return "model";
    case "operation":
      return "operation";
    case "service_name":
      return "service";
    case "status":
      return "status";
    case "finish_reason":
      return "finish_reason";
    case "prompt":
      return "prompt";
    case "session":
      return "session";
    case "search":
      return "";
    default:
      return field;
  }
}

function filterToClause(filter: StructuredFilter): string {
  const qField = uiFieldToQueryField(filter.field);
  const escaped = escapeQueryValue(filter.value);

  if (filter.field === "search") return escaped;
  if (!qField) return "";

  switch (filter.operator) {
    case "not_equals":
      return `-${qField}:${escaped}`;
    case "contains":
      return `${qField}:${filter.value.trim().replace(/\s+/g, "*")}*`;
    default:
      return `${qField}:${escaped}`;
  }
}

export function buildLlmExplorerQuery(params: {
  filters: StructuredFilter[];
  errorsOnly: boolean;
  selectedProvider: string | null;
  selectedModel: string | null;
  selectedSession: string | null;
}): string {
  const parts: string[] = [];

  const structured = params.filters
    .map((f) => filterToClause(f))
    .filter(Boolean)
    .join(" AND ");
  if (structured) parts.push(structured);

  if (params.errorsOnly) parts.push("status:ERROR");
  if (params.selectedProvider) parts.push(`provider:${escapeQueryValue(params.selectedProvider)}`);
  if (params.selectedModel) parts.push(`model:${escapeQueryValue(params.selectedModel)}`);
  if (params.selectedSession) parts.push(`session:${escapeQueryValue(params.selectedSession)}`);

  return parts.join(" AND ");
}
