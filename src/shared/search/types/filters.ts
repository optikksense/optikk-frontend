/**
 * Structured filter — the v1 filter seam shared by logs and traces explorers.
 *
 * A future DSL will compile to the same shape (see backend `querycompiler`),
 * so FE chips / URL state / API payloads all round-trip through this type.
 */
export interface ExplorerFilter {
  readonly field: string;
  readonly op: ExplorerFilterOp;
  readonly value: string;
}

export type ExplorerFilterOp =
  | "eq"
  | "neq"
  | "contains"
  | "not_contains"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "in"
  | "not_in"
  | "exists"
  | "not_exists";

export type ExplorerMode = "list" | "analytics";

/**
 * Soft failure emitted when a filter can't be expressed on the wire.
 * Builders return these instead of dropping filters silently; the explorer
 * pages surface them under the search bar.
 */
export interface TranslationWarning {
  readonly code: "unsupported_op" | "unknown_field" | "duplicate_single_value";
  readonly field: string;
  readonly message: string;
}

export type ExplorerScope = "ai" | "logs" | "traces";
