import { API_CONFIG } from "@config/apiConfig";
import { z } from "zod";

import api from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import type { AnalyticsRequest, AnalyticsResponse } from "@/features/explorer/types";

import type {
  TraceSummary,
  TracesQueryRequest,
  TracesQueryResponse,
} from "../types/trace";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const facetBucketSchema = z.object({ value: z.string(), count: z.number() }).strict();

const warningSchema = z.object({ code: z.string(), message: z.string() }).strict();

const trendBucketSchema = z
  .object({
    time_bucket: z.string(),
    total: z.number(),
    errors: z.number(),
    warnings: z.number(),
  })
  .strict();

const traceSummarySchema = z
  .object({
    trace_id: z.string(),
    team_id: z.number(),
    start_ms: z.number(),
    end_ms: z.number(),
    duration_ns: z.number(),
    root_service: z.string(),
    root_operation: z.string(),
    root_status: z.string(),
    root_http_method: z.string().optional(),
    root_http_status: z.number().optional(),
    root_endpoint: z.string().optional(),
    span_count: z.number(),
    has_error: z.boolean(),
    error_count: z.number(),
    environment: z.string().optional(),
    service_set: z.array(z.string()).optional(),
    truncated: z.boolean().optional(),
  })
  .strict();

const tracesQueryResponseSchema = z
  .object({
    traces: z.array(traceSummarySchema),
    nextCursor: z.string().optional(),
    summary: z
      .object({ total: z.number(), errors: z.number() })
      .strict()
      .optional(),
    facets: z.record(z.string(), z.array(facetBucketSchema)).optional(),
    trend: z.array(trendBucketSchema).optional(),
    warnings: z.array(warningSchema).optional(),
  })
  .strict();

const analyticsResponseSchema = z
  .object({
    columns: z.array(
      z.object({ name: z.string(), type: z.enum(["string", "number", "time"]) }).strict()
    ),
    rows: z.array(z.array(z.union([z.string(), z.number()]))),
    warnings: z.array(warningSchema).optional(),
  })
  .strict();

async function query(body: TracesQueryRequest): Promise<TracesQueryResponse> {
  const raw = await api.post(`${BASE}/traces/query`, body);
  return validateResponse(tracesQueryResponseSchema, raw) as TracesQueryResponse;
}

async function analytics(body: AnalyticsRequest): Promise<AnalyticsResponse> {
  const raw = await api.post(`${BASE}/traces/analytics`, body);
  return validateResponse(analyticsResponseSchema, raw) as AnalyticsResponse;
}

async function getById(traceId: string): Promise<TraceSummary> {
  const raw = await api.get(`${BASE}/traces/${encodeURIComponent(traceId)}`);
  return validateResponse(traceSummarySchema, raw) as TraceSummary;
}

export const tracesExplorerApi = { query, analytics, getById };
export type { TracesQueryResponse } from "../types/trace";
