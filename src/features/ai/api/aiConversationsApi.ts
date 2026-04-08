import { aiService } from "@shared/api/aiService";
import type { RequestTime } from "@shared/api/service-types";
import { z } from "zod";
import type { Conversation, ConversationTurn } from "../types";

const conversationSchema = z.object({
  conversationId: z.string(),
  serviceName: z.string(),
  model: z.string(),
  turnCount: z.number(),
  totalTokens: z.number(),
  firstTurn: z.string(),
  lastTurn: z.string(),
  hasErrors: z.boolean(),
});

const turnSchema = z.object({
  spanId: z.string(),
  traceId: z.string(),
  model: z.string(),
  operationType: z.string().optional().default(""),
  startTime: z.string(),
  durationMs: z.number(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  hasError: z.boolean(),
  inputPreview: z.string().optional().default(""),
  outputPreview: z.string().optional().default(""),
});

export const aiConversationsApi = {
  async list(
    teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    limit?: number
  ): Promise<Conversation[]> {
    const response = await aiService.getConversations(teamId, startTime, endTime, limit);
    return z.array(conversationSchema).parse(response) as Conversation[];
  },

  async get(
    teamId: number | null,
    conversationId: string,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<ConversationTurn[]> {
    const response = await aiService.getConversation(teamId, conversationId, startTime, endTime);
    return z.array(turnSchema).parse(response) as ConversationTurn[];
  },
};
