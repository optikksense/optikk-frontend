import type { ExplorerFilterOp, ExplorerScope } from "../types/filters";

export type FieldType = "string" | "number" | "bool";

export type FieldCategory = "Common" | "Identifiers" | "Resource" | "Attributes";

export type SuggestionIcon =
  | "field"
  | "id"
  | "attr"
  | "severity"
  | "resource"
  | "body"
  | "recent"
  | "view"
  | "template"
  | "operator";

export type TypeBadge = "STR" | "NUM" | "ID" | "TXT" | "ENUM" | "OP" | "BOOL";

export interface KnownField {
  readonly key: string;
  readonly label: string;
  readonly type: FieldType;
  readonly ops: readonly ExplorerFilterOp[];
  readonly category: FieldCategory;
  readonly description: string;
  readonly typeBadge: TypeBadge;
  readonly icon: SuggestionIcon;
}

const STRING_OPS: readonly ExplorerFilterOp[] = [
  "eq",
  "neq",
  "contains",
  "not_contains",
  "in",
  "not_in",
];
const NUMBER_OPS: readonly ExplorerFilterOp[] = ["eq", "neq", "gt", "gte", "lt", "lte"];
const BOOL_OPS: readonly ExplorerFilterOp[] = ["eq", "neq"];
const TEXT_OPS: readonly ExplorerFilterOp[] = ["contains", "not_contains", "eq"];
const ID_OPS: readonly ExplorerFilterOp[] = ["eq"];

/** Mirrors the scalar fields understood by backend querycompiler/structured.go. */
export const TRACE_KNOWN_FIELDS: readonly KnownField[] = [
  {
    key: "service",
    label: "Service",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "OTel service.name resource attribute",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "operation",
    label: "Operation",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Span operation name",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "span_kind",
    label: "Span kind",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "SERVER / CLIENT / PRODUCER / CONSUMER / INTERNAL",
    typeBadge: "ENUM",
    icon: "field",
  },
  {
    key: "http_method",
    label: "HTTP method",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "GET / POST / …",
    typeBadge: "ENUM",
    icon: "field",
  },
  {
    key: "http_status",
    label: "HTTP status",
    type: "number",
    ops: NUMBER_OPS,
    category: "Common",
    description: "Response status code (200, 404, 500…)",
    typeBadge: "NUM",
    icon: "field",
  },
  {
    key: "status",
    label: "Status",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "OK / ERROR / UNSET",
    typeBadge: "ENUM",
    icon: "field",
  },
  {
    key: "environment",
    label: "Environment",
    type: "string",
    ops: STRING_OPS,
    category: "Resource",
    description: "deployment.environment resource attribute",
    typeBadge: "STR",
    icon: "resource",
  },
  {
    key: "peer_service",
    label: "Peer service",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Downstream service called by this span",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "trace_id",
    label: "Trace ID",
    type: "string",
    ops: ID_OPS,
    category: "Identifiers",
    description: "Hex-encoded trace identifier",
    typeBadge: "ID",
    icon: "id",
  },
  {
    key: "duration_ms",
    label: "Duration (ms)",
    type: "number",
    ops: NUMBER_OPS,
    category: "Common",
    description: "Span duration in milliseconds",
    typeBadge: "NUM",
    icon: "field",
  },
  {
    key: "has_error",
    label: "Has error",
    type: "bool",
    ops: BOOL_OPS,
    category: "Common",
    description: "Whether the span recorded an error",
    typeBadge: "BOOL",
    icon: "field",
  },
];

