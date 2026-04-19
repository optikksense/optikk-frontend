import { z } from "zod";

export const traceSpanSchema = z
  .object({
    traceId: z.string(),
    spanId: z.string(),
    parentSpanId: z.string().optional(),
    name: z.string(),
    serviceName: z.string(),
    timestamp: z.number(),
    duration: z.number(),
    status: z.string(),
  })
  .strict();

export const traceRecordSchema = z
  .object({
    span_id: z.string(),
    trace_id: z.string(),
    service_name: z.string(),
    operation_name: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    duration_ms: z.number(),
    status: z.string(),
    span_kind: z.string(),
    status_message: z.string().optional(),
    http_method: z.string().optional(),
    http_url: z.string().optional(),
    http_status_code: z.number().optional(),
    service_name_original: z.string().optional(),
    parent_span_id: z.string().optional(),
  })
  .strict();

export type TraceRecord = z.infer<typeof traceRecordSchema>;

export const traceSummarySchema = z
  .object({
    total_traces: z.number().default(0),
    error_traces: z.number().default(0),
    avg_duration: z.number().default(0),
    p50_duration: z.number().default(0),
    p95_duration: z.number().default(0),
    p99_duration: z.number().default(0),
  })
  .strict();

export type TraceSummary = z.infer<typeof traceSummarySchema>;

export const tracesResponseSchema = z
  .object({
    traces: z.array(traceRecordSchema),
    has_more: z.boolean().optional(),
    next_cursor: z.string().optional(),
    limit: z.number().optional(),
    summary: traceSummarySchema.optional(),
  })
  .strict();

export type TracesResponse = z.infer<typeof tracesResponseSchema>;
