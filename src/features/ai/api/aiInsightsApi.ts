import { z } from "zod";

import { API_CONFIG } from "@config/apiConfig";
import api from "@/shared/api/api/client";

import type {
  AiCostMetric,
  AiCostTimeSeries,
  AiInsightSummary,
  AiModelInsight,
  AiPerformanceMetric,
  AiPerformanceTimeSeries,
  AiPiiCategory,
  AiSecurityMetric,
  AiSecurityTimeSeries,
  AiTokenBreakdown,
} from "../types";

import type { RequestTime } from "@/shared/api/service-types";

const BASE = `${API_CONFIG.ENDPOINTS.V1_BASE}/ai`;

const summarySchema = z.object({
  total_requests: z.number(),
  avg_qps: z.number(),
  avg_latency_ms: z.number(),
  p95_latency_ms: z.number(),
  timeout_count: z.number(),
  error_count: z.number(),
  total_tokens: z.number(),
  total_cost_usd: z.number(),
  avg_cost_per_query: z.number(),
  cache_hit_rate: z.number(),
  pii_detection_rate: z.number(),
  guardrail_block_rate: z.number(),
  avg_tokens_per_sec: z.number(),
  active_models: z.number(),
});

const performanceMetricSchema = z.object({
  model_name: z.string(),
  model_provider: z.string().default("unknown"),
  request_type: z.string().default("unknown"),
  total_requests: z.number(),
  avg_qps: z.number(),
  avg_latency_ms: z.number(),
  p50_latency_ms: z.number(),
  p95_latency_ms: z.number(),
  p99_latency_ms: z.number(),
  max_latency_ms: z.number(),
  timeout_count: z.number(),
  error_count: z.number(),
  timeout_rate: z.number(),
  error_rate: z.number(),
  avg_tokens_per_sec: z.number(),
  avg_retry_count: z.number(),
});

const performanceTimeSeriesSchema = z.object({
  model_name: z.string(),
  timestamp: z.string(),
  request_count: z.number(),
  avg_latency_ms: z.number(),
  p95_latency_ms: z.number(),
  timeout_count: z.number(),
  error_count: z.number(),
  tokens_per_sec: z.number(),
});

const costMetricSchema = z.object({
  model_name: z.string(),
  model_provider: z.string().default("unknown"),
  total_requests: z.number(),
  total_cost_usd: z.number(),
  avg_cost_per_query: z.number(),
  max_cost_per_query: z.number(),
  total_prompt_tokens: z.number(),
  total_completion_tokens: z.number(),
  total_tokens: z.number(),
  avg_prompt_tokens: z.number(),
  avg_completion_tokens: z.number(),
  cache_hit_rate: z.number(),
  total_cache_tokens: z.number(),
});

const costTimeSeriesSchema = z.object({
  model_name: z.string(),
  timestamp: z.string(),
  cost_per_interval: z.number(),
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  request_count: z.number(),
});

const tokenBreakdownSchema = z.object({
  model_name: z.string(),
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  system_tokens: z.number(),
  cache_tokens: z.number(),
});

const securityMetricSchema = z.object({
  model_name: z.string(),
  model_provider: z.string().default("unknown"),
  total_requests: z.number(),
  pii_detected_count: z.number(),
  pii_detection_rate: z.number(),
  guardrail_blocked_count: z.number(),
  guardrail_block_rate: z.number(),
  content_policy_count: z.number(),
  content_policy_rate: z.number(),
});

const securityTimeSeriesSchema = z.object({
  model_name: z.string(),
  timestamp: z.string(),
  total_requests: z.number(),
  pii_count: z.number(),
  guardrail_count: z.number(),
  content_policy_count: z.number(),
});

const piiCategorySchema = z.object({
  model_name: z.string(),
  pii_categories: z.string(),
  detection_count: z.number(),
});

function rangeParams(startTime: RequestTime, endTime: RequestTime, extra?: Record<string, unknown>) {
  return {
    startTime,
    endTime,
    ...(extra ?? {}),
  };
}

function mapSummary(payload: z.infer<typeof summarySchema>): AiInsightSummary {
  return {
    totalRequests: payload.total_requests,
    avgQps: payload.avg_qps,
    avgLatencyMs: payload.avg_latency_ms,
    p95LatencyMs: payload.p95_latency_ms,
    timeoutCount: payload.timeout_count,
    errorCount: payload.error_count,
    totalTokens: payload.total_tokens,
    totalCostUsd: payload.total_cost_usd,
    avgCostPerQuery: payload.avg_cost_per_query,
    cacheHitRate: payload.cache_hit_rate,
    piiDetectionRate: payload.pii_detection_rate,
    guardrailBlockRate: payload.guardrail_block_rate,
    avgTokensPerSec: payload.avg_tokens_per_sec,
    activeModels: payload.active_models,
  };
}

