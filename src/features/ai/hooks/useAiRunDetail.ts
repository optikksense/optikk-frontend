import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@shared/store/appStore';
import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';
import { aiRunDetailQueries } from '../api/queryOptions';
import type { LLMMessage, LLMRunContext, LLMRunDetail } from '../types';

export function useAiRunDetail(spanId: string) {
  const { selectedTeamId } = useAppStore();

  const detailQuery = useQuery(aiRunDetailQueries.detail(selectedTeamId, spanId));
  const detail = detailQuery.data as LLMRunDetail | undefined;
  const isDetailLoading = detailQuery.isLoading;
  const detailError = (detailQuery.error ?? null) as ApiErrorShape | null;

  const messagesQuery = useQuery(aiRunDetailQueries.messages(selectedTeamId, spanId));
  const messages = (messagesQuery.data ?? []) as LLMMessage[];
  const isMessagesLoading = messagesQuery.isLoading;
  const messagesError = (messagesQuery.error ?? null) as ApiErrorShape | null;

  const traceId = detail?.traceId ?? '';

  const contextQuery = useQuery(aiRunDetailQueries.context(selectedTeamId, spanId, traceId));
  const context = contextQuery.data as LLMRunContext | undefined;
  const isContextLoading = contextQuery.isLoading;
  const contextError = (contextQuery.error ?? null) as ApiErrorShape | null;

  return {
    detail,
    messages,
    context,
    isLoading: isDetailLoading,
    isMessagesLoading,
    isContextLoading,
    detailError,
    messagesError,
    contextError,
  };
}
