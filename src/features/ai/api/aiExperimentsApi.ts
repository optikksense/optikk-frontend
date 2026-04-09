import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";
import api from "@/shared/api/api/client";

import type { AiExperiment, AiExperimentRun, AiExperimentVariant } from "../types";

const BASE = `${API_CONFIG.ENDPOINTS.V1_BASE}/ai/experiments`;
const jsonRecordSchema = z.record(z.string(), z.unknown()).default({});

const experimentSchema = z.object({
  id: z.string(),
  teamId: z.number(),
  name: z.string(),
  description: z.string().default(""),
  datasetId: z.string(),
  status: z.enum(["draft", "running", "paused", "completed"]),
  updatedAt: z.string(),
  createdAt: z.string(),
});

const variantSchema = z.object({
  id: z.string(),
  experimentId: z.string(),
  promptVersionId: z.string(),
  label: z.string(),
  weight: z.number(),
  createdAt: z.string(),
});

const experimentRunSchema = z.object({
  id: z.string(),
  experimentId: z.string(),
  status: z.enum(["queued", "running", "completed", "failed"]),
  winnerVariantId: z.string().optional(),
  summary: jsonRecordSchema,
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  createdAt: z.string(),
});

const createExperimentSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  datasetId: z.string().min(1),
  variants: z
    .array(
      z.object({
        promptVersionId: z.string().min(1),
        label: z.string().min(1),
        weight: z.number().min(0).default(1),
      })
    )
    .min(1),
});

export type CreateAiExperimentInput = z.infer<typeof createExperimentSchema>;

export const aiExperimentsApi = {
  async list(): Promise<AiExperiment[]> {
    const response = await api.get<unknown>(BASE);
    return z.array(experimentSchema).parse(response) as AiExperiment[];
  },

  async get(experimentId: string): Promise<AiExperiment> {
    const response = await api.get<unknown>(`${BASE}/${experimentId}`);
    return experimentSchema.parse(response) as AiExperiment;
  },

  async create(input: CreateAiExperimentInput): Promise<AiExperiment> {
    const payload = createExperimentSchema.parse(input);
    const response = await api.post<unknown>(BASE, payload);
    return experimentSchema.parse(response) as AiExperiment;
  },

  async listVariants(experimentId: string): Promise<AiExperimentVariant[]> {
    const response = await api.get<unknown>(`${BASE}/${experimentId}/variants`);
    return z.array(variantSchema).parse(response) as AiExperimentVariant[];
  },

  async listRuns(experimentId: string): Promise<AiExperimentRun[]> {
    const response = await api.get<unknown>(`${BASE}/${experimentId}/runs`);
    return z.array(experimentRunSchema).parse(response) as AiExperimentRun[];
  },

  async launch(experimentId: string): Promise<AiExperimentRun> {
    const response = await api.post<unknown>(`${BASE}/${experimentId}/runs`);
    return experimentRunSchema.parse(response) as AiExperimentRun;
  },
};
