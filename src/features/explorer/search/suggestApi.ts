import { API_CONFIG } from "@config/apiConfig";
import { z } from "zod";

import api from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

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

const suggestionSchema = z.object({
  value: z.string(),
  count: z.coerce.number(),
});

const responseSchema = z.object({
  suggestions: z.union([z.array(suggestionSchema), z.null()]).transform((v) => v ?? []),
});

export async function fetchSuggestions(req: SuggestRequest): Promise<SuggestionItem[]> {
  const body = {
    startTime: req.startTime,
    endTime: req.endTime,
    field: req.field,
    prefix: req.prefix ?? "",
    limit: req.limit ?? 10,
  };
  const raw = await api.post<unknown>(`${BASE}/traces/suggest`, body);
  return validateResponse(responseSchema, raw).suggestions;
}