function mapPerformanceMetric(payload: z.infer<typeof performanceMetricSchema>): AiPerformanceMetric {
  return {
    modelName: payload.model_name,
    modelProvider: payload.model_provider,
    requestType: payload.request_type,
    totalRequests: payload.total_requests,
    avgQps: payload.avg_qps,
    avgLatencyMs: payload.avg_latency_ms,
    p50LatencyMs: payload.p50_latency_ms,
    p95LatencyMs: payload.p95_latency_ms,
    p99LatencyMs: payload.p99_latency_ms,
    maxLatencyMs: payload.max_latency_ms,
    timeoutCount: payload.timeout_count,
    errorCount: payload.error_count,
    timeoutRate: payload.timeout_rate,
    errorRate: payload.error_rate,
    avgTokensPerSec: payload.avg_tokens_per_sec,
    avgRetryCount: payload.avg_retry_count,
  };
}

function mapPerformancePoint(
  payload: z.infer<typeof performanceTimeSeriesSchema>
): AiPerformanceTimeSeries {
  return {
    modelName: payload.model_name,
    timestamp: payload.timestamp,
    requestCount: payload.request_count,
    avgLatencyMs: payload.avg_latency_ms,
    p95LatencyMs: payload.p95_latency_ms,
    timeoutCount: payload.timeout_count,
    errorCount: payload.error_count,
    tokensPerSec: payload.tokens_per_sec,
  };
}

function mapCostMetric(payload: z.infer<typeof costMetricSchema>): AiCostMetric {
  return {
    modelName: payload.model_name,
    modelProvider: payload.model_provider,
    totalRequests: payload.total_requests,
    totalCostUsd: payload.total_cost_usd,
    avgCostPerQuery: payload.avg_cost_per_query,
    maxCostPerQuery: payload.max_cost_per_query,
    totalPromptTokens: payload.total_prompt_tokens,
    totalCompletionTokens: payload.total_completion_tokens,
    totalTokens: payload.total_tokens,
    avgPromptTokens: payload.avg_prompt_tokens,
    avgCompletionTokens: payload.avg_completion_tokens,
    cacheHitRate: payload.cache_hit_rate,
    totalCacheTokens: payload.total_cache_tokens,
  };
}

function mapCostPoint(payload: z.infer<typeof costTimeSeriesSchema>): AiCostTimeSeries {
  return {
    modelName: payload.model_name,
    timestamp: payload.timestamp,
    costPerInterval: payload.cost_per_interval,
    promptTokens: payload.prompt_tokens,
    completionTokens: payload.completion_tokens,
    requestCount: payload.request_count,
  };
}

function mapTokenBreakdown(payload: z.infer<typeof tokenBreakdownSchema>): AiTokenBreakdown {
  return {
    modelName: payload.model_name,
    promptTokens: payload.prompt_tokens,
    completionTokens: payload.completion_tokens,
    systemTokens: payload.system_tokens,
    cacheTokens: payload.cache_tokens,
  };
}

function mapSecurityMetric(payload: z.infer<typeof securityMetricSchema>): AiSecurityMetric {
  return {
    modelName: payload.model_name,
    modelProvider: payload.model_provider,
    totalRequests: payload.total_requests,
    piiDetectedCount: payload.pii_detected_count,
    piiDetectionRate: payload.pii_detection_rate,
    guardrailBlockedCount: payload.guardrail_blocked_count,
    guardrailBlockRate: payload.guardrail_block_rate,
    contentPolicyCount: payload.content_policy_count,
    contentPolicyRate: payload.content_policy_rate,
  };
}

function mapSecurityPoint(payload: z.infer<typeof securityTimeSeriesSchema>): AiSecurityTimeSeries {
  return {
    modelName: payload.model_name,
    timestamp: payload.timestamp,
    totalRequests: payload.total_requests,
    piiCount: payload.pii_count,
    guardrailCount: payload.guardrail_count,
    contentPolicyCount: payload.content_policy_count,
  };
}

