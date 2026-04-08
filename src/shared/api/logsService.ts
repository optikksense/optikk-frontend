/**
 * Logs Service — API calls for log ingestion and retrieval.
 */
import { API_CONFIG } from "@config/apiConfig";
import { z } from "zod";

import api from "./api";
import { logRecordSchema, logVolumeSchema } from "./schemas/logsSchemas";
import { validateResponse } from "./utils/validate";

import type { LogRecord, LogVolume } from "./schemas/logsSchemas";
import type { QueryParams, RequestTime } from "./service-types";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const logsListSchema = z.object({
  logs: z.array(logRecordSchema),
  total: z.number(),
  cursor: z.string().optional(),
});

export const logsService = {
  async getLogs(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {}
  ): Promise<{ logs: LogRecord[]; total: number; cursor?: string }> {
    const data = await api.get(`${BASE}/logs`, { params: { startTime, endTime, ...params } });
    return validateResponse(logsListSchema, data);
  },

  async getLogStats(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {}
  ): Promise<unknown> {
    return api.get(`${BASE}/logs/stats`, { params: { startTime, endTime, ...params } });
  },

  async getLogVolume(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    step?: string,
    params: QueryParams = {}
  ): Promise<LogVolume> {
    const data = await api.get(`${BASE}/logs/volume`, {
      params: { startTime, endTime, step, ...params },
    });
    return validateResponse(logVolumeSchema, data);
  },

  async getLogSurrounding(
    _teamId: number | null,
    logId: string | number | bigint,
    before = 10,
    after = 10
  ): Promise<unknown> {
    return api.get(`${BASE}/logs/surrounding`, { params: { id: logId, before, after } });
  },

  async getLogAggregate(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    groupBy?: string,
    step?: string,
    topN?: number,
    metric?: string,
    params: QueryParams = {}
  ): Promise<unknown> {
    return api.get(`${BASE}/logs/aggregate`, {
      params: { startTime, endTime, group_by: groupBy, step, top_n: topN, metric, ...params },
    });
  },
};
