import { z } from "zod";

import { api } from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import type {
  LogRecord,
  LogsAnalyticsRequest,
  LogsAnalyticsResponse,
  LogsGetByIdResponse,
  LogsQueryRequest,
  LogsQueryResponse,
} from "../types/log";

/**
 * Thin client for the logs explorer endpoints. All responses are Zod-validated
 * so contract drift surfaces as a console warning (see `validateResponse`),
 * and the UI never silently renders a stale shape.
 *
 * Endpoints (backend: `internal/modules/logs/explorer/handler.go`):
 *   POST /api/v1/logs/query
 *   POST /api/v1/logs/analytics
 *   GET  /api/v1/logs/:id
 */

const warningSchema = z.object({ code: z.string(), message: z.string() });

const facetBucketSchema = z.object({ value: z.string(), count: z.number() });

const trendBucketSchema = z.object({
  time_bucket: z.string(),
  total: z.number(),
  errors: z.number(),
  warnings: z.number(),
});

const summarySchema = z.object({ total: z.number(), errors: z.number() });

const logRecordSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  observed_timestamp: z.string().optional(),
  service_name: z.string(),
  severity_text: z.string().optional(),
  severity_bucket: z.number(),
  body: z.string(),
  host: z.string().optional(),
  pod: z.string().optional(),
  container: z.string().optional(),
  environment: z.string().optional(),
  scope_name: z.string().optional(),
  scope_version: z.string().optional(),
  trace_id: z.string().optional(),
  span_id: z.string().optional(),
  attributes_string: z.record(z.string(), z.string()).optional(),
  attributes_number: z.record(z.string(), z.number()).optional(),
  attributes_bool: z.record(z.string(), z.boolean()).optional(),
  resource: z.record(z.string(), z.unknown()).optional(),
});

const queryResponseSchema = z.object({
  results: z.array(logRecordSchema),
  cursor: z.string().optional(),
  facets: z.record(z.string(), z.array(facetBucketSchema)).optional(),
  trend: z.array(trendBucketSchema).optional(),
  summary: summarySchema.optional(),
  warnings: z.array(warningSchema).optional(),
});

const analyticsResponseSchema = z.object({
  columns: z.array(z.object({ name: z.string(), type: z.enum(["string", "number", "time"]) })),
  rows: z.array(z.array(z.union([z.string(), z.number()]))),
  warnings: z.array(warningSchema).optional(),
});

const getByIdSchema = z.object({ log: logRecordSchema });

export async function queryLogs(body: LogsQueryRequest): Promise<LogsQueryResponse> {
  const raw = await api.post<unknown>("/v1/logs/query", body);
  return validateResponse(queryResponseSchema, raw) as LogsQueryResponse;
}

export async function analyticsLogs(body: LogsAnalyticsRequest): Promise<LogsAnalyticsResponse> {
  const raw = await api.post<unknown>("/v1/logs/analytics", body);
  return validateResponse(analyticsResponseSchema, raw) as LogsAnalyticsResponse;
}

export async function getLogById(id: string): Promise<LogsGetByIdResponse> {
  const raw = await api.get<unknown>(`/v1/logs/${encodeURIComponent(id)}`);
  return validateResponse(getByIdSchema, raw) as LogsGetByIdResponse;
}

export type { LogRecord };
