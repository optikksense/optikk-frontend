import { z } from 'zod';

import { API_CONFIG } from '@config/apiConfig';
import api from '@/shared/api/api/client';
import { decodeApiResponse } from '@/shared/api/utils/validate';
import type { MetricQueryDefinition, MetricSpaceAggregation, TimeStep } from '../types';

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

const metricNameEntrySchema = z.object({
  name: z.string(),
  type: z.enum(['gauge', 'counter', 'histogram', 'summary']),
  unit: z.string().optional(),
  description: z.string().optional(),
});

const metricNamesResponseSchema = z.object({
  metrics: z.array(metricNameEntrySchema),
});

const metricTagSchema = z.object({
  key: z.string(),
  values: z.array(z.string()),
});

const metricTagsResponseSchema = z.object({
  tags: z.array(metricTagSchema),
});

const metricSeriesSchema = z.object({
  tags: z.record(z.string(), z.string()),
  values: z.array(z.number().nullable()),
});

const metricQueryResultSchema = z.object({
  timestamps: z.array(z.number()),
  series: z.array(metricSeriesSchema),
});

const metricsExplorerResponseSchema = z.object({
  results: z.record(z.string(), metricQueryResultSchema),
});

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

// Response types (inferred from schemas)

export type MetricNamesResponse = z.infer<typeof metricNamesResponseSchema>;
export type MetricTagsResponse = z.infer<typeof metricTagsResponseSchema>;
export type MetricsExplorerResponse = z.infer<typeof metricsExplorerResponseSchema>;

// API functions

export const metricsExplorerApi = {
  async fetchMetricNames(params: MetricNamesRequest): Promise<MetricNamesResponse> {
    const queryParams = new URLSearchParams({
      startTime: String(params.startTime),
      endTime: String(params.endTime),
    });
    if (params.search) {
      queryParams.set('search', params.search);
    }
    const response = await api.get(`${BASE}/metrics/names?${queryParams.toString()}`);
    return decodeApiResponse(metricNamesResponseSchema, response, {
      context: 'metric names',
      expectedType: 'object',
      message: 'Invalid metric names response',
    });
  },

  async fetchMetricTags(params: MetricTagsRequest): Promise<MetricTagsResponse> {
    const queryParams = new URLSearchParams({
      startTime: String(params.startTime),
      endTime: String(params.endTime),
    });
    if (params.tagKey) {
      queryParams.set('tagKey', params.tagKey);
    }
    const encodedName = encodeURIComponent(params.metricName);
    const response = await api.get(`${BASE}/metrics/${encodedName}/tags?${queryParams.toString()}`);
    return decodeApiResponse(metricTagsResponseSchema, response, {
      context: `metric tags (${params.metricName})`,
      expectedType: 'object',
      message: 'Invalid metric tags response',
    });
  },

  async query(body: MetricExplorerQueryRequest): Promise<MetricsExplorerResponse> {
    const response = await api.post(`${BASE}/metrics/explorer/query`, body);
    return decodeApiResponse(metricsExplorerResponseSchema, response, {
      context: 'metrics explorer query',
      expectedType: 'object',
      message: 'Invalid metrics explorer response',
    });
  },
};
