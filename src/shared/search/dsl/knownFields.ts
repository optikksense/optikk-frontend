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

/**
 * Errors are spans with `is_error = 1`, so the scope reuses the span fields
 * that still discriminate between error groups, plus the two that only exist
 * on an error: its status message and its exception class.
 */
const ERROR_SPAN_FIELD_KEYS = new Set([
  "service",
  "operation",
  "httpStatus",
  "environment",
  "peerService",
  "traceId",
  "durationMs",
]);

const ERROR_KNOWN_FIELDS: readonly KnownField[] = [
  ...TRACE_KNOWN_FIELDS.filter((f) => ERROR_SPAN_FIELD_KEYS.has(f.key)),
  {
    key: "message",
    label: "Message",
    type: "string",
    ops: TEXT_OPS,
    category: "Common",
    description: "Free-text search across the error status message",
    typeBadge: "TXT",
    icon: "body",
  },
  {
    key: "exceptionType",
    label: "Exception type",
    type: "string",
    ops: STRING_OPS,
    category: "Common",
    description: "Exception / error class name",
    typeBadge: "STR",
    icon: "field",
  },
];

function domainField(
  key: string,
  label: string,
  type: FieldType,
  description: string,
  category: FieldCategory = "Common"
): KnownField {
  return {
    key,
    label,
    type,
    ops: type === "number" ? NUMBER_OPS : type === "bool" ? BOOL_OPS : STRING_OPS,
    category,
    description,
    typeBadge: type === "number" ? "NUM" : type === "bool" ? "BOOL" : "STR",
    icon: category === "Resource" ? "resource" : "field",
  };
}

const DEPLOYMENT_KNOWN_FIELDS: readonly KnownField[] = [
  domainField("service", "Service", "string", "Service reporting the version"),
  domainField("version", "Version", "string", "Reported service.version"),
  domainField("environment", "Environment", "string", "Deployment environment", "Resource"),
  domainField("requestCount", "Requests", "number", "Requests served by the deployment"),
  domainField("trafficShare", "Traffic share", "number", "Percentage of service traffic"),
  domainField("errorRate", "Error rate", "number", "Percentage of errored requests"),
  domainField("p95Ms", "P95 latency", "number", "95th percentile latency in milliseconds"),
];

const SERVICE_KNOWN_FIELDS: readonly KnownField[] = [
  domainField("service", "Service", "string", "Service name"),
  domainField("status", "Status", "string", "Derived service health status"),
  domainField("rps", "RPS", "number", "Requests per second"),
  domainField("errorRate", "Error rate", "number", "Percentage of errored requests"),
  domainField("p99Ms", "P99 latency", "number", "99th percentile latency in milliseconds"),
  domainField("version", "Version", "string", "Reported service.version", "Resource"),
  domainField("environment", "Environment", "string", "Deployment environment", "Resource"),
];

const LLM_TRACE_KNOWN_FIELDS: readonly KnownField[] = [
  domainField("service", "Service", "string", "Service that emitted the LLM trace"),
  domainField("operation", "Operation", "string", "Root LLM operation"),
  domainField("vendor", "Vendor", "string", "LLM provider"),
  domainField("model", "Model", "string", "Requested LLM model"),
  domainField("userId", "User ID", "string", "Application user identifier", "Identifiers"),
  domainField("sessionId", "Session ID", "string", "LLM session identifier", "Identifiers"),
  domainField("status", "Status", "string", "Trace status"),
  domainField("durationMs", "Duration", "number", "Trace duration in milliseconds"),
  domainField("cost", "Cost", "number", "Estimated trace cost"),
];

const INFRASTRUCTURE_HOST_KNOWN_FIELDS: readonly KnownField[] = [
  domainField("host", "Host", "string", "Infrastructure host", "Resource"),
  domainField("service", "Service", "string", "Service running on the host"),
  domainField("status", "Status", "string", "Derived host health status"),
  domainField("requestCount", "Requests", "number", "Requests observed on the host"),
  domainField("errorRate", "Error rate", "number", "Percentage of errored requests"),
  domainField("p95Ms", "P95 latency", "number", "95th percentile latency in milliseconds"),
];

const INFRASTRUCTURE_CONTAINER_KNOWN_FIELDS: readonly KnownField[] = [
  domainField("container", "Container", "string", "Kubernetes pod or container name", "Resource"),
  ...INFRASTRUCTURE_HOST_KNOWN_FIELDS,
];

