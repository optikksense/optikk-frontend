import type { ExplorerFilter, TranslationWarning } from "@shared/search/types/filters";

/**
 * Single source of truth for translating `ExplorerFilter[]` (FE chip model)
 * into the BE wire body for the traces read endpoints (`/traces/query`,
 * `/traces/facets`, `/traces/trend`). Mirrors the embedded `filter.Filters`
 * shape on the backend (`internal/modules/traces/filter/filter.go`).
 *
 * Filters that cannot be expressed on the wire are reported via `warnings`
 * so the UI can surface them — nothing is dropped silently.
 */

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

export interface TracesBuildResult {
  readonly body: TracesFiltersBody;
  readonly warnings: readonly TranslationWarning[];
}

/** Ops the backend implements on `attributes[]` (traces filter.go). */
const ATTR_OPS = new Set([
  "eq",
  "neq",
  "contains",
  "regex",
  "gt",
  "gte",
  "lt",
  "lte",
  "exists",
  "not_exists",
]);

/** field -> include array, plus optional exclude array for neq/not_in. */
const LIST_FIELDS: Record<
  string,
  { include: keyof TracesFiltersBody; exclude?: keyof TracesFiltersBody }
> = {
  service: { include: "services", exclude: "excludeServices" },
  service_name: { include: "services", exclude: "excludeServices" },
  operation: { include: "operations" },
  span_kind: { include: "spanKinds" },
  http_method: { include: "httpMethods" },
  http_status: { include: "httpStatuses" },
  status: { include: "statuses", exclude: "excludeStatuses" },
  environment: { include: "environments" },
  peer_service: { include: "peerServices" },
};

export function buildTracesFilters(
  filters: readonly ExplorerFilter[],
  startTime: number,
  endTime: number,
  extras: { limit?: number; cursor?: string } = {}
): TracesBuildResult {
  const body: TracesFiltersBody = { startTime, endTime };
  if (extras.limit !== undefined) body.limit = extras.limit;
  if (extras.cursor) body.cursor = extras.cursor;

  const warnings: TranslationWarning[] = [];
  const searchTerms: string[] = [];

  for (const filter of filters) {
    const { field, op, value } = filter;

    if (field.startsWith("@")) {
      handleAttribute(field, op, value, body, warnings);
      continue;
    }
    if (field in LIST_FIELDS) {
      handleListField(field, op, value, body, warnings);
      continue;
    }

    switch (field) {
      case "trace_id":
        if (op !== "eq") {
          pushUnsupportedOp(warnings, field, op, "only exact match");
        } else if (body.traceId) {
          warnings.push({
            code: "duplicate_single_value",
            field,
            message: "Multiple trace_id filters — only the first applies.",
          });
        } else {
          body.traceId = value;
        }
        break;
      case "duration_ms": {
        const ms = Number(value);
        if (Number.isNaN(ms) || !["gte", "gt", "lte", "lt", "eq"].includes(op)) {
          pushUnsupportedOp(warnings, field, op, "use a numeric value with comparisons or exact");
          break;
        }
        const ns = ms * 1_000_000;
        if (op === "gte" || op === "gt" || op === "eq") body.minDurationNs = ns;
        if (op === "lte" || op === "lt" || op === "eq") body.maxDurationNs = ns;
        break;
      }
      case "has_error":
        if (op === "eq") body.hasError = value === "true";
        else pushUnsupportedOp(warnings, field, op, "only has_error:true or has_error:false");
        break;
      case "search":
      case "body":
        searchTerms.push(value);
        break;
      default:
        warnings.push({
          code: "unknown_field",
          field,
          message: `Field "${field}" is not a known traces field — ignored. Use @${field} for custom attributes.`,
        });
    }
  }

  if (searchTerms.length > 0) {
    body.search = searchTerms.join(" ");
  }
  return { body, warnings };
}

function handleListField(
  field: string,
  op: string,
  value: string,
  body: TracesFiltersBody,
  warnings: TranslationWarning[]
): void {
  const mapping = LIST_FIELDS[field];
  const values = op === "in" || op === "not_in" ? splitInList(value) : [value];
  if (op === "eq" || op === "in") {
    appendArr(body, mapping.include, values);
    return;
  }
  if ((op === "neq" || op === "not_in") && mapping.exclude) {
    appendArr(body, mapping.exclude, values);
    return;
  }
  pushUnsupportedOp(warnings, field, op, "only match / any-of supported");
}

function handleAttribute(
  field: string,
  op: string,
  value: string,
  body: TracesFiltersBody,
  warnings: TranslationWarning[]
): void {
  if (!ATTR_OPS.has(op)) {
    pushUnsupportedOp(warnings, field, op, "supported: eq/neq/contains/regex/comparisons/exists");
    return;
  }
  body.attributes = body.attributes ?? [];
  body.attributes.push({ key: field.slice(1), op, value });
}

function splitInList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function appendArr(body: TracesFiltersBody, key: keyof TracesFiltersBody, values: string[]): void {
  const current = body[key];
  const list = Array.isArray(current) ? (current as string[]) : [];
  Object.assign(body, { [key]: [...list, ...values] });
}

function pushUnsupportedOp(
  warnings: TranslationWarning[],
  field: string,
  op: string,
  hint: string
): void {
  warnings.push({
    code: "unsupported_op",
    field,
    message: `Operator "${op}" not supported on "${field}" — ${hint}.`,
  });
}
