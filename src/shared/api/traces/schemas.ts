import { z } from "zod";

/**
 * Wire schemas for the traces API.
 *
 * Required vs optional mirrors the Go json tags in `query`: a field tagged
 * `omitempty` is `.optional()` here, everything else is required. Response
 * schemas do not use `.strict()` — unknown keys are stripped so an additive
 * backend change stays non-breaking (see `validateResponse`).
 */

/**
 * Domain model for a span as rendered by the trace detail UI. This is *not* a
 * wire shape: `normalizeSpan` builds it from `SpanRecord`, deriving
 * start/end times from `start_ns`. Never parsed against a response.
 */
const traceRecordSchema = z.object({
  span_id: z.string(),
  trace_id: z.string(),
  service_name: z.string().default(""),
  operation_name: z.string().default(""),
  start_time: z.string().default(""),
  end_time: z.string().default(""),
  duration_ms: z.number().default(0),
  status: z.string().default("UNSET"),
  span_kind: z.string().default(""),
  status_message: z.string().optional(),
  http_method: z.string().optional(),
  http_url: z.string().optional(),
  http_status_code: z.number().optional(),
  service_name_original: z.string().optional(),
  parent_span_id: z.string().optional(),
  has_error: z.boolean().default(false),
  start_ns: z.number().default(0),
});

/** Mirrors detail.SpanListItem — GET /traces/{traceId}/spans. */
export const spanRecordSchema = z.object({
  span_id: z.string(),
  parent_span_id: z.string(),
  trace_id: z.string(),
  service_name: z.string(),
  operation_name: z.string(),
  span_kind: z.string(),
  status: z.string(),
  has_error: z.boolean(),
  duration_ms: z.number(),
  start_ns: z.number(),
});

/** Mirrors logs models.Log — GET /logs/trace/{traceID}. */
export const traceLogSchema = z.object({
  id: z.string(),
  // uint64 `json:",string"` on the Go side — always a JSON string.
  timestamp: z.string(),
  observed_timestamp: z.string(),
  severity_text: z.string(),
  severity_number: z.number(),
  severity_bucket: z.number(),
  body: z.string(),
  trace_id: z.string(),
  span_id: z.string(),
  trace_flags: z.number(),
  service_name: z.string(),
  host: z.string(),
  pod: z.string(),
  container: z.string(),
  environment: z.string(),
  attributes_string: z.record(z.string(), z.string()).optional(),
  attributes_number: z.record(z.string(), z.number()).optional(),
  attributes_bool: z.record(z.string(), z.boolean()).optional(),
  scope_name: z.string(),
  scope_version: z.string(),
});

/** Client-side envelope built by `getTraceLogs`; the wire is a bare array. */
const traceLogsResponseSchema = z.object({
  logs: z.array(traceLogSchema).default([]),
  is_speculative: z.boolean().default(false),
});

/** Mirrors detail.SpanEvent — GET /traces/{traceId}/span-events. */
export const spanEventSchema = z.object({
  span_id: z.string(),
  trace_id: z.string(),
  event_name: z.string(),
  timestamp: z.string(),
  attributes: z.string(),
});

/** Mirrors paths.CriticalPathSpan — GET /traces/{traceId}/critical-path. */
export const criticalPathSpanSchema = z.object({
  span_id: z.string(),
  operation_name: z.string(),
  service_name: z.string(),
  duration_ms: z.number(),
});

/** Mirrors paths.ErrorPathSpan — GET /traces/{traceId}/error-path. */
export const errorPathSpanSchema = z.object({
  span_id: z.string(),
  parent_span_id: z.string(),
  operation_name: z.string(),
  service_name: z.string(),
  status: z.string(),
  status_message: z.string(),
  start_time: z.string(),
  duration_ms: z.number(),
});

/** Mirrors detail.SpanLink. */
const spanLinkSchema = z.object({
  trace_id: z.string(),
  span_id: z.string(),
  trace_state: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
});

/** Mirrors detail.SpanAttributes — GET /traces/{traceId}/spans/{spanId}/attributes. */
export const spanAttributesSchema = z.object({
  span_id: z.string(),
  trace_id: z.string(),
  operation_name: z.string(),
  service_name: z.string(),
  attributes_string: z.record(z.string(), z.string()),
  resource_attributes: z.record(z.string(), z.string()),
  links: z.array(spanLinkSchema).optional(),
  exception_type: z.string().optional(),
  exception_message: z.string().optional(),
  exception_stacktrace: z.string().optional(),
  db_system: z.string().optional(),
  db_name: z.string().optional(),
  db_statement: z.string().optional(),
  db_statement_normalized: z.string().optional(),
  attributes: z.record(z.string(), z.string()).optional(),
});

/** Mirrors detail.RelatedTrace — GET /traces/{traceId}/related. */
export const relatedTraceSchema = z.object({
  trace_id: z.string(),
  span_id: z.string(),
  operation_name: z.string(),
  service_name: z.string(),
  duration_ms: z.number(),
  status: z.string(),
  start_time: z.string(),
});

export type TraceRecord = z.infer<typeof traceRecordSchema>;
export type SpanRecord = z.infer<typeof spanRecordSchema>;
export type TraceLog = z.infer<typeof traceLogSchema>;
export type TraceLogsResponse = z.infer<typeof traceLogsResponseSchema>;
export type SpanEventRecord = z.infer<typeof spanEventSchema>;
export type CriticalPathSpanRecord = z.infer<typeof criticalPathSpanSchema>;
export type ErrorPathSpanRecord = z.infer<typeof errorPathSpanSchema>;
export type SpanAttributesRecord = z.infer<typeof spanAttributesSchema>;
export type RelatedTraceRecord = z.infer<typeof relatedTraceSchema>;

/** Mirrors servicemap.TraceErrorSpan. */
const traceErrorSpanSchema = z.object({
  span_id: z.string(),
  service_name: z.string(),
  operation_name: z.string(),
  exception_message: z.string().optional(),
  status_message: z.string().optional(),
  start_time: z.string(),
  duration_ms: z.number(),
});

/** Mirrors servicemap.TraceErrorGroup. */
export const traceErrorGroupSchema = z.object({
  exception_type: z.string(),
  count: z.number(),
  spans: z.array(traceErrorSpanSchema),
});

export type TraceErrorGroup = z.infer<typeof traceErrorGroupSchema>;

/** Domain models for the service-detail recent-traces list, built client-side. */
const traceSummarySchema = z.object({
  total_traces: z.number().default(0),
  error_traces: z.number().default(0),
  avg_duration: z.number().default(0),
  p50_duration: z.number().default(0),
  p95_duration: z.number().default(0),
  p99_duration: z.number().default(0),
});

const tracesResponseSchema = z.object({
  traces: z.array(traceRecordSchema),
  has_more: z.boolean().optional(),
  next_cursor: z.string().optional(),
  limit: z.number().optional(),
  summary: traceSummarySchema.optional(),
});

export type TracesResponse = z.infer<typeof tracesResponseSchema>;
