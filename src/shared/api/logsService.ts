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

  /**
   * SSE Stream for Live Tail
   */
  streamLogs(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
    onLog: (log: any) => void,
    onError: (err: any) => void
  ): () => void {
    // Construct URL with query params
    const url = new URL(`${window.location.origin}${BASE}/logs/stream`);
    url.searchParams.append('startTime', String(startTime));
    url.searchParams.append('endTime', String(endTime));
    
    // Copy all OptiQL params (e.g. search, services, severities) into the URL
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)));
        } else if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const source = new EventSource(url.toString(), { withCredentials: true });

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onLog(data);
      } catch (err) {
        console.error('Failed to parse stream log', err);
      }
    };

    source.onerror = (err) => {
      onError(err);
      source.close();
    };

    return () => {
      source.close();
    };
  },
};