export const LOG_KNOWN_FIELDS: readonly KnownField[] = [
  {
    key: "service_name",
    label: "Service",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "OTel service.name resource attribute",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "severity_text",
    label: "Severity",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "TRACE / DEBUG / INFO / WARN / ERROR / FATAL",
    typeBadge: "ENUM",
    icon: "severity",
  },
  {
    key: "body",
    label: "Message body",
    type: "string",
    ops: TEXT_OPS,
    category: "Common",
    description: "Free-text search across log message body",
    typeBadge: "TXT",
    icon: "body",
  },
  {
    key: "trace_id",
    label: "Trace ID",
    type: "string",
    ops: ID_OPS,
    category: "Identifiers",
    description: "Hex-encoded trace identifier",
    typeBadge: "ID",
    icon: "id",
  },
  {
    key: "span_id",
    label: "Span ID",
    type: "string",
    ops: ID_OPS,
    category: "Identifiers",
    description: "Hex-encoded span identifier",
    typeBadge: "ID",
    icon: "id",
  },
  {
    key: "host",
    label: "Host",
    type: "string",
    ops: STRING_OPS,
    category: "Resource",
    description: "Hostname emitting the log",
    typeBadge: "STR",
    icon: "resource",
  },
  {
    key: "pod",
    label: "Pod",
    type: "string",
    ops: STRING_OPS,
    category: "Resource",
    description: "Kubernetes pod name",
    typeBadge: "STR",
    icon: "resource",
  },
  {
    key: "container",
    label: "Container",
    type: "string",
    ops: STRING_OPS,
    category: "Resource",
    description: "Kubernetes container name",
    typeBadge: "STR",
    icon: "resource",
  },
  {
    key: "environment",
    label: "Environment",
    type: "string",
    ops: STRING_OPS,
    category: "Resource",
    description: "deployment.environment resource attribute",
    typeBadge: "STR",
    icon: "resource",
  },
];

export const AI_KNOWN_FIELDS: readonly KnownField[] = [
  {
    key: "provider",
    label: "Provider",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "GenAI provider name",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "model",
    label: "Model",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Request or response model",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "operation",
    label: "Operation",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "GenAI operation name",
    typeBadge: "ENUM",
    icon: "field",
  },
  {
    key: "spanType",
    label: "Span type",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "MLflow-style AI span type",
    typeBadge: "ENUM",
    icon: "field",
  },
  {
    key: "service",
    label: "Service",
    type: "string",
    ops: STRING_OPS,
    category: "Resource",
    description: "OTel service.name resource attribute",
    typeBadge: "STR",
    icon: "resource",
  },
  {
    key: "environment",
    label: "Environment",
    type: "string",
    ops: STRING_OPS,
    category: "Resource",
    description: "deployment.environment resource attribute",
    typeBadge: "STR",
    icon: "resource",
  },
  {
    key: "promptName",
    label: "Prompt",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Prompt tracking name",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "promptVersion",
    label: "Prompt version",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Prompt tracking version",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "agentName",
    label: "Agent",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Agent or workflow name",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "toolName",
    label: "Tool",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Tool call name",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "dataSource",
    label: "Data source",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Retrieval store or data source",
    typeBadge: "STR",
    icon: "field",
  },
];

export const CATEGORY_ORDER: readonly FieldCategory[] = [
  "Common",
  "Identifiers",
  "Resource",
  "Attributes",
];

export function knownFieldsForScope(scope: ExplorerScope | undefined): readonly KnownField[] {
  if (scope === "ai") return AI_KNOWN_FIELDS;
  return scope === "logs" ? LOG_KNOWN_FIELDS : TRACE_KNOWN_FIELDS;
}

export function findKnownField(
  key: string,
  fields: readonly KnownField[] = TRACE_KNOWN_FIELDS
): KnownField | undefined {
  return fields.find((f) => f.key === key);
}

/** Fields with backend-backed value suggestions (BE trace_suggest scalar path). */
export const SUGGESTABLE_SCALAR_FIELDS = new Set([
  "service",
  "operation",
  "http_method",
  "http_status",
  "status",
  "environment",
]);

// ---------- Operator catalogue ----------

export interface OperatorOption {
  readonly insert: string;
  readonly label: string;
  readonly description: string;
  readonly typeBadge: TypeBadge;
}

