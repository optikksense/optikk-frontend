/**
 * Logs Service — API calls for log ingestion and retrieval.
 */
import { API_CONFIG } from '@config/apiConfig';
import { io } from 'socket.io-client';
import { z } from 'zod';

import api from './api';
import { validateResponse } from './utils/validate';
import { logRecordSchema, logVolumeSchema } from './schemas/logsSchemas';

import type { LogRecord, LogVolume } from './schemas/logsSchemas';
import type { QueryParams, RequestTime } from './service-types';

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
    params: QueryParams = {},
  ): Promise<{ logs: LogRecord[]; total: number; cursor?: string }> {
    const data = await api.get(`${BASE}/logs`, { params: { startTime, endTime, ...params } });
    return validateResponse(logsListSchema, data);
  },

  async getLogHistogram(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = '1m',
  ): Promise<unknown> {
    return api.get(`${BASE}/logs/histogram`, { params: { startTime, endTime, step: interval } });
  },

  async getLogDetail(
    _teamId: number | null,
    traceId: string,
    spanId: string,
    timestamp: RequestTime,
    contextWindow = 30,
  ): Promise<unknown> {
    return api.get(`${BASE}/logs/detail`, { params: { traceId, spanId, timestamp, contextWindow } });
  },

  async getLogStats(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/logs/stats`, { params: { startTime, endTime, ...params } });
  },

  async getLogVolume(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    step?: string,
    params: QueryParams = {},
  ): Promise<LogVolume> {
    const data = await api.get(`${BASE}/logs/volume`, { params: { startTime, endTime, step, ...params } });
    return validateResponse(logVolumeSchema, data);
  },

  async getLogFields(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    field: string,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/logs/fields`, { params: { startTime, endTime, field, ...params } });
  },

  async getLogSurrounding(
    _teamId: number | null,
    logId: string | number | bigint,
    before = 10,
    after = 10,
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
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/logs/aggregate`, {
      params: { startTime, endTime, group_by: groupBy, step, top_n: topN, metric, ...params },
    });
  },

  /**
   * Stream logs via socket.io.
   * Uses the shared useSocketStream hook for live tail —
   * this imperative helper is kept for non-hook consumers.
   */
  streamLogs(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
    onLog: (log: LogRecord) => void,
    onError: (err: unknown) => void,
  ): () => void {
    const socket = io('/live', {
      path: '/socket.io/',
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('subscribe:logs', { startTime, endTime, ...params });
    });

    socket.on('log', (payload: { item?: unknown }) => {
      if (payload?.item) {
        onLog(payload.item as LogRecord);
      }
    });

    socket.on('connect_error', (err) => {
      onError(err);
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
  },
};
