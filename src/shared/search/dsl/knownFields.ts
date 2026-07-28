import type { ExplorerFilterOp, ExplorerScope } from "../types/filters";

type FieldType = "string" | "number" | "bool";

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
    key: "spanKind",
    label: "Span kind",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "SERVER / CLIENT / PRODUCER / CONSUMER / INTERNAL",
    typeBadge: "ENUM",
    icon: "field",
  },
  {
    key: "httpMethod",
    label: "HTTP method",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "GET / POST / …",
    typeBadge: "ENUM",
    icon: "field",
  },
  {
    key: "httpStatus",
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
    key: "peerService",
    label: "Peer service",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Downstream service called by this span",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "traceId",
    label: "Trace ID",
    type: "string",
    ops: ID_OPS,
    category: "Identifiers",
    description: "Hex-encoded trace identifier",
    typeBadge: "ID",
    icon: "id",
  },
  {
    key: "durationMs",
    label: "Duration (ms)",
    type: "number",
    ops: NUMBER_OPS,
    category: "Common",
    description: "Span duration in milliseconds",
    typeBadge: "NUM",
    icon: "field",
  },
  {
    key: "hasError",
    label: "Has error",
    type: "bool",
    ops: BOOL_OPS,
    category: "Common",
    description: "Whether the span recorded an error",
    typeBadge: "BOOL",
    icon: "field",
  },
];

const LOG_KNOWN_FIELDS: readonly KnownField[] = [
  {
    key: "serviceName",
    label: "Service",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "OTel service.name resource attribute",
    typeBadge: "STR",
    icon: "field",
  },
  {
    key: "severityText",
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
    key: "traceId",
    label: "Trace ID",
    type: "string",
    ops: ID_OPS,
    category: "Identifiers",
    description: "Hex-encoded trace identifier",
    typeBadge: "ID",
    icon: "id",
  },
  {
    key: "spanId",
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

export const CATEGORY_ORDER: readonly FieldCategory[] = [
  "Common",
  "Identifiers",
  "Resource",
  "Attributes",
];

export function knownFieldsForScope(scope: ExplorerScope | undefined): readonly KnownField[] {
  return scope === "logs" ? LOG_KNOWN_FIELDS : TRACE_KNOWN_FIELDS;
}

export function findKnownField(
  key: string,
  fields: readonly KnownField[] = TRACE_KNOWN_FIELDS
): KnownField | undefined {
  return fields.find((f) => f.key === key);
}

const SUGGESTABLE_TRACE_FIELDS = new Set([
  "service",
  "operation",
  "httpMethod",
  "httpStatus",
  "status",
  "environment",
]);

const SUGGESTABLE_LOG_FIELDS = new Set([
  "serviceName",
  "severityText",
  "host",
  "pod",
  "container",
  "environment",
]);

export function suggestableScalarFieldsForScope(
  scope: ExplorerScope | undefined
): ReadonlySet<string> {
  return scope === "logs" ? SUGGESTABLE_LOG_FIELDS : SUGGESTABLE_TRACE_FIELDS;
}

export interface OperatorOption {
  readonly insert: string;
  readonly label: string;
  readonly description: string;
  readonly typeBadge: TypeBadge;
}

export const OPERATOR_OPTIONS: readonly OperatorOption[] = [
  { insert: ":", label: ":", description: "equals — service:checkout", typeBadge: "OP" },
  { insert: "!=", label: "!=", description: "not equals — -service:checkout", typeBadge: "OP" },
  { insert: ":(", label: "IN(...)", description: "any of — service:(api OR web)", typeBadge: "OP" },
  {
    insert: ":>=",
    label: ">=",
    description: "greater or equal — durationMs:>=500",
    typeBadge: "OP",
  },
  { insert: ":>", label: ">", description: "greater than", typeBadge: "OP" },
  { insert: ":<=", label: "<=", description: "less or equal", typeBadge: "OP" },
  { insert: ":<", label: "<", description: "less than", typeBadge: "OP" },
];

export interface QuickTemplate {
  readonly label: string;
  readonly query: string;
  readonly description: string;
}

const QUICK_TEMPLATES_LOGS: readonly QuickTemplate[] = [
  { label: "Errors only", query: "severityText:ERROR", description: "ERROR-level logs" },
  {
    label: "Errors and fatals",
    query: "severityText:(ERROR OR FATAL)",
    description: "ERROR + FATAL severity",
  },
  { label: "By service", query: "serviceName:", description: "Filter by service — type a name" },
  { label: "By trace ID", query: "traceId:", description: "Lookup logs for a trace" },
  { label: "Body contains", query: '"timeout"', description: "Free-text body search" },
];

const QUICK_TEMPLATES_TRACES: readonly QuickTemplate[] = [
  { label: "Errors only", query: "hasError:true", description: "Traces with recorded errors" },
  { label: "Slow requests", query: "durationMs:>=500", description: "Traces ≥ 500ms" },
  {
    label: "5xx responses",
    query: "httpStatus:(500 OR 502 OR 503 OR 504)",
    description: "Server-error responses",
  },
  { label: "By service", query: "service:", description: "Filter by service — type a name" },
];

export function quickTemplatesForScope(scope: ExplorerScope | undefined): readonly QuickTemplate[] {
  return scope === "logs" ? QUICK_TEMPLATES_LOGS : QUICK_TEMPLATES_TRACES;
}

const SYNTAX_EXAMPLES_LOGS: readonly QuickTemplate[] = [
  { label: "Exclude", query: "-severityText:INFO", description: "Leading - negates a filter" },
  {
    label: "Any of",
    query: "severityText:(ERROR OR FATAL)",
    description: "Match any listed value",
  },
  {
    label: "Attribute",
    query: "@http.statusCode:500",
    description: "@key filters custom attributes",
  },
  {
    label: "Has attribute",
    query: "@user.id:*",
    description: ":* matches when the attribute exists",
  },
];

const SYNTAX_EXAMPLES_TRACES: readonly QuickTemplate[] = [
  { label: "Exclude", query: "-service:noisy-svc", description: "Leading - negates a filter" },
  { label: "Any of", query: "httpStatus:(500 OR 503)", description: "Match any listed value" },
  { label: "Compare", query: "@retry.count:>=3", description: ">= > <= < on numeric values" },
  {
    label: "Has attribute",
    query: "@user.id:*",
    description: ":* matches when the attribute exists",
  },
];

export function syntaxExamplesForScope(scope: ExplorerScope | undefined): readonly QuickTemplate[] {
  return scope === "logs" ? SYNTAX_EXAMPLES_LOGS : SYNTAX_EXAMPLES_TRACES;
}

export const POPULAR_ATTRIBUTE_KEYS: readonly { key: string; description: string }[] = [
  { key: "@http.statusCode", description: "HTTP response status code" },
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
