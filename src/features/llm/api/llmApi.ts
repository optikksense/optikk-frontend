import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const llmAppSchema = z.object({
  service: z.string(),
  kind: z.string().nullish(),
  vendor: z.string(),
  primaryModel: z.string(),
  llmSpans: z.number(),
  toolSpans: z.number(),
  retrievalSpans: z.number(),
  embeddingSpans: z.number(),
  agentSpans: z.number(),
  totalSpans: z.number(),
  errorRate: z.number(),
  p50Ms: z.number(),
  p95Ms: z.number(),
  p99Ms: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cost: z.number(),
  trend: z.array(z.number()).nullish(),
});
export type LlmApp = z.infer<typeof llmAppSchema>;

const appsResponseSchema = z.object({ apps: z.array(llmAppSchema).nullish() });

const pointSchema = z.object({ t: z.number(), value: z.number() });
const seriesSchema = z.object({ key: z.string(), points: z.array(pointSchema).nullish() });
const timeseriesResponseSchema = z.object({ series: z.array(seriesSchema).nullish() });
export type LlmSeries = z.infer<typeof seriesSchema>;

const costRowSchema = z.object({
  key: z.string(),
  vendor: z.string().optional(),
  llmSpans: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cost: z.number(),
});
export type LlmCostRow = z.infer<typeof costRowSchema>;
const costResponseSchema = z.object({
  groupBy: z.string(),
  rows: z.array(costRowSchema).nullish(),
});

const llmTraceSchema = z.object({
  traceId: z.string(),
  startMs: z.number(),
  durationMs: z.number(),
  service: z.string(),
  operation: z.string(),
  status: z.string(),
  hasError: z.boolean(),
  vendor: z.string(),
  model: z.string(),
  llmCalls: z.number(),
  promptPreview: z.string().nullish(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cost: z.number(),
});
export type LlmTrace = z.infer<typeof llmTraceSchema>;

const pageInfoSchema = z.object({
  hasMore: z.boolean(),
  nextCursor: z.string().optional(),
  limit: z.number(),
});
const tracesResponseSchema = z.object({
  results: z.array(llmTraceSchema).nullish(),
  pageInfo: pageInfoSchema,
});
export type LlmTracesResponse = {
  results: LlmTrace[];
  pageInfo: z.infer<typeof pageInfoSchema>;
};

const llmSpanSchema = z.object({
  spanId: z.string(),
  parentSpanId: z.string(),
  name: z.string(),
  service: z.string(),
  operation: z.string(),
  vendor: z.string(),
  model: z.string(),
  startMs: z.number(),
  durationMs: z.number(),
  hasError: z.boolean(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cost: z.number(),
});
const traceDetailSchema = z.object({
  traceId: z.string(),
  service: z.string(),
  startMs: z.number(),
  durationMs: z.number(),
  hasError: z.boolean(),
  prompt: z.string(),
  output: z.string(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cost: z.number(),
  spans: z.array(llmSpanSchema),
});
export type LlmTraceDetail = z.infer<typeof traceDetailSchema>;

const overviewWindowSchema = z.object({
  llmSpans: z.number(),
  toolSpans: z.number(),
  totalSpans: z.number(),
  traces: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  errorRate: z.number(),
  p50Ms: z.number(),
  p95Ms: z.number(),
  p99Ms: z.number(),
  cost: z.number(),
});
export type LlmOverviewWindow = z.infer<typeof overviewWindowSchema>;

const overviewSeriesSchema = z.object({
  timestamps: z.array(z.number()).nullish(),
  llmSpans: z.array(z.number()).nullish(),
  toolSpans: z.array(z.number()).nullish(),
  errorRate: z.array(z.number()).nullish(),
  p95Ms: z.array(z.number()).nullish(),
  cost: z.array(z.number()).nullish(),
});
export type LlmOverviewSeries = z.infer<typeof overviewSeriesSchema>;

const overviewResponseSchema = z.object({
  current: overviewWindowSchema,
  previous: overviewWindowSchema,
  series: overviewSeriesSchema,
});
export type LlmOverview = z.infer<typeof overviewResponseSchema>;

interface RangeParams {
  startTime: number;
  endTime: number;
}

export async function getLlmOverview(range: RangeParams): Promise<LlmOverview> {
  const res = await api.get<unknown>(`${BASE}/llm/overview`, { params: range });
  return validateResponse(overviewResponseSchema, res);
}

export async function getLlmApps(range: RangeParams): Promise<LlmApp[]> {
  const res = await api.get<unknown>(`${BASE}/llm/apps`, { params: range });
  const data = validateResponse(appsResponseSchema, res);
  return data.apps ?? [];
}

export type LlmTimeseriesMetric = "tokens_by_vendor" | "latency" | "spend";

export async function getLlmTimeseries(
  metric: LlmTimeseriesMetric,
  range: RangeParams
): Promise<LlmSeries[]> {
  const res = await api.get<unknown>(`${BASE}/llm/timeseries`, {
    params: { metric, ...range },
  });
  const data = validateResponse(timeseriesResponseSchema, res);
  return data.series ?? [];
}

export type LlmCostGroupBy = "service" | "vendor" | "model";

export async function getLlmCostBreakdown(
  groupBy: LlmCostGroupBy,
  range: RangeParams
): Promise<LlmCostRow[]> {
  const res = await api.get<unknown>(`${BASE}/llm/cost/breakdown`, {
    params: { groupBy, ...range },
  });
  const data = validateResponse(costResponseSchema, res);
  return data.rows ?? [];
}

export interface LlmTracesRequest extends RangeParams {
  limit?: number;
  cursor?: string;
  services?: string[];
  status?: string;
  minDurationMs?: number;
}

export async function queryLlmTraces(req: LlmTracesRequest): Promise<LlmTracesResponse> {
  const res = await api.post<unknown>(`${BASE}/llm/traces/query`, req);
  const data = validateResponse(tracesResponseSchema, res);
  return { results: data.results ?? [], pageInfo: data.pageInfo };
}

export async function getLlmTraceDetail(traceId: string): Promise<LlmTraceDetail> {
  const res = await api.get<unknown>(`${BASE}/llm/traces/${encodeURIComponent(traceId)}`);
  return validateResponse(traceDetailSchema, res);
}
