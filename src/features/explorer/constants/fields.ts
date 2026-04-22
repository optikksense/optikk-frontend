import type { ExplorerFilterOp, ExplorerScope } from "../types/filters";

export interface QueryFieldOption {
  readonly key: string;
  readonly label: string;
  readonly group?: string;
  readonly type?: "string" | "number" | "boolean";
  readonly ops?: readonly ExplorerFilterOp[];
}

const STRING_OPS = ["eq", "neq", "contains", "not_contains"] as const satisfies readonly ExplorerFilterOp[];
const NUMERIC_OPS = ["eq", "gt", "gte", "lt", "lte"] as const satisfies readonly ExplorerFilterOp[];

export const LOGS_FIELDS: readonly QueryFieldOption[] = [
  { key: "service_name", label: "Service", group: "Core", type: "string", ops: STRING_OPS },
  { key: "severity_text", label: "Severity", group: "Core", type: "string", ops: STRING_OPS },
  { key: "severity_bucket", label: "Severity bucket", group: "Core", type: "number", ops: NUMERIC_OPS },
  { key: "host", label: "Host", group: "Infra", type: "string", ops: STRING_OPS },
  { key: "pod", label: "Pod", group: "Infra", type: "string", ops: STRING_OPS },
  { key: "container", label: "Container", group: "Infra", type: "string", ops: STRING_OPS },
  { key: "environment", label: "Environment", group: "Infra", type: "string", ops: STRING_OPS },
  { key: "scope_name", label: "Scope", group: "Core", type: "string", ops: STRING_OPS },
  { key: "trace_id", label: "Trace ID", group: "Correlation", type: "string", ops: STRING_OPS },
  { key: "span_id", label: "Span ID", group: "Correlation", type: "string", ops: STRING_OPS },
  { key: "body", label: "Message", group: "Core", type: "string", ops: ["contains", "not_contains"] },
];

export const TRACES_FIELDS: readonly QueryFieldOption[] = [
  { key: "service_name", label: "Service", group: "Core", type: "string", ops: STRING_OPS },
  { key: "operation_name", label: "Operation", group: "Core", type: "string", ops: STRING_OPS },
  { key: "status", label: "Status", group: "Core", type: "string", ops: STRING_OPS },
  { key: "http_method", label: "HTTP method", group: "HTTP", type: "string", ops: STRING_OPS },
  { key: "http_status_code", label: "HTTP status", group: "HTTP", type: "number", ops: NUMERIC_OPS },
  { key: "span_kind", label: "Span kind", group: "Core", type: "string", ops: STRING_OPS },
  { key: "duration_ms", label: "Duration (ms)", group: "Perf", type: "number", ops: NUMERIC_OPS },
  { key: "trace_id", label: "Trace ID", group: "Correlation", type: "string", ops: STRING_OPS },
  { key: "environment", label: "Environment", group: "Infra", type: "string", ops: STRING_OPS },
];

export function fieldsForScope(scope: ExplorerScope): readonly QueryFieldOption[] {
  return scope === "logs" ? LOGS_FIELDS : TRACES_FIELDS;
}
