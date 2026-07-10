import type { ExplorerFilter } from "@shared/search/types/filters";

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

interface LogsFiltersBody {
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

interface TranslationWarning {
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
  let searchModeConflict = false;

  for (const filter of filters) {
    dispatchFilter(filter.field, filter.op, filter.value, {
      body,
      warnings,
      searchTerms,
      setSearchMode: (mode) => {
        if (searchMode === undefined) searchMode = mode;
        else if (searchMode !== mode) searchModeConflict = true;
      },
    });
  }

  if (searchTerms.length > 0) {
    body.search = searchTerms.join(" ");
    body.searchMode = searchMode ?? "ngram";
    // Wire format carries one mode for the joined search; surface lossy mixing.
    if (searchModeConflict) {
      warnings.push({
        code: "unsupported_op",
        field: "search",
        message: `Mixed exact and substring search terms — all applied as "${body.searchMode}".`,
      });
    }
  }
  return { body, warnings };
}

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
  if (field.startsWith("@")) {
    handleAttribute(field.slice(1), op, value, ctx);
    return;
  }
  if (field === "search" || field === "body") {
    handleSearch(op, value, ctx);
    return;
  }
  if (field === "trace_id") {
    handleSingle(ctx, "traceId", value);
    return;
  }
  if (field === "span_id") {
    handleSingle(ctx, "spanId", value);
    return;
  }
  if (field === "severity_text") {
    handleSeverity(op, value, ctx);
    return;
  }
  if (RESOURCE_DIMS.has(field)) {
    handleResourceDim(field, op, value, ctx);
    return;
  }
  ctx.warnings.push({
    code: "unknown_field",
    field,
    message: `Field "${field}" is not a known logs facet — ignored. Use @${field} for custom attributes.`,
  });
}

function handleResourceDim(field: string, op: string, value: string, ctx: DispatchCtx): void {
  if (op === "eq") {
    appendArr(ctx.body, RESOURCE_INCLUDE[field], value);
    return;
  }
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
    appendArr(ctx.body, key, value);
    return;
  }
  ctx.warnings.push({
    code: "unsupported_op",
    field,
    message: `Operator "${op}" not supported on resource dim "${field}" — only eq/neq.`,
  });
}

function handleSeverity(op: string, value: string, ctx: DispatchCtx): void {
  if (op === "eq") {
    appendArr(ctx.body, "severities", value);
    return;
  }
  if (op === "neq") {
    appendArr(ctx.body, "excludeSeverities", value);
    return;
  }
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
  const val = body[key];
  const current = Array.isArray(val) && val.every((v) => typeof v === "string") ? val : [];
  Object.assign(body, { [key]: [...current, value] });
}
