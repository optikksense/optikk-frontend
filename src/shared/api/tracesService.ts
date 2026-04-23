/**
 * Traces Service — API calls for distributed tracing.
 */
import { API_CONFIG } from "@config/apiConfig";
import { z } from "zod";

import api from "./api";
import {
  criticalPathSpanSchema,
  errorPathSpanSchema,
  flamegraphFrameSchema,
  relatedTraceSchema,
  spanAttributesSchema,
  spanEventSchema,
  spanKindDurationSchema,
  spanRecordSchema,
  spanSelfTimeSchema,
  traceLogsResponseSchema,
  traceRecordSchema,
  tracesSummarySchema,
} from "./schemas/tracesSchemas";
import { validateResponse } from "./utils/validate";

import type {
  CriticalPathSpanRecord,
  ErrorPathSpanRecord,
  FlamegraphFrame,
  RelatedTraceRecord,
  SpanAttributesRecord,
  SpanEventRecord,
  SpanKindDurationRecord,
  SpanRecord,
  SpanSelfTimeRecord,
  TraceLogsResponse,
  TraceRecord,
  TracesSummary,
} from "./schemas/tracesSchemas";
import type { QueryParams, RequestTime } from "./service-types";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const tracesListSchema = z
  .object({
    traces: z.array(traceRecordSchema),
    total: z.number(),
    summary: tracesSummarySchema.optional(),
  })
  .strict();

const spanListSchema = z.array(spanRecordSchema);

/** Wire item for GET /traces/:traceId/spans (tracedetail SpanListItem). */
const traceSpanListItemSchema = z.object({
  span_id: z.string(),
  parent_span_id: z.string().optional(),
  trace_id: z.string(),
  service_name: z.string(),
  operation_name: z.string(),
  kind: z.string().optional().default(""),
  status_code: z.string().optional().default(""),
  has_error: z.boolean().optional().default(false),
  duration_ms: z.coerce.number(),
  start_ns: z.coerce.number(),
});

/** Backend sends `{ spans: [...] }`; some paths emit `null` or omit `spans` for empty results. */
const traceSpansEnvelopeSchema = z.object({
  spans: z
    .array(traceSpanListItemSchema)
    .nullish()
    .transform((v) => v ?? []),
});

/**
 * Service wrapper for distributed tracing endpoints.
 */
export const tracesService = {
  async getTraces(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {}
  ): Promise<{ traces: TraceRecord[]; total: number; summary?: TracesSummary }> {
    const data = await api.get(`${BASE}/traces`, { params: { startTime, endTime, ...params } });
    return validateResponse(tracesListSchema, data);
  },

  async getTraceSpans(_teamId: number | null, traceId: string): Promise<SpanRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/spans`);
    if (Array.isArray(data)) {
      return validateResponse(spanListSchema, data);
    }
    const { spans } = validateResponse(traceSpansEnvelopeSchema, data);
    return spans as unknown as SpanRecord[];
  },

  async getTraceLogs(_teamId: number | null, traceId: string): Promise<TraceLogsResponse> {
    const data = await api.get(`${BASE}/traces/${traceId}/logs`);
    return validateResponse(traceLogsResponseSchema, data);
  },

  async getSpanEvents(traceId: string): Promise<SpanEventRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/span-events`);
    return validateResponse(z.array(spanEventSchema), data);
  },

  async getSpanKindBreakdown(traceId: string): Promise<SpanKindDurationRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/span-kind-breakdown`);
    return validateResponse(z.array(spanKindDurationSchema), data);
  },

  async getCriticalPath(traceId: string): Promise<CriticalPathSpanRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/critical-path`);
    return validateResponse(z.array(criticalPathSpanSchema), data);
  },

  async getSpanSelfTimes(traceId: string): Promise<SpanSelfTimeRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/span-self-times`);
    return validateResponse(z.array(spanSelfTimeSchema), data);
  },

  async getErrorPath(traceId: string): Promise<ErrorPathSpanRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/error-path`);
    return validateResponse(z.array(errorPathSpanSchema), data);
  },

  async getSpanAttributes(traceId: string, spanId: string): Promise<SpanAttributesRecord> {
    const data = await api.get(`${BASE}/traces/${traceId}/spans/${spanId}/attributes`);
    return validateResponse(spanAttributesSchema, data);
  },

  async getRelatedTraces(
    traceId: string,
    serviceName?: string,
    operationName?: string,
    startMs?: number,
    endMs?: number
  ): Promise<RelatedTraceRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/related`, {
      params: {
        service: serviceName,
        operation: operationName,
        startTime: startMs,
        endTime: endMs,
      },
    });
    return validateResponse(z.array(relatedTraceSchema), data);
  },

  async getFlamegraphData(traceId: string): Promise<FlamegraphFrame[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/flamegraph`);
    return validateResponse(z.array(flamegraphFrameSchema), data);
  },


};
