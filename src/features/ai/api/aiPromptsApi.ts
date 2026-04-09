import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";
import api from "@/shared/api/api/client";

import type { AiPrompt, AiPromptVersion } from "../types";

const BASE = `${API_CONFIG.ENDPOINTS.V1_BASE}/ai/prompts`;

const promptSchema = z.object({
  id: z.string(),
  teamId: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().default(""),
  modelProvider: z.string(),
  modelName: z.string(),
  systemPrompt: z.string(),
  userTemplate: z.string(),
  tags: z.array(z.string()).default([]),
  latestVersion: z.number(),
  activeVersionId: z.string().optional(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

const promptVersionSchema = z.object({
  id: z.string(),
  promptId: z.string(),
  versionNumber: z.number(),
  changelog: z.string().default(""),
  systemPrompt: z.string(),
  userTemplate: z.string(),
  variables: z.array(z.string()).default([]),
  isActive: z.boolean(),
  createdAt: z.string(),
});

const createPromptSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(""),
  modelProvider: z.string().min(1),
  modelName: z.string().min(1),
  systemPrompt: z.string().min(1),
  userTemplate: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

const createVersionSchema = z.object({
  changelog: z.string().default(""),
  systemPrompt: z.string().min(1),
  userTemplate: z.string().min(1),
  variables: z.array(z.string()).default([]),
  activate: z.boolean().default(true),
});

export type CreateAiPromptInput = z.infer<typeof createPromptSchema>;
export type CreateAiPromptVersionInput = z.infer<typeof createVersionSchema>;

export const aiPromptsApi = {
  async list(): Promise<AiPrompt[]> {
    const response = await api.get<unknown>(BASE);
    return z.array(promptSchema).parse(response) as AiPrompt[];
  },

  async get(promptId: string): Promise<AiPrompt> {
    const response = await api.get<unknown>(`${BASE}/${promptId}`);
    return promptSchema.parse(response) as AiPrompt;
  },

  async create(input: CreateAiPromptInput): Promise<AiPrompt> {
    const payload = createPromptSchema.parse(input);
    const response = await api.post<unknown>(BASE, payload);
    return promptSchema.parse(response) as AiPrompt;
  },

  async listVersions(promptId: string): Promise<AiPromptVersion[]> {
    const response = await api.get<unknown>(`${BASE}/${promptId}/versions`);
    return z.array(promptVersionSchema).parse(response) as AiPromptVersion[];
  },

  async createVersion(promptId: string, input: CreateAiPromptVersionInput): Promise<AiPromptVersion> {
    const payload = createVersionSchema.parse(input);
    const response = await api.post<unknown>(`${BASE}/${promptId}/versions`, payload);
    return promptVersionSchema.parse(response) as AiPromptVersion;
  },
};