/**
 * Operators surfaced when caret lands on a known field with no `:` typed yet.
 * `insert` is the raw token the hook hands to `applyOperator`; the special
 * value `!=` is recognised as a neq-rewrite (prefix the key with `-`). Every
 * other value is appended verbatim after the trimmed input.
 */
export const OPERATOR_OPTIONS: readonly OperatorOption[] = [
  { insert: ":", label: ":", description: "equals — service:checkout", typeBadge: "OP" },
  { insert: "!=", label: "!=", description: "not equals — -service:checkout", typeBadge: "OP" },
  { insert: ":(", label: "IN(...)", description: "any of — service:(api OR web)", typeBadge: "OP" },
  {
    insert: ":>=",
    label: ">=",
    description: "greater or equal — duration_ms:>=500",
    typeBadge: "OP",
  },
  { insert: ":>", label: ">", description: "greater than", typeBadge: "OP" },
  { insert: ":<=", label: "<=", description: "less or equal", typeBadge: "OP" },
  { insert: ":<", label: "<", description: "less than", typeBadge: "OP" },
];

// ---------- Quick templates per scope ----------

export interface QuickTemplate {
  readonly label: string;
  readonly query: string;
  readonly description: string;
}

export const QUICK_TEMPLATES_LOGS: readonly QuickTemplate[] = [
  { label: "Errors only", query: "severity_text:ERROR", description: "ERROR-level logs" },
  {
    label: "Errors and fatals",
    query: "severity_text:(ERROR OR FATAL)",
    description: "ERROR + FATAL severity",
  },
  { label: "By service", query: "service_name:", description: "Filter by service — type a name" },
  { label: "By trace ID", query: "trace_id:", description: "Lookup logs for a trace" },
  { label: "Body contains", query: '"timeout"', description: "Free-text body search" },
];

export const QUICK_TEMPLATES_TRACES: readonly QuickTemplate[] = [
  { label: "Errors only", query: "has_error:true", description: "Spans with recorded errors" },
  { label: "Slow requests", query: "duration_ms:>=500", description: "Spans ≥ 500ms" },
  { label: "5xx responses", query: "http_status:>=500", description: "Server-error responses" },
  { label: "By service", query: "service:", description: "Filter by service — type a name" },
];

export const QUICK_TEMPLATES_AI: readonly QuickTemplate[] = [
  { label: "Chat models", query: "spanType:CHAT_MODEL", description: "LLM chat/completion calls" },
  { label: "Tools", query: "spanType:TOOL", description: "Agent tool executions" },
  { label: "Retrieval", query: "spanType:RETRIEVER", description: "RAG retrieval spans" },
  { label: "By model", query: "model:", description: "Filter by model name" },
];

export function quickTemplatesForScope(scope: ExplorerScope | undefined): readonly QuickTemplate[] {
  if (scope === "ai") return QUICK_TEMPLATES_AI;
  return scope === "logs" ? QUICK_TEMPLATES_LOGS : QUICK_TEMPLATES_TRACES;
}

/** Curated popular attribute keys offered when the user types `@`. */
export const POPULAR_ATTRIBUTE_KEYS: readonly { key: string; description: string }[] = [
  { key: "@http.status_code", description: "HTTP response status code" },
  { key: "@http.method", description: "HTTP request method" },
  { key: "@http.route", description: "Matched HTTP route template" },
  { key: "@http.url", description: "Full request URL" },
  { key: "@user.id", description: "Authenticated user identifier" },
  { key: "@error.type", description: "Error / exception class name" },
  { key: "@db.system", description: "Database system (postgresql, mysql, …)" },
  { key: "@db.operation", description: "Database operation (SELECT, INSERT, …)" },
  { key: "@k8s.namespace", description: "Kubernetes namespace" },
  { key: "@k8s.deployment.name", description: "Kubernetes deployment name" },
];
