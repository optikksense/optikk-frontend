import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";
import api from "@/shared/api/api/client";

import type { AiEvalRun, AiEvalScore, AiEvalSuite } from "../types";

const BASE = `${API_CONFIG.ENDPOINTS.V1_BASE}/ai/evals`;
const jsonRecordSchema = z.record(z.string(), z.unknown()).default({});

const evalSuiteSchema = z.object({
  id: z.string(),
  teamId: z.number(),
  name: z.string(),
  description: z.string().default(""),
  promptId: z.string(),
  datasetId: z.string(),
  judgeModel: z.string(),
  status: z.enum(["draft", "active", "paused"]),
  updatedAt: z.string(),
  createdAt: z.string(),
});

const evalRunSchema = z.object({
  id: z.string(),
  evalId: z.string(),
  promptVersionId: z.string(),
  datasetId: z.string(),
  status: z.enum(["queued", "running", "completed", "failed"]),
  averageScore: z.number(),
  passRate: z.number(),
  totalCases: z.number(),
  completedCases: z.number(),
  summary: jsonRecordSchema,
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  createdAt: z.string(),
});

const evalScoreSchema = z.object({
  id: z.string(),
  evalRunId: z.string(),
  datasetItemId: z.string(),
  score: z.number(),
  resultLabel: z.string(),
  reason: z.string().default(""),
  outputText: z.string().default(""),
  createdAt: z.string(),
});

const createEvalSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  promptId: z.string().min(1),
  datasetId: z.string().min(1),
  judgeModel: z.string().min(1),
  status: z.enum(["draft", "active", "paused"]).default("draft"),
});

const launchEvalSchema = z.object({
  promptVersionId: z.string().min(1),
});

export type CreateAiEvalInput = z.infer<typeof createEvalSchema>;
export type LaunchAiEvalInput = z.infer<typeof launchEvalSchema>;

export const aiEvalsApi = {
  async list(): Promise<AiEvalSuite[]> {
    const response = await api.get<unknown>(BASE);
    return z.array(evalSuiteSchema).parse(response) as AiEvalSuite[];
  },

  async get(evalId: string): Promise<AiEvalSuite> {
    const response = await api.get<unknown>(`${BASE}/${evalId}`);
    return evalSuiteSchema.parse(response) as AiEvalSuite;
  },

  async create(input: CreateAiEvalInput): Promise<AiEvalSuite> {
    const payload = createEvalSchema.parse(input);
    const response = await api.post<unknown>(BASE, payload);
    return evalSuiteSchema.parse(response) as AiEvalSuite;
  },

  async listRuns(evalId: string): Promise<AiEvalRun[]> {
    const response = await api.get<unknown>(`${BASE}/${evalId}/runs`);
    return z.array(evalRunSchema).parse(response) as AiEvalRun[];
  },

  async launch(evalId: string, input: LaunchAiEvalInput): Promise<AiEvalRun> {
    const payload = launchEvalSchema.parse(input);
    const response = await api.post<unknown>(`${BASE}/${evalId}/runs`, payload);
    return evalRunSchema.parse(response) as AiEvalRun;
  },

  async listScores(evalId: string, evalRunId: string): Promise<AiEvalScore[]> {
    const response = await api.get<unknown>(`${BASE}/${evalId}/runs/${evalRunId}/scores`);
    return z.array(evalScoreSchema).parse(response) as AiEvalScore[];
  },
};
