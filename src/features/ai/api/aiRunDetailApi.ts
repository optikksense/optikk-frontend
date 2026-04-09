import { z } from "zod";

import { aiTransport } from "./aiTransport";
import type { LLMMessage, LLMRunContext, LLMRunDetail } from "../types";

const runDetailSchema = z.object({
  spanId: z.string(),
  traceId: z.string(),
  parentSpanId: z.string().optional().default(""),
  serviceName: z.string(),
  operationName: z.string(),
  model: z.string(),
  provider: z.string().optional().default(""),
  operationType: z.string().optional().default(""),
  startTime: z.string(),
  durationMs: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
  hasError: z.boolean(),
  statusMessage: z.string().optional().default(""),
  finishReason: z.string().optional().default(""),
  spanKind: z.string(),
  attributes: z.record(z.string(), z.string()).optional(),
});

const messageSchema = z.object({
  role: z.string(),
  content: z.string(),
  type: z.enum(["prompt", "completion"]),
});

const chainSpanSchema = z.object({
  spanId: z.string(),
  parentSpanId: z.string().optional().default(""),
  serviceName: z.string(),
  operationName: z.string(),
  startTime: z.string(),
  durationMs: z.number(),
  hasError: z.boolean(),
  spanKind: z.string(),
  role: z.string(),
  model: z.string().optional().default(""),
});

const contextSchema = z.object({
  ancestors: z.array(chainSpanSchema),
  current: chainSpanSchema,
  children: z.array(chainSpanSchema),
});

export const aiRunDetailApi = {
  async getDetail(teamId: number | null, spanId: string): Promise<LLMRunDetail> {
    void teamId;
    const response = await aiTransport.getRunDetail(spanId);
    return runDetailSchema.parse(response) as LLMRunDetail;
  },

  async getMessages(teamId: number | null, spanId: string): Promise<LLMMessage[]> {
    void teamId;
    const response = await aiTransport.getRunMessages(spanId);
    return z.array(messageSchema).parse(response) as LLMMessage[];
  },

  async getContext(teamId: number | null, spanId: string, traceId: string): Promise<LLMRunContext> {
    void teamId;
    const response = await aiTransport.getRunContext(spanId, traceId);
    return contextSchema.parse(response) as LLMRunContext;
  },
};
