/**
 * AI Observability Service — API calls for AI/ML model monitoring.
 */
import { API_CONFIG } from "@config/apiConfig";

import api from "./api";

import type { RequestTime } from "./service-types";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export interface AiRunsQueryParams {
  models?: string;
  providers?: string;
  operations?: string;
  services?: string;
  status?: string;
  minDurationMs?: number;
  maxDurationMs?: number;
  minTokens?: number;
  maxTokens?: number;
  traceId?: string;
  limit?: number;
  cursorTimestamp?: string;
  cursorSpanId?: string;
}

/**
 * Service wrapper for AI observability endpoints.
 */
export const aiService = {
  async getSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/summary`, { params: { startTime, endTime } });
  },

  async getActiveModels(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/models`, { params: { startTime, endTime } });
  },

  async getPerformanceMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/performance/metrics`, { params: { startTime, endTime } });
  },

  async getPerformanceTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = "5m"
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/performance/timeseries`, {
      params: { startTime, endTime, interval },
    });
  },

  async getLatencyHistogram(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    modelName: string
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/performance/latency-histogram`, {
      params: { startTime, endTime, modelName },
    });
  },

  async getCostMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/cost/metrics`, { params: { startTime, endTime } });
  },

  async getCostTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = "5m"
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/cost/timeseries`, { params: { startTime, endTime, interval } });
  },

  async getTokenBreakdown(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/cost/token-breakdown`, { params: { startTime, endTime } });
  },

  async getSecurityMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/security/metrics`, { params: { startTime, endTime } });
  },

  async getSecurityTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = "5m"
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/security/timeseries`, { params: { startTime, endTime, interval } });
  },

  async getPiiCategories(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/security/pii-categories`, { params: { startTime, endTime } });
  },

  // --- Runs Explorer ---

  async getRuns(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: AiRunsQueryParams = {}
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/runs`, { params: { startTime, endTime, ...params } });
  },

  async getRunsSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: AiRunsQueryParams = {}
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/runs/summary`, { params: { startTime, endTime, ...params } });
  },

  async getRunsModels(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/runs/models`, { params: { startTime, endTime } });
  },

  async getRunsOperations(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/runs/operations`, { params: { startTime, endTime } });
  },

  // --- Run Detail ---

  async getRunDetail(_teamId: number | null, spanId: string): Promise<unknown> {
    return api.get(`${BASE}/ai/runs/${spanId}`);
  },

  async getRunMessages(_teamId: number | null, spanId: string): Promise<unknown> {
    return api.get(`${BASE}/ai/runs/${spanId}/messages`);
  },

  async getRunContext(_teamId: number | null, spanId: string, traceId: string): Promise<unknown> {
    return api.get(`${BASE}/ai/runs/${spanId}/context`, { params: { traceId } });
  },

  // --- LLM Traces ---

  async getLLMTrace(_teamId: number | null, traceId: string): Promise<unknown> {
    return api.get(`${BASE}/ai/traces/${traceId}`);
  },

  async getLLMTraceSummary(_teamId: number | null, traceId: string): Promise<unknown> {
    return api.get(`${BASE}/ai/traces/${traceId}/summary`);
  },

  // --- Conversations ---

  async getConversations(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    limit?: number
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/conversations`, { params: { startTime, endTime, limit } });
  },

  async getConversation(
    _teamId: number | null,
    conversationId: string,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<unknown> {
    return api.get(`${BASE}/ai/conversations/${conversationId}`, {
      params: { startTime, endTime },
    });
  },
};
