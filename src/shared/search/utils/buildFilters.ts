/**
 * Shared filter-building infrastructure for translating `ExplorerFilter[]`
 * (FE chip model) into backend wire bodies. Used by both
 * `buildLogsFilters` and `buildTracesFilters` to eliminate ~120 lines of
 * redundant code.
 */
import type { ExplorerFilter, TranslationWarning } from "../types/filters";

// ---- Attribute operator whitelist (identical across logs/traces) ----

/** Ops the backend implements on `attributes[]` for both logs and traces. */
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
] as const);

// ---- Shared helpers ----

/** in/not_in carry comma-joined values from the `(a OR b)` DSL form. */
function splitInList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Splits for in/not_in, returns single-element array otherwise. */
export function listValues(op: string, value: string): string[] {
  if (op !== "in" && op !== "not_in") return [value];
  return splitInList(value);
}

/** Appends values to a string[] field on the body, creating the array if needed. */
export function appendArr<T extends object>(body: T, key: keyof T, values: string[]): void {
  const current = body[key as keyof typeof body];
  const list = Array.isArray(current) ? (current as string[]) : [];
  Object.assign(body, { [key]: [...list, ...values] });
}

/** Pushes an "unsupported_op" warning. */
export function pushUnsupportedOp(
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

/** Pushes an "unknown_field" warning with the standard hint. */
export function pushUnknownField(
  warnings: TranslationWarning[],
  field: string,
  context: string
): void {
  warnings.push({
    code: "unknown_field",
    field,
    message: `Field "${field}" is not a known ${context} field — ignored. Use @${field} for custom attributes.`,
  });
}

/**
 * Handles a `@key` attribute filter. Identical across logs and traces:
 * validates the op, then pushes to body.attributes[].
 */
function handleAttribute<
  T extends { attributes?: Array<{ key: string; op?: string; value: string }> },
>(field: string, op: string, value: string, body: T, warnings: TranslationWarning[]): void {
  if (!ATTR_OPS.has(op as never)) {
    pushUnsupportedOp(warnings, field, op, "supported: eq/neq/contains/regex/comparisons/exists");
    return;
  }
  body.attributes = body.attributes ?? [];
  body.attributes.push({ key: field.slice(1), op, value });
}

/**
 * Handles a list field (service/environment/etc) with include/exclude mapping.
 */
export function handleListField<T extends object>(
  field: string,
  op: string,
  value: string,
  body: T,
  warnings: TranslationWarning[],
  mapping: { include: keyof T; exclude?: keyof T }
): void {
  const values = listValues(op, value);
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

/**
 * Handles a single-value field (e.g. traceId/spanId) — only first value wins.
 */
export function handleSingleValue<T extends object>(
  body: T,
  key: keyof T & string,
  value: string,
  warnings: TranslationWarning[]
): void {
  if (body[key as keyof typeof body]) {
    warnings.push({
      code: "duplicate_single_value",
      field: key,
      message: `Multiple ${key} filters — only the first applies.`,
    });
    return;
  }
  Object.assign(body, { [key]: value });
}

/**
 * Collects search terms and joins them into the `search` body field.
 */
export function finalizeSearch<T extends { search?: string }>(
  body: T,
  searchTerms: string[]
): void {
  if (searchTerms.length > 0) {
    body.search = searchTerms.join(" ");
  }
}

// ---- Shared types ----

export interface BuildExtras {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface BuildResult<TBody> {
  readonly body: TBody;
  readonly warnings: readonly TranslationWarning[];
}

/**
 * Initializes the base body with startTime, endTime, and optional extras.
 */
export function initBody<
  T extends { startTime: number; endTime: number; limit?: number; cursor?: string },
>(startTime: number, endTime: number, extras: BuildExtras = {}): T {
  const body = { startTime, endTime } as T;
  if (extras.limit !== undefined) (body as Record<string, unknown>).limit = extras.limit;
  if (extras.cursor) (body as Record<string, unknown>).cursor = extras.cursor;
  return body;
}

/**
 * Dispatches `@key` filters through the shared attribute handler,
 * and collects "body"/"search" fields as search terms.
 * Returns true if the filter was handled, false if caller should handle it.
 */
export function dispatchCommonFilter<
  T extends { attributes?: Array<{ key: string; op?: string; value: string }> },
>(filter: ExplorerFilter, body: T, warnings: TranslationWarning[], searchTerms: string[]): boolean {
  const { field, op, value } = filter;

  // Attribute filters: @key
  if (field.startsWith("@")) {
    handleAttribute(field, op, value, body, warnings);
    return true;
  }

  // Search/body filters
  if (field === "search" || field === "body") {
    if (op === "contains" || op === "eq") {
      searchTerms.push(value);
    } else {
      pushUnsupportedOp(warnings, field, op, "only contains/eq supported");
    }
    return true;
  }

  return false;
}
