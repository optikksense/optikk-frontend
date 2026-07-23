import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export interface PlaygroundMessage {
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

const priceEntrySchema = z.object({
  model: z.string(),
  inPer1M: z.number(),
  outPer1M: z.number(),
});
export type LlmPriceEntry = z.infer<typeof priceEntrySchema>;
const pricingSchema = z.object({ models: z.array(priceEntrySchema).nullish() });

export async function getPricing(): Promise<LlmPriceEntry[]> {
  const res = await api.get<unknown>(`${BASE}/llm/pricing`);
  return validateResponse(pricingSchema, res).models ?? [];
}
