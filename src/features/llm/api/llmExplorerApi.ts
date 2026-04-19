import { z } from "zod";

import api from "@/shared/api/api/client";
import { decodeApiResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";

import type { LlmExplorerResponse, LlmSessionsResponse } from "../types";
import { type LlmCostContext, estimateCost } from "../utils/costCalculator";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const facetBucketSchema = z.object({
  value: z.string(),
  count: z.number(),
});

const llmExplorerFacetsSchema = z.object({
  ai_system: z.array(facetBucketSchema).default([]),
  ai_model: z.array(facetBucketSchema).default([]),
  ai_operation: z.array(facetBucketSchema).default([]),
  service_name: z.array(facetBucketSchema).default([]),
  status: z.array(facetBucketSchema).default([]),
  finish_reason: z.array(facetBucketSchema).default([]),
  prompt_template: z.array(facetBucketSchema).default([]),
});

const llmSummarySchema = z.object({
  total_calls: z.number().default(0),
  error_calls: z.number().default(0),
  avg_latency_ms: z.number().default(0),
  p50_latency_ms: z.number().default(0),
  p95_latency_ms: z.number().default(0),
  p99_latency_ms: z.number().default(0),
  total_input_tokens: z.number().default(0),
  total_output_tokens: z.number().default(0),
});

const llmCallSchema = z.object({
  span_id: z.string(),
  trace_id: z.string(),
  service_name: z.string(),
  operation_name: z.string(),
  start_time: z.string(),
  duration_ms: z.number(),
  status: z.string(),
  status_message: z.string().optional().default(""),
  ai_system: z.string().default(""),
  ai_request_model: z.string().default(""),
  ai_response_model: z.string().optional().default(""),
  ai_operation: z.string().default(""),
  input_tokens: z.number().default(0),
  output_tokens: z.number().default(0),
  total_tokens: z.number().default(0),
  temperature: z.string().optional().default(""),
  max_tokens: z.string().optional().default(""),
  finish_reason: z.string().optional().default(""),
  error_type: z.string().optional().default(""),
});

const llmTrendBucketSchema = z.object({
  time_bucket: z.string(),
  total_calls: z.number(),
  error_calls: z.number(),
  avg_latency_ms: z.number(),
  total_tokens: z.number(),
});

const llmExplorerResponseSchema = z.object({
  results: z.array(llmCallSchema).default([]),
  summary: llmSummarySchema,
  facets: llmExplorerFacetsSchema,
  trend: z.array(llmTrendBucketSchema).default([]),
  pageInfo: z.object({
    limit: z.number().default(50),
    hasMore: z.boolean().default(false),
    nextCursor: z.string().optional(),
  }),
});

const llmSessionRowSchema = z.object({
  session_id: z.string(),
  generation_count: z.number(),
  trace_count: z.number(),
  first_start: z.string(),
  last_start: z.string(),
  total_input_tokens: z.number(),
  total_output_tokens: z.number(),
  error_count: z.number(),
  dominant_model: z.string().default(""),
  dominant_service: z.string().default(""),
});

const llmSessionsResponseSchema = z.object({
  results: z.array(llmSessionRowSchema).default([]),
  pageInfo: z.object({
    limit: z.number().default(50),
    hasMore: z.boolean().default(false),
    nextCursor: z.string().optional(),
  }),
});

export const llmExplorerApi = {
  async query(
    body: {
      startTime: number;
      endTime: number;
      limit: number;
      cursor?: string;
      step: string;
      query: string;
    },
    costCtx?: LlmCostContext | null
  ): Promise<LlmExplorerResponse> {
    const response = await api.post(`${BASE}/ai/explorer/query`, body);
    const parsed = decodeApiResponse(llmExplorerResponseSchema, response, {
      context: "llm explorer",
      expectedType: "object",
      message: "Invalid LLM explorer response",
    });

    const results = parsed.results.map((record) => ({
      ...record,
      estimated_cost: estimateCost(record.ai_request_model, record.input_tokens, record.output_tokens, costCtx),
    }));

    return { ...parsed, results };
  },

  async sessionsQuery(body: {
    startTime: number;
    endTime: number;
    limit: number;
    cursor?: string;
    query: string;
  }): Promise<LlmSessionsResponse> {
    const response = await api.post(`${BASE}/ai/explorer/sessions/query`, body);
    return decodeApiResponse(llmSessionsResponseSchema, response, {
      context: "llm sessions",
      expectedType: "object",
      message: "Invalid LLM sessions response",
    });
  },
};
