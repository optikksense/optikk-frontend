import type { TraceRecord } from "../types";

export interface TraceStats {
  totalSpans: number;
  duration: number;
  services: Set<string>;
  errors: number;
}

/**
 * Calculate summary statistics for a trace from its spans.
 */
export const calculateTraceStats = (spans: TraceRecord[]): TraceStats => {
  const stats: TraceStats = {
    totalSpans: spans.length,
    duration: 0,
    services: new Set<string>(),
    errors: 0,
  };

  if (spans.length === 0) return stats;

  let minStart = Number.POSITIVE_INFINITY;
  let maxEnd = Number.NEGATIVE_INFINITY;

  spans.forEach((span) => {
    if (span.service_name) stats.services.add(span.service_name);
    if (span.status === "ERROR") stats.errors++;

    const start = span.start_time ? new Date(span.start_time).getTime() : 0;
    const end = span.end_time ? new Date(span.end_time).getTime() : 0;

    if (start && start < minStart) minStart = start;
    if (end && end > maxEnd) maxEnd = end;
  });

  if (minStart !== Number.POSITIVE_INFINITY && maxEnd !== Number.NEGATIVE_INFINITY) {
    stats.duration = maxEnd - minStart;
  }

  return stats;
};

/**
 * Normalize span data from raw API response.
 *
 * Supports the compact `SpanListItem` from GET /traces/:id/spans (`start_ns`,
 * `kind`, `status_code`, `has_error`) and the legacy full span row shape.
 */
export function normalizeSpan(span: any): TraceRecord {
  const durationMs = Number(span.duration_ms ?? 0);
  const startNsRaw = span.start_ns;
  const startNs = typeof startNsRaw === "number" && Number.isFinite(startNsRaw) ? startNsRaw : null;

  let start_time = span.start_time ?? "";
  let end_time = span.end_time ?? "";
  if (startNs != null && startNs > 0) {
    const startMs = startNs / 1_000_000;
    const endMs = startMs + durationMs;
    start_time = new Date(startMs).toISOString();
    end_time = new Date(endMs).toISOString();
  }

  const span_kind = span.span_kind ?? span.kind ?? "";
  const statusFromWire =
    span.has_error === true
      ? "ERROR"
      : typeof span.status_code === "string" && span.status_code.toUpperCase().includes("ERROR")
        ? "ERROR"
        : span.status_code || span.status;

  return {
    ...span,
    span_id: span.span_id,
    trace_id: span.trace_id,
    service_name: span.service_name ?? "",
    operation_name: span.operation_name ?? "",
    parent_span_id: span.parent_span_id,
    span_kind,
    duration_ms: durationMs,
    start_time,
    end_time,
    status: statusFromWire || "OK",
    status_message: span.status_message,
    http_method: span.http_method,
    http_url: span.http_url,
    http_status_code: span.http_status_code,
  };
}

/**
 * Normalize log data from raw API response.
 */
export function normalizeTraceLog(log: any): any {
  return {
    ...log,
    timestamp: log.timestamp,
    service_name: log.service_name,
    trace_id: log.trace_id,
    span_id: log.span_id,
    level: log.level || log.severity_text || "INFO",
    message: log.message || log.body || "",
  };
}
