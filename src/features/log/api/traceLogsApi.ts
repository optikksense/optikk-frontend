import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/api/client";
import { traceLogSchema } from "@shared/api/schemas/tracesSchemas";
import type { TraceLogsResponse } from "@shared/api/schemas/tracesSchemas";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const traceLogArraySchema = z.array(traceLogSchema).nullish().transform((v) => v ?? []);

export async function getTraceLogs(
  traceId: string,
  limit?: number
): Promise<TraceLogsResponse> {
  const data = await api.get(`${BASE}/logs/trace/${traceId}`, {
    params: limit ? { limit } : undefined,
  });
  const logs = validateResponse(traceLogArraySchema, data ?? []);
  return { logs, is_speculative: false };
}
