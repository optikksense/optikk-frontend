import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

interface PlaygroundMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface PlaygroundCompleteRequest {
  provider: "openai" | "anthropic" | "mistral";
  model: string;
  messages: PlaygroundMessage[];
  temperature?: number;
  maxTokens?: number;
}

const completeResponseSchema = z.object({
  output: z.string(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  latencyMs: z.number(),
  costUsd: z.number(),
});
export type PlaygroundCompleteResponse = z.infer<typeof completeResponseSchema>;

export async function playgroundComplete(
  req: PlaygroundCompleteRequest
): Promise<PlaygroundCompleteResponse> {
  const res = await api.post<unknown>(`${BASE}/llm/playground/complete`, req);
  return validateResponse(completeResponseSchema, res);
}
