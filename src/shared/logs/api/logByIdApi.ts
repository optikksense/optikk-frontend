import { API_CONFIG } from "@config/apiConfig";
import { api } from "@shared/api/http/client";
import { validateResponse } from "@shared/api/utils/validate";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

import type { LogsGetByIdResponse } from "../types/log";
import { normalizeLogRecord, rawLogRowSchema } from "./logsQueryApi";

const getByIdSchema = rawLogRowSchema.transform((row) => ({ log: normalizeLogRecord(row) }));

export async function getLogById(
  id: string,
  startMs: number,
  endMs: number
): Promise<LogsGetByIdResponse> {
  const raw = await api.get<unknown>(`${V1}/logs/${encodeURIComponent(id)}`, {
    params: { startTime: startMs, endTime: endMs },
  });
  return validateResponse(getByIdSchema, raw);
}
