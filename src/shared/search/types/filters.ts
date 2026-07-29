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

export interface TranslationWarning {
  readonly code: "unsupported_op" | "unknown_field" | "duplicate_single_value";
  readonly field: string;
  readonly message: string;
}

export type ExplorerScope = "logs" | "traces" | "errors";
