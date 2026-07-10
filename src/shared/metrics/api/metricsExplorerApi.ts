import { z } from "zod";

import api from "@/shared/api/api/client";
import { decodeApiResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";
import type {
  MetricQueryDefinition,
  MetricSpaceAggregation,
  TimeStep,
} from "@shared/metrics/types";

export function buildExplorerQueryRequest(
  queries: MetricQueryDefinition[],
  startTime: number,
  endTime: number,
  step: TimeStep,
  spaceAgg: MetricSpaceAggregation
): MetricExplorerQueryRequest {
  return {
    startTime,
    endTime,
    step,
    queries: queries
      .filter((q) => q.metricName)
      .map((q) => ({
        id: q.id,
        aggregation: q.aggregation,
        metricName: q.metricName,
        where: q.where.map((w) => ({ key: w.key, operator: w.operator, value: w.value })),
        groupBy: [...q.groupBy],
        spaceAggregation: spaceAgg,
      })),
  };
}

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const metricNameEntrySchema = z
  .object({
    name: z.string(),
    type: z.enum(["gauge", "counter", "histogram", "summary"]),
    unit: z.string().optional(),
    description: z.string().optional(),
  })
  .strict();

const metricNamesResponseSchema = z
  .object({
    metrics: z.array(metricNameEntrySchema),
  })
  .strict();

const metricTagSchema = z
  .object({
    key: z.string(),
    values: z.array(z.string()),
  })
  .strict();

const metricTagsResponseSchema = z
  .object({
    tags: z.array(metricTagSchema),
  })
  .strict();

const metricSeriesSchema = z
  .object({
    tags: z.record(z.string(), z.string()),
    values: z.array(z.number().nullable()),
  })
  .strict();

const metricQueryResultSchema = z
  .object({
    timestamps: z.array(z.number()),
    series: z.array(metricSeriesSchema),
  })
  .strict();

const metricsExplorerResponseSchema = z
  .object({
    results: z.record(z.string(), metricQueryResultSchema),
  })
  .strict();

// Request types

export interface MetricNamesRequest {
  readonly startTime: number;
  readonly endTime: number;
  readonly search?: string;
}

export interface MetricTagsRequest {
  readonly metricName: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly tagKey?: string;
}

export interface MetricExplorerQueryRequest {
  readonly startTime: number;
  readonly endTime: number;
  readonly step: string;
  readonly queries: ReadonlyArray<{
    readonly id: string;
    readonly aggregation: string;
    readonly metricName: string;
    readonly where: ReadonlyArray<{
      readonly key: string;
      readonly operator: string;
      readonly value: string | string[];
    }>;
    readonly groupBy: string[];
    readonly spaceAggregation?: string;
  }>;
}

export type MetricNamesResponse = z.infer<typeof metricNamesResponseSchema>;
export type MetricTagsResponse = z.infer<typeof metricTagsResponseSchema>;
export type MetricsExplorerResponse = z.infer<typeof metricsExplorerResponseSchema>;

// Backend emits epoch-ms timestamps; the chart stack assumes epoch-seconds.
function toSecondsTimestamps(response: MetricsExplorerResponse): MetricsExplorerResponse {
  for (const result of Object.values(response.results)) {
    result.timestamps = result.timestamps.map((ts) => Math.floor(ts / 1000));
  }
  return response;
}

export const metricsExplorerApi = {
  async getMetricNames(params: MetricNamesRequest): Promise<MetricNamesResponse> {
    const queryParams = new URLSearchParams({
      startTime: String(params.startTime),
      endTime: String(params.endTime),
    });
    if (params.search) {
      queryParams.set("search", params.search);
    }
    const response = await api.get(`${BASE}/metrics/names?${queryParams.toString()}`);
    return decodeApiResponse(metricNamesResponseSchema, response, {
      context: "metric names",
      expectedType: "object",
      message: "Invalid metric names response",
    });
  },

  async getMetricTags(params: MetricTagsRequest): Promise<MetricTagsResponse> {
    const queryParams = new URLSearchParams({
      startTime: String(params.startTime),
      endTime: String(params.endTime),
    });
    if (params.tagKey) {
      queryParams.set("tagKey", params.tagKey);
    }
    const encodedName = encodeURIComponent(params.metricName);
    const response = await api.get(`${BASE}/metrics/${encodedName}/tags?${queryParams.toString()}`);
    return decodeApiResponse(metricTagsResponseSchema, response, {
      context: `metric tags (${params.metricName})`,
      expectedType: "object",
      message: "Invalid metric tags response",
    });
  },

  async query(body: MetricExplorerQueryRequest): Promise<MetricsExplorerResponse> {
    const response = await api.post(`${BASE}/metrics/explorer/query`, body);
    const decoded = decodeApiResponse(metricsExplorerResponseSchema, response, {
      context: "metrics explorer query",
      expectedType: "object",
      message: "Invalid metrics explorer response",
    });
    return toSecondsTimestamps(decoded);
  },
};
