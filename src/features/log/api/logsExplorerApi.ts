import { z } from 'zod';

import { API_CONFIG } from '@config/apiConfig';
import { logEntrySchema, type LogEntry } from '@entities/log/model';
import api from '@/shared/api/api/client';
import { decodeApiResponse } from '@/shared/api/utils/validate';

import { logsAggregateSchema } from './logsApi';
const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const facetSchema = z
  .object({
    value: z.string(),
    count: z.number(),
  })
  .strict();

const logsExplorerFacetsSchema = z
  .object({
    level: z.array(facetSchema).default([]),
    service_name: z.array(facetSchema).default([]),
    host: z.array(facetSchema).default([]),
    pod: z.array(facetSchema).default([]),
    container: z.array(facetSchema).default([]),
    environment: z.array(facetSchema).default([]),
    scope_name: z.array(facetSchema).default([]),
  })
  .strict();

const logsExplorerCorrelationsSchema = z
  .object({
    serviceErrorRate: logsAggregateSchema.optional(),
  })
  .strict();

const logsExplorerSchema = z
  .object({
    results: z.array(logEntrySchema).default([]),
    summary: z
      .object({
        total_logs: z.number().default(0),
        error_logs: z.number().default(0),
        warn_logs: z.number().default(0),
        service_count: z.number().default(0),
      })
      .strict(),
    facets: logsExplorerFacetsSchema,
    trend: z
      .object({
        step: z.string().default('5m'),
        buckets: z
          .array(
            z
              .object({
                time_bucket: z.string(),
                total: z.number().default(0),
                errors: z.number().default(0),
                warnings: z.number().default(0),
                infos: z.number().default(0),
                debugs: z.number().default(0),
                fatals: z.number().default(0),
              })
              .strict()
          )
          .default([]),
      })
      .strict(),
    pageInfo: z
      .object({
        total: z.number().default(0),
        hasMore: z.boolean().default(false),
        nextCursor: z.string().optional(),
        offset: z.number().default(0),
        limit: z.number().default(50),
      })
      .strict(),
    correlations: logsExplorerCorrelationsSchema.optional(),
  })
  .strict();

export type LogsExplorerResponse = z.infer<typeof logsExplorerSchema>;

function normalizeLog(raw: z.infer<typeof logEntrySchema>): LogEntry {
  return {
    ...raw,
    level: raw.severity_text ?? raw.level ?? '',
    message: raw.body ?? raw.message ?? '',
    service: raw.service_name ?? raw.service ?? '',
    service_name: raw.service_name ?? raw.service ?? '',
    trace_id: raw.trace_id ?? '',
    span_id: raw.span_id ?? '',
  };
}

export const logsExplorerApi = {
  async query(body: {
    startTime: number;
    endTime: number;
    limit: number;
    offset: number;
    step: string;
    query: string;
    cursor?: string;
    direction?: string;
  }): Promise<LogsExplorerResponse> {
    const response = await api.post(`${BASE}/logs/explorer/query`, body);
    const parsed = decodeApiResponse(logsExplorerSchema, response, {
      context: 'logs explorer',
      expectedType: 'object',
      message: 'Invalid logs explorer response',
    });
    return {
      ...parsed,
      results: parsed.results.map(normalizeLog),
    };
  },
};
