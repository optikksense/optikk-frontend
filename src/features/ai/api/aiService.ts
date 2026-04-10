/**
 * AI Observability — API Service.
 * Single service handling all AI backend endpoints.
 */
import { API_CONFIG } from "@config/apiConfig";
import api from "@shared/api/api";
import type { RequestTime } from "@shared/api/service-types";
import type {
  AiCostSummary,
  AiCostTimeseriesPoint,
  AiConversation,
  AiConversationSummary,
  AiConversationTurn,
  AiErrorPattern,
  AiErrorTimeseriesPoint,
  AiExplorerFilterParams,
  AiExplorerSummary,
  AiFacets,
  AiFilterParams,
  AiFinishReason,
  AiFinishReasonTrend,
  AiHistogramPoint,
  AiLatencyBucket,
  AiMessage,
  AiModelCatalogEntry,
  AiModelHealth,
  AiModelSummary,
  AiModelTimeseries,
  AiOperationSummary,
  AiParamImpact,
  AiRelatedSpan,
  AiServiceSummary,
  AiSpan,
  AiSpanDetail,
  AiSummary,
  AiTimeseriesDualPoint,
  AiTimeseriesPoint,
  AiTokenBreakdown,
  AiTokenEconomics,
  AiTopError,
  AiTopSlow,
  AiTraceContextSpan,
} from "../types";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

function timeParams(startTime: RequestTime, endTime: RequestTime) {
  return { startTime, endTime };
}

function filterParams(filters?: AiFilterParams) {
  if (!filters) return {};
  const p: Record<string, string> = {};
  if (filters.service) p.service = filters.service;
  if (filters.model) p.model = filters.model;
  if (filters.operation) p.operation = filters.operation;
  if (filters.provider) p.provider = filters.provider;
  return p;
}

