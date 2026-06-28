import type { ExplorerFilter } from "@/features/explorer/types/filters";

export interface TracesFiltersBody {
  startTime: number;
  endTime: number;
  limit?: number;
  cursor?: string;

  services?: string[];
  excludeServices?: string[];
  operations?: string[];
  spanKinds?: string[];
  httpMethods?: string[];
  httpStatuses?: string[];
  statuses?: string[];
  excludeStatuses?: string[];
  environments?: string[];
  peerServices?: string[];
  traceId?: string;
  minDurationNs?: number;
  maxDurationNs?: number;
  hasError?: boolean;
  search?: string;
  searchMode?: string;

  attributes?: Array<{
    key: string;
    op?: string;
    value: string;
  }>;
}

export function buildTracesFilters(
  filters: readonly ExplorerFilter[],
  startTime: number,
  endTime: number,
  extras: { limit?: number; cursor?: string } = {}
): TracesFiltersBody {
  const body: TracesFiltersBody = { startTime, endTime };
  if (extras.limit !== undefined) body.limit = extras.limit;
  if (extras.cursor) body.cursor = extras.cursor;

  const searchTerms: string[] = [];
  let searchMode: "ngram" | "exact" | undefined;

  for (const filter of filters) {
    const { field, op, value } = filter;

    if (field.startsWith("@")) {
      const key = field.slice(1);
      body.attributes = body.attributes ?? [];
      body.attributes.push({ key, op, value });
      continue;
    }

    switch (field) {
      case "service_name":
        if (op === "eq") {
          body.services = body.services ?? [];
          body.services.push(value);
        } else if (op === "neq") {
          body.excludeServices = body.excludeServices ?? [];
          body.excludeServices.push(value);
        }
        break;
      case "operation":
        if (op === "eq") {
          body.operations = body.operations ?? [];
          body.operations.push(value);
        }
        break;
      case "span_kind":
        if (op === "eq") {
          body.spanKinds = body.spanKinds ?? [];
          body.spanKinds.push(value);
        }
        break;
      case "http_method":
        if (op === "eq") {
          body.httpMethods = body.httpMethods ?? [];
          body.httpMethods.push(value);
        }
        break;
      case "http_status":
        if (op === "eq") {
          body.httpStatuses = body.httpStatuses ?? [];
          body.httpStatuses.push(value);
        }
        break;
      case "status":
        if (op === "eq") {
          body.statuses = body.statuses ?? [];
          body.statuses.push(value);
        } else if (op === "neq") {
          body.excludeStatuses = body.excludeStatuses ?? [];
          body.excludeStatuses.push(value);
        }
        break;
      case "environment":
        if (op === "eq") {
          body.environments = body.environments ?? [];
          body.environments.push(value);
        }
        break;
      case "peer_service":
        if (op === "eq") {
          body.peerServices = body.peerServices ?? [];
          body.peerServices.push(value);
        }
        break;
      case "trace_id":
        if (op === "eq") {
          body.traceId = value;
        }
        break;
      case "duration_ms": {
        const ms = Number(value);
        if (!isNaN(ms)) {
          const ns = ms * 1_000_000;
          if (op === "gte" || op === "gt" || op === "eq") {
            body.minDurationNs = ns;
          }
          if (op === "lte" || op === "lt" || op === "eq") {
            body.maxDurationNs = ns;
          }
        }
        break;
      }
      case "has_error":
        body.hasError = value === "true";
        break;
      case "search":
      case "body":
        searchTerms.push(value);
        if (op === "eq") {
          searchMode = "exact";
        } else {
          searchMode = "ngram";
        }
        break;
    }
  }

  if (searchTerms.length > 0) {
    body.search = searchTerms.join(" ");
    body.searchMode = searchMode ?? "ngram";
  }

  return body;
}
