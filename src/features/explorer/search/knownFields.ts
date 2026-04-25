import type { ExplorerFilterOp } from "../types/filters";

export type FieldType = "string" | "number" | "bool";

export interface KnownField {
  readonly key: string;
  readonly label: string;
  readonly type: FieldType;
  readonly ops: readonly ExplorerFilterOp[];
}

const STRING_OPS: readonly ExplorerFilterOp[] = ["eq", "neq", "contains", "not_contains", "in", "not_in"];
const NUMBER_OPS: readonly ExplorerFilterOp[] = ["eq", "neq", "gt", "gte", "lt", "lte"];
const BOOL_OPS: readonly ExplorerFilterOp[] = ["eq", "neq"];

/** Mirrors the scalar fields understood by backend querycompiler/structured.go. */
export const KNOWN_FIELDS: readonly KnownField[] = [
  { key: "service", label: "Service", type: "string", ops: STRING_OPS },
  { key: "operation", label: "Operation", type: "string", ops: STRING_OPS },
  { key: "span_kind", label: "Span kind", type: "string", ops: STRING_OPS },
  { key: "http_method", label: "HTTP method", type: "string", ops: STRING_OPS },
  { key: "http_status", label: "HTTP status", type: "number", ops: NUMBER_OPS },
  { key: "status", label: "Status", type: "string", ops: STRING_OPS },
  { key: "environment", label: "Environment", type: "string", ops: STRING_OPS },
  { key: "peer_service", label: "Peer service", type: "string", ops: STRING_OPS },
  { key: "trace_id", label: "Trace ID", type: "string", ops: STRING_OPS },
  { key: "duration_ms", label: "Duration (ms)", type: "number", ops: NUMBER_OPS },
  { key: "has_error", label: "Has error", type: "bool", ops: BOOL_OPS },
];

export function findKnownField(key: string): KnownField | undefined {
  return KNOWN_FIELDS.find((f) => f.key === key);
}

/** Fields with backend-backed value suggestions (BE trace_suggest scalar path). */
export const SUGGESTABLE_SCALAR_FIELDS = new Set([
  "service", "operation", "http_method", "http_status", "status", "environment",
]);