function mapPiiCategory(payload: z.infer<typeof piiCategorySchema>): AiPiiCategory {
  return {
    modelName: payload.model_name,
    piiCategories: payload.pii_categories,
    detectionCount: payload.detection_count,
  };
}

export function buildModelInsights(
  performance: readonly AiPerformanceMetric[],
  cost: readonly AiCostMetric[],
  security: readonly AiSecurityMetric[]
): AiModelInsight[] {
  const costByModel = new Map(cost.map((entry) => [entry.modelName, entry]));
  const securityByModel = new Map(security.map((entry) => [entry.modelName, entry]));

  return performance
    .map((entry) => {
      const costEntry = costByModel.get(entry.modelName);
      const securityEntry = securityByModel.get(entry.modelName);

      return {
        modelName: entry.modelName,
        modelProvider: entry.modelProvider,
        totalRequests: entry.totalRequests,
        avgLatencyMs: entry.avgLatencyMs,
        p95LatencyMs: entry.p95LatencyMs,
        errorRate: entry.errorRate,
        totalCostUsd: costEntry?.totalCostUsd ?? 0,
        totalTokens: costEntry?.totalTokens ?? 0,
        piiDetectionRate: securityEntry?.piiDetectionRate ?? 0,
        guardrailBlockRate: securityEntry?.guardrailBlockRate ?? 0,
        avgTokensPerSec: entry.avgTokensPerSec,
      } satisfies AiModelInsight;
    })
    .sort((left, right) => right.totalCostUsd - left.totalCostUsd || right.totalRequests - left.totalRequests);
}

export const aiInsightsApi = {
  async getSummary(startTime: RequestTime, endTime: RequestTime): Promise<AiInsightSummary> {
    const response = await api.get<unknown>(`${BASE}/summary`, {
      params: rangeParams(startTime, endTime),
    });
    return mapSummary(summarySchema.parse(response));
  },

  async getPerformanceMetrics(
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<AiPerformanceMetric[]> {
    const response = await api.get<unknown>(`${BASE}/performance/metrics`, {
      params: rangeParams(startTime, endTime),
    });
    return z.array(performanceMetricSchema).parse(response).map(mapPerformanceMetric);
  },

  async getPerformanceTimeSeries(
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<AiPerformanceTimeSeries[]> {
    const response = await api.get<unknown>(`${BASE}/performance/timeseries`, {
      params: rangeParams(startTime, endTime, { interval: "5m" }),
    });
    return z.array(performanceTimeSeriesSchema).parse(response).map(mapPerformancePoint);
  },

  async getCostMetrics(startTime: RequestTime, endTime: RequestTime): Promise<AiCostMetric[]> {
    const response = await api.get<unknown>(`${BASE}/cost/metrics`, {
      params: rangeParams(startTime, endTime),
    });
    return z.array(costMetricSchema).parse(response).map(mapCostMetric);
  },

  async getCostTimeSeries(
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<AiCostTimeSeries[]> {
    const response = await api.get<unknown>(`${BASE}/cost/timeseries`, {
      params: rangeParams(startTime, endTime, { interval: "5m" }),
    });
    return z.array(costTimeSeriesSchema).parse(response).map(mapCostPoint);
  },

  async getTokenBreakdown(
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<AiTokenBreakdown[]> {
    const response = await api.get<unknown>(`${BASE}/cost/token-breakdown`, {
      params: rangeParams(startTime, endTime),
    });
    return z.array(tokenBreakdownSchema).parse(response).map(mapTokenBreakdown);
  },

  async getSecurityMetrics(
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<AiSecurityMetric[]> {
    const response = await api.get<unknown>(`${BASE}/security/metrics`, {
      params: rangeParams(startTime, endTime),
    });
    return z.array(securityMetricSchema).parse(response).map(mapSecurityMetric);
  },

  async getSecurityTimeSeries(
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<AiSecurityTimeSeries[]> {
    const response = await api.get<unknown>(`${BASE}/security/timeseries`, {
      params: rangeParams(startTime, endTime, { interval: "5m" }),
    });
    return z.array(securityTimeSeriesSchema).parse(response).map(mapSecurityPoint);
  },

  async getPiiCategories(startTime: RequestTime, endTime: RequestTime): Promise<AiPiiCategory[]> {
    const response = await api.get<unknown>(`${BASE}/security/pii-categories`, {
      params: rangeParams(startTime, endTime),
    });
    return z.array(piiCategorySchema).parse(response).map(mapPiiCategory);
  },
};
