import { API_CONFIG } from "@config/apiConfig";

import api from "@/shared/api/api/client";

import type { RequestTime } from "@/shared/api/service-types";

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

export const aiTransport = {
  async getRuns(startTime: RequestTime, endTime: RequestTime, params: AiRunsQueryParams = {}) {
    return api.get(`${BASE}/ai/runs`, { params: { startTime, endTime, ...params } });
  },

  async getRunsSummary(
    startTime: RequestTime,
    endTime: RequestTime,
    params: AiRunsQueryParams = {}
  ) {
    return api.get(`${BASE}/ai/runs/summary`, { params: { startTime, endTime, ...params } });
  },

  async getRunsModels(startTime: RequestTime, endTime: RequestTime) {
    return api.get(`${BASE}/ai/runs/models`, { params: { startTime, endTime } });
  },

  async getRunsOperations(startTime: RequestTime, endTime: RequestTime) {
    return api.get(`${BASE}/ai/runs/operations`, { params: { startTime, endTime } });
  },

  async getRunDetail(spanId: string) {
    return api.get(`${BASE}/ai/runs/${spanId}`);
  },

  async getRunMessages(spanId: string) {
    return api.get(`${BASE}/ai/runs/${spanId}/messages`);
  },

  async getRunContext(spanId: string, traceId: string) {
    return api.get(`${BASE}/ai/runs/${spanId}/context`, { params: { traceId } });
  },

  async getTrace(traceId: string) {
    return api.get(`${BASE}/traces/${traceId}/llm-spans`);
  },

  async getTraceSummary(traceId: string) {
    return api.get(`${BASE}/traces/${traceId}/llm-summary`);
  },

  async getConversations(startTime: RequestTime, endTime: RequestTime, limit?: number) {
    return api.get(`${BASE}/ai/conversations`, { params: { startTime, endTime, limit } });
  },

  async getConversation(conversationId: string, startTime: RequestTime, endTime: RequestTime) {
    return api.get(`${BASE}/ai/conversations/${conversationId}`, {
      params: { startTime, endTime },
    });
  },
};
