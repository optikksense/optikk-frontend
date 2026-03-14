import { z } from 'zod';
import { aiService } from '@shared/api/aiService';
import type { RequestTime } from '@shared/api/service-types';
import type { LLMRunFilters } from '../types';

const llmRunSchema = z.object({
  spanId: z.string(),
  traceId: z.string(),
  parentSpanId: z.string().optional().default(''),
  serviceName: z.string(),
  operationName: z.string(),
  model: z.string(),
  provider: z.string().optional().default(''),
  operationType: z.string().optional().default(''),
  startTime: z.string(),
  durationMs: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
  hasError: z.boolean(),
  statusMessage: z.string().optional().default(''),
  finishReason: z.string().optional().default(''),
  inputPreview: z.string().optional().default(''),
  outputPreview: z.string().optional().default(''),
  spanKind: z.string(),
});

const runsResponseSchema = z.array(llmRunSchema);

const summarySchema = z.object({
  totalRuns: z.number(),
  errorRuns: z.number(),
  errorRate: z.number(),
  avgLatencyMs: z.number(),
  p95LatencyMs: z.number(),
  totalTokens: z.number(),
  uniqueModels: z.number(),
});

const modelSchema = z.object({
  model: z.string(),
  provider: z.string().optional().default(''),
});

const operationSchema = z.object({
  operationType: z.string(),
});

function filtersToParams(filters: LLMRunFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (filters.models?.length) params.models = filters.models.join(',');
  if (filters.providers?.length) params.providers = filters.providers.join(',');
  if (filters.operations?.length) params.operations = filters.operations.join(',');
  if (filters.services?.length) params.services = filters.services.join(',');
  if (filters.status) params.status = filters.status;
  if (filters.minDurationMs) params.minDurationMs = filters.minDurationMs;
  if (filters.maxDurationMs) params.maxDurationMs = filters.maxDurationMs;
  if (filters.minTokens) params.minTokens = filters.minTokens;
  if (filters.maxTokens) params.maxTokens = filters.maxTokens;
  if (filters.traceId) params.traceId = filters.traceId;
  if (filters.limit) params.limit = filters.limit;
  if (filters.cursorTimestamp) params.cursorTimestamp = filters.cursorTimestamp;
  if (filters.cursorSpanId) params.cursorSpanId = filters.cursorSpanId;
  return params;
}

export const aiRunsApi = {
  async getRuns(
    teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    filters: LLMRunFilters = {},
  ) {
    const response = await aiService.getRuns(teamId, startTime, endTime, filtersToParams(filters));
    return runsResponseSchema.parse(response);
  },

  async getSummary(
    teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    filters: LLMRunFilters = {},
  ) {
    const response = await aiService.getRunsSummary(teamId, startTime, endTime, filtersToParams(filters));
    return summarySchema.parse(response);
  },

  async getModels(teamId: number | null, startTime: RequestTime, endTime: RequestTime) {
    const response = await aiService.getRunsModels(teamId, startTime, endTime);
    return z.array(modelSchema).parse(response);
  },

  async getOperations(teamId: number | null, startTime: RequestTime, endTime: RequestTime) {
    const response = await aiService.getRunsOperations(teamId, startTime, endTime);
    return z.array(operationSchema).parse(response);
  },
};