const DATABASE_INSTANCE_KNOWN_FIELDS: readonly KnownField[] = [
  domainField("system", "System", "string", "Database engine"),
  domainField("category", "Category", "string", "Database or cache"),
  domainField("status", "Status", "string", "Derived system health status"),
  domainField("queryCount", "Queries", "number", "Queries observed in the selected range"),
  domainField("avgMs", "Average latency", "number", "Average query latency in milliseconds"),
  domainField("p95Ms", "P95 latency", "number", "95th percentile query latency in milliseconds"),
  domainField("errorRate", "Error rate", "number", "Percentage of errored queries"),
  domainField("connections", "Connections", "number", "Latest open connection count"),
];

const DATABASE_QUERY_KNOWN_FIELDS: readonly KnownField[] = [
  domainField("dbSystem", "System", "string", "Database engine"),
  domainField("collection", "Database", "string", "Database or collection name"),
  domainField("service", "Service", "string", "Service issuing the query"),
  domainField("queryText", "Query", "string", "Normalized query text"),
  domainField("callCount", "Calls", "number", "Executions in the selected range"),
  domainField("errorCount", "Errors", "number", "Errored executions in the selected range"),
  domainField("p50Ms", "P50 latency", "number", "Median query latency in milliseconds"),
  domainField("p95Ms", "P95 latency", "number", "95th percentile query latency in milliseconds"),
  domainField("p99Ms", "P99 latency", "number", "99th percentile query latency in milliseconds"),
];

export const CATEGORY_ORDER: readonly FieldCategory[] = [
  "Common",
  "Identifiers",
  "Resource",
  "Attributes",
];

