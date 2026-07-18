import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/http/client";
import { traceLogSchema } from "@shared/api/traces/schemas";
import type { TraceLogsResponse } from "@shared/api/traces/schemas";
import { validateResponse } from "@shared/api/utils/validate";
import { z } from "zod";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const traceLogArraySchema = z
  .array(traceLogSchema)
  .nullish()
  .transform((v) => v ?? []);

export async function getTraceLogs(
  traceId: string,
  startTime: number,
  endTime: number,
  limit?: number
): Promise<TraceLogsResponse> {
  const data = await api.get(`${BASE}/logs/trace/${traceId}`, {
    params: { startTime, endTime, limit },
  });
  const logs = validateResponse(traceLogArraySchema, data ?? []);
  return { logs, is_speculative: false };
}
