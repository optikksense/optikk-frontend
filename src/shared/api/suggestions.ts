import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

export interface SuggestRequest {
  readonly startTime: number;
  readonly endTime: number;
  readonly field: string;
  readonly prefix?: string;
  readonly limit?: number;
}

export interface SuggestionItem {
  readonly value: string;
  readonly count: number;
}

const suggestionSchema = z
  .object({
    value: z.string(),
    count: z.coerce.number(),
  })
  .strict();

const suggestResponseSchema = z
  .object({
    suggestions: z.union([z.array(suggestionSchema), z.null()]).transform((v) => v ?? []),
  })
  .strict();

export async function getSuggestions(req: SuggestRequest): Promise<SuggestionItem[]> {
  const body = {
    startTime: req.startTime,
    endTime: req.endTime,
    field: req.field,
    prefix: req.prefix ?? "",
    limit: req.limit ?? 10,
  };
  const raw = await api.post<unknown>(`${API_CONFIG.ENDPOINTS.V1_BASE}/traces/suggest`, body);
  return validateResponse(suggestResponseSchema, raw).suggestions;
}
