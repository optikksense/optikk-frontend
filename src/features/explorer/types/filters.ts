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

export type ExplorerScope = "logs" | "traces";
