import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";
import api from "@/shared/api/api/client";

import type { AiDataset, AiDatasetItem } from "../types";

const BASE = `${API_CONFIG.ENDPOINTS.V1_BASE}/ai/datasets`;

const jsonRecordSchema = z.record(z.string(), z.unknown()).default({});

const datasetSchema = z.object({
  id: z.string(),
  teamId: z.number(),
  name: z.string(),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
  itemCount: z.number(),
  updatedAt: z.string(),
  createdAt: z.string(),
});

const datasetItemSchema = z.object({
  id: z.string(),
  datasetId: z.string(),
  input: jsonRecordSchema,
  expectedOutput: z.string().default(""),
  metadata: jsonRecordSchema,
  createdAt: z.string(),
});

const createDatasetSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  tags: z.array(z.string()).default([]),
});

const createDatasetItemSchema = z.object({
  input: jsonRecordSchema,
  expectedOutput: z.string().default(""),
  metadata: jsonRecordSchema,
});

export type CreateAiDatasetInput = z.infer<typeof createDatasetSchema>;
export type CreateAiDatasetItemInput = z.infer<typeof createDatasetItemSchema>;

export const aiDatasetsApi = {
  async list(): Promise<AiDataset[]> {
    const response = await api.get<unknown>(BASE);
    return z.array(datasetSchema).parse(response) as AiDataset[];
  },

  async get(datasetId: string): Promise<AiDataset> {
    const response = await api.get<unknown>(`${BASE}/${datasetId}`);
    return datasetSchema.parse(response) as AiDataset;
  },

  async create(input: CreateAiDatasetInput): Promise<AiDataset> {
    const payload = createDatasetSchema.parse(input);
    const response = await api.post<unknown>(BASE, payload);
    return datasetSchema.parse(response) as AiDataset;
  },

  async listItems(datasetId: string): Promise<AiDatasetItem[]> {
    const response = await api.get<unknown>(`${BASE}/${datasetId}/items`);
    return z.array(datasetItemSchema).parse(response) as AiDatasetItem[];
  },

  async createItem(datasetId: string, input: CreateAiDatasetItemInput): Promise<AiDatasetItem> {
    const payload = createDatasetItemSchema.parse(input);
    const response = await api.post<unknown>(`${BASE}/${datasetId}/items`, payload);
    return datasetItemSchema.parse(response) as AiDatasetItem;
  },
};
