import { z } from "zod";

import api from "@/shared/api/api/client";
import { decodeApiResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const scoreSchema = z.object({
  id: z.number(),
  name: z.string(),
  value: z.number(),
  trace_id: z.string(),
  span_id: z.string(),
  session_id: z.string().optional(),
  prompt_template: z.string().optional(),
  model: z.string().optional(),
  source: z.string(),
  rationale: z.string().optional(),
  created_at: z.string(),
});

const listScoresSchema = z.object({
  results: z.array(scoreSchema),
  pageInfo: z.object({
    limit: z.number(),
    hasMore: z.boolean().default(false),
    nextCursor: z.string().optional(),
  }),
});

const promptSchema = z.object({
  id: z.number(),
  slug: z.string(),
  display_name: z.string(),
  body: z.string(),
  version: z.number(),
  created_at: z.string(),
  updated_at: z.string().optional().nullable(),
});

const listPromptsSchema = z.object({
  results: z.array(promptSchema),
});

const datasetSchema = z.object({
  id: z.number(),
  name: z.string(),
  query_snapshot: z.string().optional(),
  start_time_ms: z.number(),
  end_time_ms: z.number(),
  row_count: z.number(),
  created_at: z.string(),
});

const datasetDetailSchema = datasetSchema.extend({
  payload_json: z.string(),
});

const listDatasetsSchema = z.object({
  results: z.array(datasetSchema),
});

const pricingOverrideSchema = z.object({
  inputPer1K: z.number(),
  outputPer1K: z.number(),
});

const teamSettingsSchema = z.object({
  pricing_overrides: z.record(z.string(), pricingOverrideSchema).default({}),
  updated_at: z.string().optional().nullable(),
});

export type LlmHubScore = z.infer<typeof scoreSchema>;
export type LlmHubPrompt = z.infer<typeof promptSchema>;
export type LlmHubDataset = z.infer<typeof datasetSchema>;
export type LlmHubDatasetDetail = z.infer<typeof datasetDetailSchema>;
export type LlmHubPricingOverrides = z.infer<typeof teamSettingsSchema>["pricing_overrides"];

export const llmHubApi = {
  async listScores(params: {
    startTime: number;
    endTime: number;
    limit?: number;
    cursor?: string;
    name?: string;
    traceId?: string;
  }): Promise<z.infer<typeof listScoresSchema>> {
    const response = await api.get(`${BASE}/ai/llm/scores`, {
      params: {
        startTime: params.startTime,
        endTime: params.endTime,
        limit: params.limit,
        cursor: params.cursor,
        name: params.name,
        traceId: params.traceId,
      },
    });
    return decodeApiResponse(listScoresSchema, response, {
      context: "llm hub scores",
      expectedType: "object",
      message: "Invalid scores list",
    });
  },

  async createScore(body: {
    name: string;
    value: number;
    trace_id: string;
    span_id?: string;
    session_id?: string;
    prompt_template?: string;
    model?: string;
    source?: string;
    rationale?: string;
  }): Promise<{ id: number }> {
    const response = await api.post(`${BASE}/ai/llm/scores`, body);
    return decodeApiResponse(z.object({ id: z.number() }), response, {
      context: "llm hub score create",
      expectedType: "object",
      message: "Invalid score create response",
    });
  },

  async listPrompts(): Promise<z.infer<typeof listPromptsSchema>> {
    const response = await api.get(`${BASE}/ai/llm/prompts`);
    return decodeApiResponse(listPromptsSchema, response, {
      context: "llm hub prompts",
      expectedType: "object",
      message: "Invalid prompts list",
    });
  },

  async createPrompt(body: {
    slug: string;
    display_name: string;
    body: string;
  }): Promise<LlmHubPrompt> {
    const response = await api.post(`${BASE}/ai/llm/prompts`, body);
    return decodeApiResponse(promptSchema, response, {
      context: "llm hub prompt create",
      expectedType: "object",
      message: "Invalid prompt create",
    });
  },

  async updatePrompt(id: number, body: { display_name?: string; body?: string }): Promise<void> {
    await api.request({
      method: "PATCH",
      url: `${BASE}/ai/llm/prompts/${id}`,
      data: body,
    });
  },

  async deletePrompt(id: number): Promise<void> {
    await api.delete(`${BASE}/ai/llm/prompts/${id}`);
  },

  async listDatasets(limit?: number): Promise<z.infer<typeof listDatasetsSchema>> {
    const response = await api.get(`${BASE}/ai/llm/datasets`, { params: { limit } });
    return decodeApiResponse(listDatasetsSchema, response, {
      context: "llm hub datasets",
      expectedType: "object",
      message: "Invalid datasets list",
    });
  },

  async createDataset(body: {
    name: string;
    query_snapshot?: string;
    start_time_ms: number;
    end_time_ms: number;
    generations: Record<string, unknown>[];
  }): Promise<LlmHubDataset> {
    const response = await api.post(`${BASE}/ai/llm/datasets`, body);
    return decodeApiResponse(datasetSchema, response, {
      context: "llm hub dataset create",
      expectedType: "object",
      message: "Invalid dataset create",
    });
  },

  async getDataset(id: number): Promise<LlmHubDatasetDetail> {
    const response = await api.get(`${BASE}/ai/llm/datasets/${id}`);
    return decodeApiResponse(datasetDetailSchema, response, {
      context: "llm hub dataset detail",
      expectedType: "object",
      message: "Invalid dataset detail",
    });
  },

  async getSettings(): Promise<z.infer<typeof teamSettingsSchema>> {
    const response = await api.get(`${BASE}/ai/llm/settings`);
    return decodeApiResponse(teamSettingsSchema, response, {
      context: "llm hub settings",
      expectedType: "object",
      message: "Invalid team settings",
    });
  },

  async patchSettings(pricing_overrides: LlmHubPricingOverrides): Promise<void> {
    await api.request({
      method: "PATCH",
      url: `${BASE}/ai/llm/settings`,
      data: { pricing_overrides },
    });
  },
};
