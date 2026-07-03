import { z } from "zod";

const traceRecordSchema = z
  .object({
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
  })
  .strict();

export const spanRecordSchema = z
  .object({
    span_id: z.string(),
    trace_id: z.string().default(""),
    parent_span_id: z.string().optional(),
    service_name: z.string().default(""),
    operation_name: z.string().default(""),
    start_time: z.string().default(""),
    end_time: z.string().default(""),
    duration_ms: z.number().default(0),
    status: z.string().default("UNSET"),
    span_kind: z.string().default(""),
    status_message: z.string().default(""),
    http_method: z.string().default(""),
    http_url: z.string().default(""),
    http_status_code: z.number().default(0),
    host: z.string().default(""),
    pod: z.string().default(""),
    attributes: z.string().default(""),
  })
  .strict();
export const traceLogSchema = z
  .object({
    id: z.string().default(""),
    timestamp: z.union([z.string(), z.number()]),
    observed_timestamp: z.union([z.string(), z.number()]).optional(),
    severity_text: z.string().default("INFO"),
    severity_number: z.number().optional(),
    severity_bucket: z.coerce.number().optional(),
    body: z.string().default(""),
    trace_id: z.string().default(""),
    span_id: z.string().default(""),
    trace_flags: z.number().optional(),
    service_name: z.string().default(""),
    host: z.string().default(""),
    pod: z.string().default(""),
    container: z.string().default(""),
    environment: z.string().default(""),
    attributes_string: z.record(z.string(), z.string()).optional(),
    attributes_number: z.record(z.string(), z.number()).optional(),
    attributes_bool: z.record(z.string(), z.boolean()).optional(),
    scope_name: z.string().optional(),
    scope_version: z.string().optional(),
  })
  .strict();

const traceLogsResponseSchema = z
  .object({
    logs: z.array(traceLogSchema).default([]),
    is_speculative: z.boolean().default(false),
  })
  .strict();

export const spanEventSchema = z
  .object({
    span_id: z.string(),
    trace_id: z.string(),
    event_name: z.string(),
    timestamp: z.string(),
    attributes: z.string().default(""),
  })
  .strict();

export const criticalPathSpanSchema = z
  .object({
    span_id: z.string(),
    operation_name: z.string(),
    service_name: z.string(),
    duration_ms: z.number(),
  })
  .strict();

export const errorPathSpanSchema = z
  .object({
    span_id: z.string(),
    parent_span_id: z.string().default(""),
    operation_name: z.string(),
    service_name: z.string(),
    status: z.string(),
    status_message: z.string().default(""),
    start_time: z.string(),
    duration_ms: z.number(),
  })
  .strict();

const spanLinkSchema = z
  .object({
    trace_id: z.string(),
    span_id: z.string(),
    trace_state: z.string().optional(),
    attributes: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const spanAttributesSchema = z
  .object({
    span_id: z.string(),
    trace_id: z.string(),
    operation_name: z.string(),
    service_name: z.string(),
    attributes_string: z.record(z.string(), z.string()).default({}),
    resource_attributes: z.record(z.string(), z.string()).default({}),
    links: z.array(spanLinkSchema).optional(),
    exception_type: z.string().optional(),
    exception_message: z.string().optional(),
    exception_stacktrace: z.string().optional(),
    db_system: z.string().optional(),
    db_name: z.string().optional(),
    db_statement: z.string().optional(),
    db_statement_normalized: z.string().optional(),
    attributes: z.record(z.string(), z.string()).default({}),
  })
  .strict();

export const relatedTraceSchema = z
  .object({
    trace_id: z.string(),
    span_id: z.string(),
    operation_name: z.string(),
    service_name: z.string(),
    duration_ms: z.number(),
    status: z.string(),
    start_time: z.string(),
  })
  .strict();

export type TraceRecord = z.infer<typeof traceRecordSchema>;
export type SpanRecord = z.infer<typeof spanRecordSchema>;
export type TraceLog = z.infer<typeof traceLogSchema>;
export type TraceLogsResponse = z.infer<typeof traceLogsResponseSchema>;
export type SpanEventRecord = z.infer<typeof spanEventSchema>;
export type CriticalPathSpanRecord = z.infer<typeof criticalPathSpanSchema>;
export type ErrorPathSpanRecord = z.infer<typeof errorPathSpanSchema>;
export type SpanAttributesRecord = z.infer<typeof spanAttributesSchema>;
export type RelatedTraceRecord = z.infer<typeof relatedTraceSchema>;

const traceErrorSpanSchema = z
  .object({
    span_id: z.string(),
    service_name: z.string(),
    operation_name: z.string(),
    exception_message: z.string().optional(),
    status_message: z.string().optional(),
    start_time: z.string(),
    duration_ms: z.coerce.number(),
  })
  .strict();

export const traceErrorGroupSchema = z
  .object({
    exception_type: z.string(),
    count: z.coerce.number(),
    spans: z.array(traceErrorSpanSchema),
  })
  .strict();

export type TraceErrorGroup = z.infer<typeof traceErrorGroupSchema>;
