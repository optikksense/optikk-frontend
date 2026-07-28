import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const traceScoreSchema = z.object({
  name: z.string(),
  dataType: z.string(),
  value: z.number(),
  stringValue: z.string().nullish(),
  source: z.string(),
  comment: z.string().nullish(),
});
export type LlmTraceScore = z.infer<typeof traceScoreSchema>;

const llmTraceSchema = z.object({
  traceId: z.string(),
  startMs: z.number(),
  durationMs: z.number(),
  service: z.string(),
  operation: z.string(),
  status: z.string(),
  hasError: z.boolean(),
  level: z.string().nullish(),
  vendor: z.string(),
  model: z.string(),
  userId: z.string().nullish(),
  sessionId: z.string().nullish(),
  tags: z.array(z.string()).nullish(),
  llmCalls: z.number(),
  promptPreview: z.string().nullish(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cost: z.number(),
  scores: z.array(traceScoreSchema).nullish(),
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
  kind: z.string().nullish(),
  vendor: z.string(),
  model: z.string(),
  responseModel: z.string().nullish(),
  startMs: z.number(),
  durationMs: z.number(),
  hasError: z.boolean(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cost: z.number(),
  prompt: z.string().nullish(),
  completion: z.string().nullish(),
  promptTruncated: z.boolean().nullish(),
  completionTruncated: z.boolean().nullish(),
});
export type LlmSpan = z.infer<typeof llmSpanSchema>;

const traceDetailSchema = z.object({
  traceId: z.string(),
  name: z.string().nullish(),
  service: z.string(),
  environment: z.string().nullish(),
  userId: z.string().nullish(),
  sessionId: z.string().nullish(),
  release: z.string().nullish(),
  startMs: z.number(),
  durationMs: z.number(),
  hasError: z.boolean(),
  prompt: z.string(),
  output: z.string(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  cost: z.number(),
  spans: z.array(llmSpanSchema),
  scores: z.array(traceScoreSchema).nullish(),
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

const overviewSeriesSchema = z.object({
  timestamps: z.array(z.number()).nullish(),
  llmSpans: z.array(z.number()).nullish(),
  toolSpans: z.array(z.number()).nullish(),
  errorRate: z.array(z.number()).nullish(),
  p95Ms: z.array(z.number()).nullish(),
  cost: z.array(z.number()).nullish(),
});

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

export interface LlmTracesRequest extends RangeParams {
  limit?: number;
  cursor?: string;
  services?: string[];
  vendors?: string[];
  models?: string[];
  status?: string;
  minDurationMs?: number;
}

export async function queryLlmTraces(req: LlmTracesRequest): Promise<LlmTracesResponse> {
  const res = await api.post<unknown>(`${BASE}/llm/traces/query`, req);
  const data = validateResponse(tracesResponseSchema, res);
  return { results: data.results ?? [], pageInfo: data.pageInfo };
}

export async function getLlmTraceDetail(
  traceId: string,
  startTime: number,
  endTime: number
): Promise<LlmTraceDetail> {
  const res = await api.get<unknown>(`${BASE}/llm/traces/${encodeURIComponent(traceId)}`, {
    params: { startTime, endTime },
  });
  return validateResponse(traceDetailSchema, res);
}

const spanIOSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  prompt: z.string(),
  completion: z.string(),
});
export type LlmSpanIO = z.infer<typeof spanIOSchema>;

export async function getLlmSpanIO(
  traceId: string,
  spanId: string,
  startTime: number,
  endTime: number
): Promise<LlmSpanIO> {
  const res = await api.get<unknown>(
    `${BASE}/llm/traces/${encodeURIComponent(traceId)}/spans/${encodeURIComponent(spanId)}/io`,
    { params: { startTime, endTime } }
  );
  return validateResponse(spanIOSchema, res);
}

const modelUsageSchema = z.object({
  model: z.string(),
  vendor: z.string(),
  traces: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  p50Ms: z.number(),
  p95Ms: z.number(),
  cost: z.number(),
});
export type LlmModelUsage = z.infer<typeof modelUsageSchema>;
const modelsResponseSchema = z.object({ models: z.array(modelUsageSchema).nullish() });

export async function getLlmModels(range: RangeParams): Promise<LlmModelUsage[]> {
  const res = await api.get<unknown>(`${BASE}/llm/models`, { params: range });
  const data = validateResponse(modelsResponseSchema, res);
  return data.models ?? [];
}
