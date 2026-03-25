import { z } from 'zod';

import { API_CONFIG } from '@config/apiConfig';
import { traceRecordSchema } from '@entities/trace/model';
import api from '@/shared/api/api/client';
import { decodeApiResponse } from '@/shared/api/utils/validate';

import { normalizeTrace } from '../utils/tracesUtils';
import type { TracesBackendParams } from './tracesApi';
import type {
  TraceExplorerCorrelations,
  TraceExplorerFacets,
} from '../types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const facetSchema = z.object({
  value: z.string(),
  count: z.number(),
}).strict();

const traceExplorerFacetsSchema = z.object({
  service_name: z.array(facetSchema).default([]),
  status: z.array(facetSchema).default([]),
  operation_name: z.array(facetSchema).default([]),
}).strict();

const traceExplorerCorrelationsSchema = z.object({
  topServices: z.array(facetSchema).optional(),
  topOperations: z.array(facetSchema).optional(),
}).strict();

const trendBucketSchema = z.object({
  time_bucket: z.string(),
  total_traces: z.number(),
  error_traces: z.number(),
  p95_duration: z.number(),
}).strict();

const tracesExplorerSchema = z.object({
  results: z.array(traceRecordSchema).default([]),
  summary: z.object({
    total_traces: z.number().default(0),
    error_traces: z.number().default(0),
    avg_duration: z.number().default(0),
    p50_duration: z.number().default(0),
    p95_duration: z.number().default(0),
    p99_duration: z.number().default(0),
  }).strict(),
  facets: traceExplorerFacetsSchema,
  trend: z.array(trendBucketSchema).default([]),
  pageInfo: z.object({
    total: z.number().default(0),
    hasMore: z.boolean().default(false),
    nextCursor: z.string().optional(),
    offset: z.number().default(0),
    limit: z.number().default(50),
  }).strict(),
  correlations: traceExplorerCorrelationsSchema.optional(),
}).strict();

export type TracesExplorerResponse = z.infer<typeof tracesExplorerSchema>;

export const tracesExplorerApi = {
  async query(body: {
    startTime: number;
    endTime: number;
    limit: number;
    offset: number;
    step: string;
    params: TracesBackendParams & { search?: string; mode?: string };
  }): Promise<TracesExplorerResponse> {
    const response = await api.post(`${BASE}/traces/explorer/query`, body);
    const parsed = decodeApiResponse(tracesExplorerSchema, response, {
      context: 'traces explorer',
      expectedType: 'object',
      message: 'Invalid traces explorer response',
    });

    return {
      ...parsed,
      results: parsed.results.map((trace) => normalizeTrace(trace)),
      facets: parsed.facets as TraceExplorerFacets,
      correlations: parsed.correlations as TraceExplorerCorrelations | undefined,
    };
  },
};
