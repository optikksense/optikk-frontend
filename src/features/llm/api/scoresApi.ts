import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

interface RangeParams {
  startTime: number;
  endTime: number;
}

const scoreNameSchema = z.object({ name: z.string(), dataType: z.string() });
export type LlmScoreName = z.infer<typeof scoreNameSchema>;
const namesResponseSchema = z.object({ names: z.array(scoreNameSchema).nullish() });

const summarySchema = z.object({
  name: z.string(),
  dataType: z.string(),
  count: z.number(),
  mean: z.number(),
});
export type LlmScoreSummary = z.infer<typeof summarySchema>;
const summaryResponseSchema = z.object({ summaries: z.array(summarySchema).nullish() });

const pointSchema = z.object({ t: z.number(), value: z.number() });
const timeseriesResponseSchema = z.object({
  name: z.string(),
  points: z.array(pointSchema).nullish(),
});
export type LlmScoreTimeseries = z.infer<typeof timeseriesResponseSchema>;

const bucketSchema = z.object({ label: z.string(), count: z.number() });
export type LlmScoreBucket = z.infer<typeof bucketSchema>;
const distributionResponseSchema = z.object({
  name: z.string(),
  buckets: z.array(bucketSchema).nullish(),
});

export interface CreateScoreRequest {
  traceId: string;
  spanId?: string;
  name: string;
  dataType: "numeric" | "boolean" | "categorical";
  value?: number;
  stringValue?: string;
  comment?: string;
}

export async function getScoreNames(range: RangeParams): Promise<LlmScoreName[]> {
  const res = await api.get<unknown>(`${BASE}/llm/scores/names`, { params: range });
  const data = validateResponse(namesResponseSchema, res);
  return data.names ?? [];
}

export async function getScoreSummary(range: RangeParams): Promise<LlmScoreSummary[]> {
  const res = await api.get<unknown>(`${BASE}/llm/scores/summary`, { params: range });
  const data = validateResponse(summaryResponseSchema, res);
  return data.summaries ?? [];
}

export async function getScoreTimeseries(
  name: string,
  range: RangeParams
): Promise<LlmScoreTimeseries> {
  const res = await api.get<unknown>(`${BASE}/llm/scores/timeseries`, {
    params: { name, ...range },
  });
  return validateResponse(timeseriesResponseSchema, res);
}

export async function getScoreDistribution(name: string, range: RangeParams) {
  const res = await api.get<unknown>(`${BASE}/llm/scores/distribution`, {
    params: { name, ...range },
  });
  const data = validateResponse(distributionResponseSchema, res);
  return { name: data.name, buckets: data.buckets ?? [] };
}

export async function createScore(req: CreateScoreRequest): Promise<void> {
  await api.post<unknown>(`${BASE}/llm/scores`, req);
}