export function findKnownField(
  key: string,
  fields: readonly KnownField[] = TRACE_KNOWN_FIELDS
): KnownField | undefined {
  return fields.find((f) => f.key === key);
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

const QUICK_TEMPLATES_ERRORS: readonly QuickTemplate[] = [
  {
    label: "5xx responses",
    query: "httpStatus:(500 OR 502 OR 503 OR 504)",
    description: "Server-error responses",
  },
  { label: "By service", query: "service:", description: "Filter by service — type a name" },
  { label: "By exception", query: "exceptionType:", description: "Filter by exception class" },
  { label: "Message contains", query: '"timeout"', description: "Free-text message search" },
];

const QUICK_TEMPLATES_DEPLOYMENTS: readonly QuickTemplate[] = [
  {
    label: "High errors",
    query: "errorRate:>=2",
    description: "Deployments at or above 2% errors",
  },
  { label: "Slow P95", query: "p95Ms:>=500", description: "Deployments with P95 at least 500ms" },
  { label: "By environment", query: "environment:", description: "Filter by environment" },
];

const QUICK_TEMPLATES_SERVICES: readonly QuickTemplate[] = [
  {
    label: "Unhealthy",
    query: "status:(warn OR error)",
    description: "Services needing attention",
  },
  { label: "High errors", query: "errorRate:>=2", description: "Services at or above 2% errors" },
  {
    label: "Slow P99",
    query: "p99Ms:>=1000",
    description: "Services with P99 at least one second",
  },
];

const QUICK_TEMPLATES_LLM_TRACES: readonly QuickTemplate[] = [
  { label: "Errors only", query: "status:error", description: "Failed LLM traces" },
  {
    label: "Slow traces",
    query: "durationMs:>=1000",
    description: "LLM traces at least one second",
  },
  { label: "By model", query: "model:", description: "Filter by model" },
];

const QUICK_TEMPLATES_INFRASTRUCTURE: readonly QuickTemplate[] = [
  {
    label: "Needs attention",
    query: "status:(degraded OR unhealthy)",
    description: "Infrastructure with degraded health",
  },
  { label: "High errors", query: "errorRate:>=2", description: "Entities at or above 2% errors" },
  { label: "By service", query: "service:", description: "Filter by hosted service" },
];

const QUICK_TEMPLATES_DATABASE: readonly QuickTemplate[] = [
  {
    label: "Needs attention",
    query: "status:(degraded OR critical)",
    description: "Unhealthy systems",
  },
  { label: "Slow P95", query: "p95Ms:>=500", description: "P95 latency at least 500ms" },
  { label: "By system", query: "system:", description: "Filter by database engine" },
];

const QUICK_TEMPLATES_DATABASE_QUERIES: readonly QuickTemplate[] = [
  { label: "Slow P99", query: "p99Ms:>=500", description: "P99 latency at least 500ms" },
  { label: "With errors", query: "errorCount:>0", description: "Queries with errors" },
  { label: "By system", query: "dbSystem:", description: "Filter by database engine" },
];

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

const SYNTAX_EXAMPLES_ERRORS: readonly QuickTemplate[] = [
  { label: "Exclude", query: "-service:noisy-svc", description: "Leading - negates a filter" },
  { label: "Any of", query: "httpStatus:(500 OR 503)", description: "Match any listed value" },
  { label: "Message", query: 'message:"deadline"', description: "Substring of the error message" },
  {
    label: "Has attribute",
    query: "@user.id:*",
    description: ":* matches when the attribute exists",
  },
];

/**
 * Everything the search bar needs to know about one scope. Adding a scope is
 * one entry here — the bar, the parser and the suggestions read from it.
 */
interface ScopeDsl {
  readonly fields: readonly KnownField[];
  /** Fields the backend can suggest values for; the rest stay free-text. */
  readonly suggestable: ReadonlySet<string>;
  readonly templates: readonly QuickTemplate[];
  readonly syntax: readonly QuickTemplate[];
}

const SCOPE_DSL: Readonly<Record<ExplorerScope, ScopeDsl>> = {
  logs: {
    fields: LOG_KNOWN_FIELDS,
    suggestable: new Set([
      "serviceName",
      "severityText",
      "host",
      "pod",
      "container",
      "environment",
    ]),
    templates: QUICK_TEMPLATES_LOGS,
    syntax: SYNTAX_EXAMPLES_LOGS,
  },
  traces: {
    fields: TRACE_KNOWN_FIELDS,
    suggestable: new Set([
      "service",
      "operation",
      "httpMethod",
      "httpStatus",
      "status",
      "environment",
    ]),
    templates: QUICK_TEMPLATES_TRACES,
    syntax: SYNTAX_EXAMPLES_TRACES,
  },
  errors: {
    fields: ERROR_KNOWN_FIELDS,
    // Errors resolve values through the traces suggest endpoint, which knows
    // only these scalar span columns.
    suggestable: new Set(["service", "operation", "httpStatus", "environment"]),
    templates: QUICK_TEMPLATES_ERRORS,
    syntax: SYNTAX_EXAMPLES_ERRORS,
  },
  deployments: {
    fields: DEPLOYMENT_KNOWN_FIELDS,
    suggestable: new Set(),
    templates: QUICK_TEMPLATES_DEPLOYMENTS,
    syntax: SYNTAX_EXAMPLES_TRACES,
  },
  services: {
    fields: SERVICE_KNOWN_FIELDS,
    suggestable: new Set(),
    templates: QUICK_TEMPLATES_SERVICES,
    syntax: SYNTAX_EXAMPLES_TRACES,
  },
  "llm-traces": {
    fields: LLM_TRACE_KNOWN_FIELDS,
    suggestable: new Set(),
    templates: QUICK_TEMPLATES_LLM_TRACES,
    syntax: SYNTAX_EXAMPLES_TRACES,
  },
  "infrastructure-hosts": {
    fields: INFRASTRUCTURE_HOST_KNOWN_FIELDS,
    suggestable: new Set(),
    templates: QUICK_TEMPLATES_INFRASTRUCTURE,
    syntax: SYNTAX_EXAMPLES_TRACES,
  },
  "infrastructure-containers": {
    fields: INFRASTRUCTURE_CONTAINER_KNOWN_FIELDS,
    suggestable: new Set(),
    templates: QUICK_TEMPLATES_INFRASTRUCTURE,
    syntax: SYNTAX_EXAMPLES_TRACES,
  },
  "database-instances": {
    fields: DATABASE_INSTANCE_KNOWN_FIELDS,
    suggestable: new Set(),
    templates: QUICK_TEMPLATES_DATABASE,
    syntax: SYNTAX_EXAMPLES_TRACES,
  },
  "database-queries": {
    fields: DATABASE_QUERY_KNOWN_FIELDS,
    suggestable: new Set(),
    templates: QUICK_TEMPLATES_DATABASE_QUERIES,
    syntax: SYNTAX_EXAMPLES_TRACES,
  },
};

function scopeDsl(scope: ExplorerScope | undefined): ScopeDsl {
  return SCOPE_DSL[scope ?? "traces"];
}

export function knownFieldsForScope(scope: ExplorerScope | undefined): readonly KnownField[] {
  return scopeDsl(scope).fields;
}

export function suggestableScalarFieldsForScope(
  scope: ExplorerScope | undefined
): ReadonlySet<string> {
  return scopeDsl(scope).suggestable;
}

export function quickTemplatesForScope(scope: ExplorerScope | undefined): readonly QuickTemplate[] {
  return scopeDsl(scope).templates;
}

export function syntaxExamplesForScope(scope: ExplorerScope | undefined): readonly QuickTemplate[] {
  return scopeDsl(scope).syntax;
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
