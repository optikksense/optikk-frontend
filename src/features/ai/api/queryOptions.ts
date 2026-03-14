import { queryOptions } from '@tanstack/react-query';
import { aiRunsApi } from './aiRunsApi';
import { aiRunDetailApi } from './aiRunDetailApi';
import type { RequestTime } from '@shared/api/service-types';
import type { LLMRunFilters } from '../types';

export const aiRunsKeys = {
  all: ['ai-runs'] as const,
  lists: () => [...aiRunsKeys.all, 'list'] as const,
  list: (teamId: number | null, startTime: RequestTime, endTime: RequestTime, filters: LLMRunFilters) =>
    [...aiRunsKeys.lists(), { teamId, startTime, endTime, ...filters }] as const,
  summaries: () => [...aiRunsKeys.all, 'summary'] as const,
  summary: (teamId: number | null, startTime: RequestTime, endTime: RequestTime, filters: LLMRunFilters) =>
    [...aiRunsKeys.summaries(), { teamId, startTime, endTime, ...filters }] as const,
  models: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    [...aiRunsKeys.all, 'models', { teamId, startTime, endTime }] as const,
  operations: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    [...aiRunsKeys.all, 'operations', { teamId, startTime, endTime }] as const,
};

export const aiRunsQueries = {
  list: (teamId: number | null, startTime: RequestTime, endTime: RequestTime, filters: LLMRunFilters) =>
    queryOptions({
      queryKey: aiRunsKeys.list(teamId, startTime, endTime, filters),
      queryFn: () => aiRunsApi.getRuns(teamId, startTime, endTime, filters),
      enabled: !!teamId,
      staleTime: 30000,
    }),

  summary: (teamId: number | null, startTime: RequestTime, endTime: RequestTime, filters: LLMRunFilters) =>
    queryOptions({
      queryKey: aiRunsKeys.summary(teamId, startTime, endTime, filters),
      queryFn: () => aiRunsApi.getSummary(teamId, startTime, endTime, filters),
      enabled: !!teamId,
      staleTime: 30000,
    }),

  models: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    queryOptions({
      queryKey: aiRunsKeys.models(teamId, startTime, endTime),
      queryFn: () => aiRunsApi.getModels(teamId, startTime, endTime),
      enabled: !!teamId,
      staleTime: 60000,
    }),

  operations: (teamId: number | null, startTime: RequestTime, endTime: RequestTime) =>
    queryOptions({
      queryKey: aiRunsKeys.operations(teamId, startTime, endTime),
      queryFn: () => aiRunsApi.getOperations(teamId, startTime, endTime),
      enabled: !!teamId,
      staleTime: 60000,
    }),
};

export const aiRunDetailKeys = {
  all: ['ai-run-detail'] as const,
  detail: (teamId: number | null, spanId: string) =>
    [...aiRunDetailKeys.all, 'detail', { teamId, spanId }] as const,
  messages: (teamId: number | null, spanId: string) =>
    [...aiRunDetailKeys.all, 'messages', { teamId, spanId }] as const,
  context: (teamId: number | null, spanId: string, traceId: string) =>
    [...aiRunDetailKeys.all, 'context', { teamId, spanId, traceId }] as const,
};

export const aiRunDetailQueries = {
  detail: (teamId: number | null, spanId: string) =>
    queryOptions({
      queryKey: aiRunDetailKeys.detail(teamId, spanId),
      queryFn: () => aiRunDetailApi.getDetail(teamId, spanId),
      enabled: !!teamId && !!spanId,
      staleTime: 60000,
    }),

  messages: (teamId: number | null, spanId: string) =>
    queryOptions({
      queryKey: aiRunDetailKeys.messages(teamId, spanId),
      queryFn: () => aiRunDetailApi.getMessages(teamId, spanId),
      enabled: !!teamId && !!spanId,
      staleTime: 60000,
    }),

  context: (teamId: number | null, spanId: string, traceId: string) =>
    queryOptions({
      queryKey: aiRunDetailKeys.context(teamId, spanId, traceId),
      queryFn: () => aiRunDetailApi.getContext(teamId, spanId, traceId),
      enabled: !!teamId && !!spanId && !!traceId,
      staleTime: 60000,
    }),
};
