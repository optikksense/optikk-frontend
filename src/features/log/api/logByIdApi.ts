import { api } from "@shared/api/api/client";
import { validateResponse } from "@shared/api/utils/validate";

import type { LogsGetByIdResponse } from "../types/log";
import { normalizeLogRecord, rawLogRowSchema } from "./logsQueryApi";

const getByIdSchema = rawLogRowSchema.transform((row) => ({ log: normalizeLogRecord(row) }));

export async function getLogById(id: string): Promise<LogsGetByIdResponse> {
  const raw = await api.get<unknown>(`/v1/logs/${encodeURIComponent(id)}`);
  return validateResponse(getByIdSchema, raw);
}
