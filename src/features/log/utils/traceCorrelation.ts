import type { LogRecord } from "../types/log";

/**
 * Pulls a trace id off the LogRecord. The first-class `trace_id` field wins;
 * we fall back to common OTel attribute keys because not every ingest path
 * promotes them to the top-level column.
 */
export function getTraceId(log: LogRecord): string | null {
  if (log.trace_id) return log.trace_id;
  const attrs = log.attributes_string;
  if (!attrs) return null;
  const v =
    attrs["trace_id"] ?? attrs["trace.id"] ?? attrs["traceId"] ?? attrs["TraceId"];
  return v && v.length > 0 ? v : null;
}

export function getSpanId(log: LogRecord): string | null {
  if (log.span_id) return log.span_id;
  const attrs = log.attributes_string;
  if (!attrs) return null;
  const v =
    attrs["span_id"] ?? attrs["span.id"] ?? attrs["spanId"] ?? attrs["SpanId"];
  return v && v.length > 0 ? v : null;
}