export const aiService = {
  // -------- Overview --------
  async getSummary(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiSummary> {
    return api.get(`${BASE}/ai/overview/summary`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getModels(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiModelSummary[]> {
    return api.get(`${BASE}/ai/overview/models`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getOperations(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiOperationSummary[]> {
    return api.get(`${BASE}/ai/overview/operations`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getServices(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiServiceSummary[]> {
    return api.get(`${BASE}/ai/overview/services`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getModelHealth(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiModelHealth[]> {
    return api.get(`${BASE}/ai/overview/model-health`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getTopSlow(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiTopSlow[]> {
    return api.get(`${BASE}/ai/overview/top-slow`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getTopErrors(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiTopError[]> {
    return api.get(`${BASE}/ai/overview/top-errors`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getFinishReasons(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiFinishReason[]> {
    return api.get(`${BASE}/ai/overview/finish-reasons`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getTimeseriesRequests(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiTimeseriesPoint[]> {
    return api.get(`${BASE}/ai/overview/timeseries/requests`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getTimeseriesLatency(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiTimeseriesDualPoint[]> {
    return api.get(`${BASE}/ai/overview/timeseries/latency`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getTimeseriesErrors(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiTimeseriesPoint[]> {
    return api.get(`${BASE}/ai/overview/timeseries/errors`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getTimeseriesTokens(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiTimeseriesDualPoint[]> {
    return api.get(`${BASE}/ai/overview/timeseries/tokens`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getTimeseriesThroughput(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiTimeseriesPoint[]> {
    return api.get(`${BASE}/ai/overview/timeseries/throughput`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getTimeseriesCost(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiTimeseriesPoint[]> {
    return api.get(`${BASE}/ai/overview/timeseries/cost`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },

  // -------- Explorer --------
  async getSpans(startTime: RequestTime, endTime: RequestTime, filters?: AiExplorerFilterParams): Promise<AiSpan[]> {
    const p: Record<string, unknown> = { ...timeParams(startTime, endTime), ...filterParams(filters) };
    if (filters?.status) p.status = filters.status;
    if (filters?.finishReason) p.finishReason = filters.finishReason;
    if (filters?.minDurationMs) p.minDurationMs = filters.minDurationMs;
    if (filters?.maxDurationMs) p.maxDurationMs = filters.maxDurationMs;
    if (filters?.traceId) p.traceId = filters.traceId;
    if (filters?.limit) p.limit = filters.limit;
    if (filters?.offset) p.offset = filters.offset;
    if (filters?.sort) p.sort = filters.sort;
    if (filters?.sortDir) p.sortDir = filters.sortDir;
    return api.get(`${BASE}/ai/explorer/spans`, { params: p });
  },
  async getFacets(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiFacets> {
    return api.get(`${BASE}/ai/explorer/facets`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getExplorerSummary(startTime: RequestTime, endTime: RequestTime, filters?: AiExplorerFilterParams): Promise<AiExplorerSummary> {
    const p: Record<string, unknown> = { ...timeParams(startTime, endTime), ...filterParams(filters) };
    if (filters?.status) p.status = filters.status;
    return api.get(`${BASE}/ai/explorer/summary`, { params: p });
  },
  async getHistogram(startTime: RequestTime, endTime: RequestTime, filters?: AiExplorerFilterParams): Promise<AiHistogramPoint[]> {
    const p: Record<string, unknown> = { ...timeParams(startTime, endTime), ...filterParams(filters) };
    if (filters?.status) p.status = filters.status;
    return api.get(`${BASE}/ai/explorer/histogram`, { params: p });
  },

  // -------- Span Detail --------
  async getSpanDetail(spanId: string): Promise<AiSpanDetail> {
    return api.get(`${BASE}/ai/spans/${spanId}`);
  },
  async getMessages(spanId: string): Promise<AiMessage[]> {
    return api.get(`${BASE}/ai/spans/${spanId}/messages`);
  },
  async getTraceContext(spanId: string): Promise<AiTraceContextSpan[]> {
    return api.get(`${BASE}/ai/spans/${spanId}/trace-context`);
  },
  async getRelatedSpans(spanId: string, startTime: RequestTime, endTime: RequestTime, model?: string, operation?: string): Promise<AiRelatedSpan[]> {
    return api.get(`${BASE}/ai/spans/${spanId}/related`, { params: { ...timeParams(startTime, endTime), model, operation } });
  },
  async getTokenBreakdown(spanId: string, startTime: RequestTime, endTime: RequestTime, model?: string): Promise<AiTokenBreakdown> {
    return api.get(`${BASE}/ai/spans/${spanId}/token-breakdown`, { params: { ...timeParams(startTime, endTime), model } });
  },

  // -------- Analytics --------
  async getModelCatalog(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiModelCatalogEntry[]> {
    return api.get(`${BASE}/ai/analytics/model-catalog`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getModelTimeseries(startTime: RequestTime, endTime: RequestTime, model: string, filters?: AiFilterParams): Promise<AiModelTimeseries[]> {
    return api.get(`${BASE}/ai/analytics/model-timeseries/${encodeURIComponent(model)}`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getLatencyDistribution(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiLatencyBucket[]> {
    return api.get(`${BASE}/ai/analytics/latency-distribution`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getParameterImpact(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiParamImpact[]> {
    return api.get(`${BASE}/ai/analytics/parameter-impact`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getCostSummary(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiCostSummary> {
    return api.get(`${BASE}/ai/analytics/cost-summary`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getCostTimeseries(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiCostTimeseriesPoint[]> {
    return api.get(`${BASE}/ai/analytics/cost-timeseries`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getTokenEconomics(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiTokenEconomics> {
    return api.get(`${BASE}/ai/analytics/token-economics`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getErrorPatterns(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiErrorPattern[]> {
    return api.get(`${BASE}/ai/analytics/error-patterns`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getErrorTimeseries(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiErrorTimeseriesPoint[]> {
    return api.get(`${BASE}/ai/analytics/error-timeseries`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getFinishReasonTrends(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams): Promise<AiFinishReasonTrend[]> {
    return api.get(`${BASE}/ai/analytics/finish-reason-analysis`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters) } });
  },
  async getConversations(startTime: RequestTime, endTime: RequestTime, filters?: AiFilterParams, limit = 50, offset = 0): Promise<AiConversation[]> {
    return api.get(`${BASE}/ai/analytics/conversations`, { params: { ...timeParams(startTime, endTime), ...filterParams(filters), limit, offset } });
  },
  async getConversationTurns(conversationId: string): Promise<AiConversationTurn[]> {
    return api.get(`${BASE}/ai/analytics/conversations/${encodeURIComponent(conversationId)}`);
  },
  async getConversationSummary(conversationId: string): Promise<AiConversationSummary> {
    return api.get(`${BASE}/ai/analytics/conversations/${encodeURIComponent(conversationId)}/summary`);
  },
};
