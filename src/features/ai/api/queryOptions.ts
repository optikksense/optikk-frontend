import type { RequestTime } from "@shared/api/service-types";
import { queryOptions } from "@tanstack/react-query";
import type { LLMRunFilters } from "../types";
import { aiConversationsApi } from "./aiConversationsApi";
import { aiRunDetailApi } from "./aiRunDetailApi";
import { aiRunsApi } from "./aiRunsApi";
import { aiTracesApi } from "./aiTracesApi";

export const aiRunsKeys = {
  all: ["ai-runs"] as const,
  lists: () => [...aiRunsKeys.all, "list"] as const,
  list: (
    teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    filters: LLMRunFilters,
    refreshKey?: number
  ) => [...aiRunsKeys.lists(), { teamId, startTime, endTime, refreshKey, ...filters }] as const,
  summaries: () => [...aiRunsKeys.all, "summary"] as const,
  summary: (
    teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    filters: LLMRunFilters,
    refreshKey?: number
  ) => [...aiRunsKeys.summaries(), { teamId, startTime, endTime, refreshKey, ...filters }] as const,
  models: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    [...aiRunsKeys.all, "models", { teamId, startTime, endTime }] as const,
  operations: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    [...aiRunsKeys.all, "operations", { teamId, startTime, endTime }] as const,
};

export const aiRunsQueries = {
  list: (
    teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    filters: LLMRunFilters,
    refreshKey?: number
  ) =>
    queryOptions({
      queryKey: aiRunsKeys.list(teamId, startTime, endTime, filters, refreshKey),
      queryFn: () => aiRunsApi.getRuns(teamId, startTime, endTime, filters),
      enabled: !!teamId,
      staleTime: 30000,
      retry: false,
    }),

  summary: (
    teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    filters: LLMRunFilters,
    refreshKey?: number
  ) =>
    queryOptions({
      queryKey: aiRunsKeys.summary(teamId, startTime, endTime, filters, refreshKey),
      queryFn: () => aiRunsApi.getSummary(teamId, startTime, endTime, filters),
      enabled: !!teamId,
      staleTime: 30000,
      retry: false,
    }),

  models: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    queryOptions({
      queryKey: aiRunsKeys.models(teamId, startTime, endTime),
      queryFn: () => aiRunsApi.getModels(teamId, startTime, endTime),
      enabled: !!teamId,
      staleTime: 60000,
      retry: false,
    }),

  operations: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    queryOptions({
      queryKey: aiRunsKeys.operations(teamId, startTime, endTime),
      queryFn: () => aiRunsApi.getOperations(teamId, startTime, endTime),
      enabled: !!teamId,
      staleTime: 60000,
      retry: false,
    }),
};

export const aiRunDetailKeys = {
  all: ["ai-run-detail"] as const,
  detail: (teamId: number | null, spanId: string) =>
    [...aiRunDetailKeys.all, "detail", { teamId, spanId }] as const,
  messages: (teamId: number | null, spanId: string) =>
    [...aiRunDetailKeys.all, "messages", { teamId, spanId }] as const,
  context: (teamId: number | null, spanId: string, traceId: string) =>
    [...aiRunDetailKeys.all, "context", { teamId, spanId, traceId }] as const,
};

export const aiRunDetailQueries = {
  detail: (teamId: number | null, spanId: string) =>
    queryOptions({
      queryKey: aiRunDetailKeys.detail(teamId, spanId),
      queryFn: () => aiRunDetailApi.getDetail(teamId, spanId),
      enabled: !!teamId && !!spanId,
      staleTime: 60000,
      retry: false,
    }),

  messages: (teamId: number | null, spanId: string) =>
    queryOptions({
      queryKey: aiRunDetailKeys.messages(teamId, spanId),
      queryFn: () => aiRunDetailApi.getMessages(teamId, spanId),
      enabled: !!teamId && !!spanId,
      staleTime: 60000,
      retry: false,
    }),

  context: (teamId: number | null, spanId: string, traceId: string) =>
    queryOptions({
      queryKey: aiRunDetailKeys.context(teamId, spanId, traceId),
      queryFn: () => aiRunDetailApi.getContext(teamId, spanId, traceId),
      enabled: !!teamId && !!spanId && !!traceId,
      staleTime: 60000,
      retry: false,
    }),
};

export const aiTraceKeys = {
  all: ["ai-traces"] as const,
  trace: (teamId: number | null, traceId: string) =>
    [...aiTraceKeys.all, "trace", { teamId, traceId }] as const,
  summary: (teamId: number | null, traceId: string) =>
    [...aiTraceKeys.all, "summary", { teamId, traceId }] as const,
};

export const aiTraceQueries = {
  trace: (teamId: number | null, traceId: string) =>
    queryOptions({
      queryKey: aiTraceKeys.trace(teamId, traceId),
      queryFn: () => aiTracesApi.getTrace(teamId, traceId),
      enabled: !!teamId && !!traceId,
      staleTime: 60000,
      retry: false,
    }),

  summary: (teamId: number | null, traceId: string) =>
    queryOptions({
      queryKey: aiTraceKeys.summary(teamId, traceId),
      queryFn: () => aiTracesApi.getSummary(teamId, traceId),
      enabled: !!teamId && !!traceId,
      staleTime: 60000,
      retry: false,
    }),
};

export const aiConversationKeys = {
  all: ["ai-conversations"] as const,
  list: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    [...aiConversationKeys.all, "list", { teamId, startTime, endTime }] as const,
  detail: (
    teamId: number | null,
    conversationId: string,
    startTime: RequestTime,
    endTime: RequestTime
  ) =>
    [...aiConversationKeys.all, "detail", { teamId, conversationId, startTime, endTime }] as const,
};

export const aiConversationQueries = {
  list: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    queryOptions({
      queryKey: aiConversationKeys.list(teamId, startTime, endTime),
      queryFn: () => aiConversationsApi.list(teamId, startTime, endTime),
      enabled: !!teamId,
      staleTime: 30000,
      retry: false,
    }),

  detail: (
    teamId: number | null,
    conversationId: string,
    startTime: RequestTime,
    endTime: RequestTime
  ) =>
    queryOptions({
      queryKey: aiConversationKeys.detail(teamId, conversationId, startTime, endTime),
      queryFn: () => aiConversationsApi.get(teamId, conversationId, startTime, endTime),
      enabled: !!teamId && !!conversationId,
      staleTime: 30000,
      retry: false,
    }),
};
