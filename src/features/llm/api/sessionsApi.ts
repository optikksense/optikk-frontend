import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

interface RangeParams {
  startTime: number;
  endTime: number;
}

const overviewSchema = z.object({
  sessions: z.number(),
  avgTurns: z.number(),
  avgDurationMs: z.number(),
  avgCost: z.number(),
});
export type LlmSessionsOverview = z.infer<typeof overviewSchema>;

const sessionSchema = z.object({
  sessionId: z.string(),
  service: z.string(),
  userId: z.string().nullish(),
  preview: z.string().nullish(),
  turns: z.number(),
  durationMs: z.number(),
  cost: z.number(),
  avgScore: z.number(),
  lastMs: z.number(),
});
export type LlmSession = z.infer<typeof sessionSchema>;
const sessionsResponseSchema = z.object({ sessions: z.array(sessionSchema).nullish() });

const turnSchema = z.object({
  traceId: z.string(),
  startMs: z.number(),
  durationMs: z.number(),
  model: z.string(),
  userText: z.string().nullish(),
  outputText: z.string().nullish(),
  cost: z.number(),
});

const sessionDetailSchema = z.object({
  sessionId: z.string(),
  service: z.string(),
  userId: z.string().nullish(),
  turns: z.array(turnSchema).nullish(),
});
export type LlmSessionDetail = z.infer<typeof sessionDetailSchema>;

export async function getSessionsOverview(range: RangeParams): Promise<LlmSessionsOverview> {
  const res = await api.get<unknown>(`${BASE}/llm/sessions/overview`, { params: range });
  return validateResponse(overviewSchema, res);
}

export async function querySessions(range: RangeParams, limit = 100): Promise<LlmSession[]> {
  const res = await api.post<unknown>(`${BASE}/llm/sessions/query`, { ...range, limit });
  const data = validateResponse(sessionsResponseSchema, res);
  return data.sessions ?? [];
}

export async function getSessionDetail(
  sessionId: string,
  range: RangeParams
): Promise<LlmSessionDetail> {
  const res = await api.get<unknown>(`${BASE}/llm/sessions/${encodeURIComponent(sessionId)}`, {
    params: range,
  });
  return validateResponse(sessionDetailSchema, res);
}
