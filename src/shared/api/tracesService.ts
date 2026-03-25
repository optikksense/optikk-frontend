/**
 * Traces Service — API calls for distributed tracing.
 */
import { API_CONFIG } from '@config/apiConfig';
import { z } from 'zod';

import api from './api';
import { validateResponse } from './utils/validate';
import { traceRecordSchema, spanRecordSchema, tracesSummarySchema } from './schemas/tracesSchemas';

import type { TraceRecord, SpanRecord, TracesSummary } from './schemas/tracesSchemas';
import type { QueryParams, RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const tracesListSchema = z.object({
  traces: z.array(traceRecordSchema),
  total: z.number(),
  summary: tracesSummarySchema.optional(),
}).strict();

const spanListSchema = z.array(spanRecordSchema);
const analyticsCellSchema = z.object({
  key: z.string(),
  type: z.enum(['string', 'integer', 'number', 'boolean']),
  stringValue: z.string().optional(),
  integerValue: z.number().int().optional(),
  numberValue: z.number().optional(),
  booleanValue: z.boolean().optional(),
}).strict();

const analyticsRowSchema = z.object({
  cells: z.array(analyticsCellSchema),
}).strict();

const analyticsResultSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(analyticsRowSchema),
}).strict();

const analyticsDimensionSchema = z.object({
  name: z.string(),
  column: z.string(),
  description: z.string(),
}).strict();

/**
 * Service wrapper for distributed tracing endpoints.
 */
export const tracesService = {
  async getTraces(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<{ traces: TraceRecord[]; total: number; summary?: TracesSummary }> {
    const data = await api.get(`${BASE}/traces`, { params: { startTime, endTime, ...params } });
    return validateResponse(tracesListSchema, data);
  },

  async getTraceSpans(_teamId: number | null, traceId: string): Promise<SpanRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/spans`);
    return validateResponse(spanListSchema, data);
  },

  async getSpanTree(_teamId: number | null, spanId: string): Promise<unknown> {
    return api.get(`${BASE}/spans/${spanId}/tree`);
  },

  async getTraceLogs(_teamId: number | null, traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/logs`);
  },

  async getSpanEvents(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/span-events`);
  },

  async getSpanKindBreakdown(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/span-kind-breakdown`);
  },

  async getCriticalPath(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/critical-path`);
  },

  async getSpanSelfTimes(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/span-self-times`);
  },

  async getErrorPath(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/error-path`);
  },

  async getSpanAttributes(traceId: string, spanId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/spans/${spanId}/attributes`);
  },

  async getRelatedTraces(
    traceId: string,
    serviceName?: string,
    operationName?: string,
    startMs?: number,
    endMs?: number,
  ): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/related`, {
      params: { service: serviceName, operation: operationName, startTime: startMs, endTime: endMs },
    });
  },

  async postAnalytics(query: unknown): Promise<z.infer<typeof analyticsResultSchema>> {
    const data = await api.post(`${BASE}/spans/analytics`, query);
    return validateResponse(analyticsResultSchema, data);
  },

  async getDimensions(): Promise<Array<z.infer<typeof analyticsDimensionSchema>>> {
    const data = await api.get(`${BASE}/spans/analytics/dimensions`);
    return validateResponse(z.array(analyticsDimensionSchema), data);
  },

  async getSpanSearch(startTime: RequestTime, endTime: RequestTime, params: QueryParams = {}): Promise<unknown> {
    return api.get(`${BASE}/spans/search`, { params: { startTime, endTime, ...params } });
  },

  async getFlamegraphData(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/flamegraph`);
  },

  async getTraceComparison(traceA: string, traceB: string): Promise<unknown> {
    return api.get(`${BASE}/traces/compare`, { params: { traceA, traceB } });
  },

  async getLatencyHeatmap(startTime: RequestTime, endTime: RequestTime, service: string): Promise<unknown> {
    return api.get(`${BASE}/latency/heatmap`, { params: { startTime, endTime, service } });
  },

  async getREDSummary(startTime: RequestTime, endTime: RequestTime): Promise<unknown> {
    return api.get(`${BASE}/metrics/red/summary`, { params: { startTime, endTime } });
  },

  async getApdex(startTime: RequestTime, endTime: RequestTime, service: string): Promise<unknown> {
    return api.get(`${BASE}/metrics/red/apdex`, { params: { startTime, endTime, service } });
  },

  getLiveTailUrl(filters: QueryParams = {}): string {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    return `${BASE}/spans/live-tail${query ? '?' + query : ''}`;
  },

  getExplorerStreamUrl(filters: QueryParams = {}): string {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    return `${BASE}/traces/explorer/stream${query ? '?' + query : ''}`;
  },
};
