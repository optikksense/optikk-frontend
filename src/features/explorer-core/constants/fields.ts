/** Known query fields for autocomplete (logs scope) — aligns with backend queryparser logs schema. */
export const LOGS_QUERY_FIELDS = [
  { name: "service", description: "Service name" },
  { name: "status", description: "Log severity level" },
  { name: "host", description: "Hostname" },
  { name: "pod", description: "Kubernetes pod" },
  { name: "container", description: "Container name" },
  { name: "environment", description: "Deployment environment" },
  { name: "scope_name", description: "Logger / scope name" },
  { name: "trace_id", description: "Trace ID" },
  { name: "span_id", description: "Span ID" },
] as const;

/** Known query fields for autocomplete (traces scope) — aligns with backend queryparser traces schema. */
export const TRACES_QUERY_FIELDS = [
  { name: "service", description: "Service name" },
  { name: "operation", description: "Operation / span name" },
  { name: "status", description: "Span status (OK / ERROR / UNSET)" },
  { name: "span.kind", description: "Span kind" },
  { name: "duration", description: "Duration in nanoseconds" },
  { name: "http.method", description: "HTTP method" },
  { name: "http.status_code", description: "HTTP response code" },
  { name: "http.route", description: "HTTP route" },
  { name: "db.system", description: "Database system" },
  { name: "db.name", description: "Database name" },
  { name: "db.operation", description: "Database operation" },
  { name: "rpc.system", description: "RPC system" },
  { name: "rpc.service", description: "RPC service" },
  { name: "rpc.method", description: "RPC method" },
  { name: "messaging.system", description: "Messaging system" },
  { name: "messaging.destination", description: "Messaging destination" },
  { name: "peer.service", description: "Peer service" },
  { name: "exception.type", description: "Exception type" },
  { name: "host.name", description: "Host name" },
  { name: "k8s.pod.name", description: "Kubernetes pod name" },
  { name: "trace_id", description: "Trace ID" },
] as const;

export interface QueryFieldOption {
  readonly name: string;
  readonly description: string;
}
