/**
 * Logs Service — API calls for log ingestion and retrieval.
 */
import { API_CONFIG } from '@config/apiConfig';

import api from './api';

import type { QueryParams, RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 * Service wrapper for log endpoints.
 */
export const logsService = {
  async getLogs(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/logs`, { params: { startTime, endTime, ...params } });
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
  ): Promise<unknown> {
    return api.get(`${BASE}/logs/volume`, { params: { startTime, endTime, step, ...params } });
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
};
