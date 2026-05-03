import type { ExplorerFilter } from "@features/explorer/types/filters";

/**
 * Single source of truth for translating `ExplorerFilter[]` (FE chip model)
 * into the BE wire body for the four logs read endpoints (`/logs/query`,
 * `/logs/summary`, `/logs/trend`, `/logs/facets`). Mirrors the embedded
 * `filter.Filters` shape on the backend (`internal/modules/logs/filter/filter.go`).
 *
 *   Resource dims (service/host/pod/…)  → typed include/exclude arrays
 *   `severity_text` (eq/neq)            → `severities` / `excludeSeverities`
 *   `trace_id` / `span_id` (eq)         → single-value fields (later wins logged)
 *   `body` / `search` (contains|eq)     → joined into `search` with mode
 *   `@<key>`                            → `attributes[]` with eq/neq/contains/regex
 *   anything else                       → `warnings[]` so the UI can surface a soft
 *                                          notice under the search bar
 */

// ---------- public types ----------

export interface LogsFiltersBody {
  startTime: number;
  endTime: number;
  limit?: number;
  cursor?: string;

  services?: string[];
  excludeServices?: string[];
  hosts?: string[];
  excludeHosts?: string[];
  pods?: string[];
  containers?: string[];
  environments?: string[];
  severities?: string[];
  excludeSeverities?: string[];

  traceId?: string;
  spanId?: string;
  search?: string;
  searchMode?: "ngram" | "exact";

  attributes?: ReadonlyArray<{
    readonly key: string;
    readonly op?: "eq" | "neq" | "contains" | "regex";
    readonly value: string;
  }>;
}

export interface TranslationWarning {
  readonly code: "unsupported_op" | "unknown_field" | "duplicate_single_value";
  readonly field: string;
  readonly message: string;
}

export interface BuildResult {
  readonly body: LogsFiltersBody;
  readonly warnings: readonly TranslationWarning[];
}

export interface BuildExtras {
  readonly limit?: number;
  readonly cursor?: string;
}

// ---------- public entry ----------

export function buildLogsFilters(
  filters: readonly ExplorerFilter[],
  startTime: number,
  endTime: number,
  extras: BuildExtras = {}
): BuildResult {
  const body: LogsFiltersBody = { startTime, endTime };
  if (extras.limit !== undefined) body.limit = extras.limit;
  if (extras.cursor) body.cursor = extras.cursor;

  const warnings: TranslationWarning[] = [];
  const searchTerms: string[] = [];
  let searchMode: "ngram" | "exact" | undefined;

  for (const filter of filters) {
    dispatchFilter(filter.field, filter.op, filter.value, {
      body,
      warnings,
      searchTerms,
      setSearchMode: (mode) => {
        searchMode = searchMode ?? mode;
      },
    });
  }

  if (searchTerms.length > 0) {
    body.search = searchTerms.join(" ");
    body.searchMode = searchMode ?? "ngram";
  }
  return { body, warnings };
}

// ---------- dispatch table ----------

const RESOURCE_DIMS = new Set(["service_name", "host", "pod", "container", "environment"]);

const RESOURCE_INCLUDE: Record<string, keyof LogsFiltersBody> = {
  service_name: "services",
  host: "hosts",
  pod: "pods",
  container: "containers",
  environment: "environments",
};

const RESOURCE_EXCLUDE: Record<string, keyof LogsFiltersBody> = {
  service_name: "excludeServices",
  host: "excludeHosts",
};

const ATTR_OP_MAP: Record<string, "eq" | "neq" | "contains" | "regex"> = {
  eq: "eq",
  neq: "neq",
  contains: "contains",
  regex: "regex",
};

interface DispatchCtx {
  readonly body: LogsFiltersBody;
  readonly warnings: TranslationWarning[];
  readonly searchTerms: string[];
  readonly setSearchMode: (mode: "ngram" | "exact") => void;
}

function dispatchFilter(field: string, op: string, value: string, ctx: DispatchCtx): void {
  if (field.startsWith("@")) return handleAttribute(field.slice(1), op, value, ctx);
  if (field === "search" || field === "body") return handleSearch(op, value, ctx);
  if (field === "trace_id") return handleSingle(ctx, "traceId", value);
  if (field === "span_id") return handleSingle(ctx, "spanId", value);
  if (field === "severity_text") return handleSeverity(op, value, ctx);
  if (RESOURCE_DIMS.has(field)) return handleResourceDim(field, op, value, ctx);
  ctx.warnings.push({
    code: "unknown_field",
    field,
    message: `Field "${field}" is not a known logs facet — ignored. Use @${field} for custom attributes.`,
  });
}

function handleResourceDim(field: string, op: string, value: string, ctx: DispatchCtx): void {
  if (op === "eq") return appendArr(ctx.body, RESOURCE_INCLUDE[field], value);
  if (op === "neq") {
    const key = RESOURCE_EXCLUDE[field];
    if (!key) {
      ctx.warnings.push({
        code: "unsupported_op",
        field,
        message: `Exclusion not supported on "${field}"`,
      });
      return;
    }
    return appendArr(ctx.body, key, value);
  }
  ctx.warnings.push({
    code: "unsupported_op",
    field,
    message: `Operator "${op}" not supported on resource dim "${field}" — only eq/neq.`,
  });
}

function handleSeverity(op: string, value: string, ctx: DispatchCtx): void {
  if (op === "eq") return appendArr(ctx.body, "severities", value);
  if (op === "neq") return appendArr(ctx.body, "excludeSeverities", value);
  ctx.warnings.push({
    code: "unsupported_op",
    field: "severity_text",
    message: `Operator "${op}" not supported on severity — only eq/neq.`,
  });
}

function handleSingle(ctx: DispatchCtx, key: "traceId" | "spanId", value: string): void {
  if (ctx.body[key]) {
    ctx.warnings.push({
      code: "duplicate_single_value",
      field: key,
      message: `Multiple ${key} filters — only the first applies.`,
    });
    return;
  }
  ctx.body[key] = value;
}

function handleSearch(op: string, value: string, ctx: DispatchCtx): void {
  if (op === "contains") {
    ctx.searchTerms.push(value);
    ctx.setSearchMode("ngram");
    return;
  }
  if (op === "eq") {
    ctx.searchTerms.push(value);
    ctx.setSearchMode("exact");
    return;
  }
  ctx.warnings.push({
    code: "unsupported_op",
    field: "search",
    message: `Operator "${op}" not supported on body — only contains/eq.`,
  });
}

function handleAttribute(key: string, op: string, value: string, ctx: DispatchCtx): void {
  const beOp = ATTR_OP_MAP[op];
  if (!beOp) {
    ctx.warnings.push({
      code: "unsupported_op",
      field: `@${key}`,
      message: `Operator "${op}" not supported on attribute "@${key}" — only eq/neq/contains/regex.`,
    });
    return;
  }
  const list = ctx.body.attributes ? [...ctx.body.attributes] : [];
  list.push({ key, op: beOp, value });
  ctx.body.attributes = list;
}

function appendArr(body: LogsFiltersBody, key: keyof LogsFiltersBody, value: string): void {
  const current = (body[key] as string[] | undefined) ?? [];
  (body as unknown as Record<string, unknown>)[key as string] = [...current, value];
}
