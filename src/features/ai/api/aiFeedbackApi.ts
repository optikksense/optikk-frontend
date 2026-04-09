import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";
import api from "@/shared/api/api/client";

import type { AiFeedback } from "../types";

const BASE = `${API_CONFIG.ENDPOINTS.V1_BASE}/ai/feedback`;

const feedbackSchema = z.object({
  id: z.string(),
  teamId: z.number(),
  targetType: z.enum(["run", "prompt", "dataset-item", "eval-run", "experiment-run"]),
  targetId: z.string(),
  runSpanId: z.string().optional(),
  traceId: z.string().optional(),
  score: z.number(),
  label: z.string(),
  comment: z.string().default(""),
  createdBy: z.string().default("system"),
  createdAt: z.string(),
});

const createFeedbackSchema = z.object({
  targetType: z.enum(["run", "prompt", "dataset-item", "eval-run", "experiment-run"]),
  targetId: z.string().min(1),
  runSpanId: z.string().optional(),
  traceId: z.string().optional(),
  score: z.number().min(0).max(100),
  label: z.string().min(1),
  comment: z.string().default(""),
});

export type CreateAiFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const aiFeedbackApi = {
  async list(targetType?: string, targetId?: string): Promise<AiFeedback[]> {
    const response = await api.get<unknown>(BASE, {
      params: {
        ...(targetType ? { targetType } : {}),
        ...(targetId ? { targetId } : {}),
      },
    });
    return z.array(feedbackSchema).parse(response) as AiFeedback[];
  },

  async create(input: CreateAiFeedbackInput): Promise<AiFeedback> {
    const payload = createFeedbackSchema.parse(input);
    const response = await api.post<unknown>(BASE, payload);
    return feedbackSchema.parse(response) as AiFeedback;
  },
};
