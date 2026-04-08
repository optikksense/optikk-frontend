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
 */
export function normalizeSpan(span: any): TraceRecord {
  return {
    ...span,
    span_id: span.span_id,
    trace_id: span.trace_id,
    service_name: span.service_name,
    operation_name: span.operation_name,
    parent_span_id: span.parent_span_id,
    span_kind: span.span_kind,
    duration_ms: Number(span.duration_ms || 0),
    start_time: span.start_time,
    end_time: span.end_time,
    status: span.status || (span.error ? "ERROR" : "OK"),
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
