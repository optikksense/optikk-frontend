import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import type { TraceSummary } from "../types/trace";
import { normalizeTraceSummary, rawTraceRowSchema } from "./tracesQueryApi";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export async function getById(traceId: string): Promise<TraceSummary> {
  const raw = await api.get<unknown>(`${BASE}/traces/${encodeURIComponent(traceId)}`);
  const row = validateResponse(rawTraceRowSchema, raw);
  return normalizeTraceSummary(row);
}
