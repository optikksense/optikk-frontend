import { z } from 'zod';
import { aiService } from '@shared/api/aiService';
import type { LLMTraceSpan, LLMTraceSummary } from '../types';

const traceSpanSchema = z.object({
  spanId: z.string(),
  parentSpanId: z.string().optional().default(''),
  serviceName: z.string(),
  operationName: z.string(),
  startTime: z.string(),
  durationMs: z.number(),
  hasError: z.boolean(),
  spanKind: z.string(),
  role: z.string(),
  model: z.string().optional().default(''),
  inputTokens: z.number().optional().default(0),
  outputTokens: z.number().optional().default(0),
});

const traceSummarySchema = z.object({
  totalSpans: z.number(),
  llmCalls: z.number(),
  toolCalls: z.number(),
  totalTokens: z.number(),
  modelsUsed: z.array(z.string()),
  totalMs: z.number(),
  llmMs: z.number(),
  llmTimePct: z.number(),
  hasErrors: z.boolean(),
  serviceCount: z.number(),
});

export const aiTracesApi = {
  async getTrace(teamId: number | null, traceId: string): Promise<LLMTraceSpan[]> {
    const response = await aiService.getLLMTrace(teamId, traceId);
    return z.array(traceSpanSchema).parse(response) as LLMTraceSpan[];
  },

  async getSummary(teamId: number | null, traceId: string): Promise<LLMTraceSummary> {
    const response = await aiService.getLLMTraceSummary(teamId, traceId);
    return traceSummarySchema.parse(response) as LLMTraceSummary;
  },
};
