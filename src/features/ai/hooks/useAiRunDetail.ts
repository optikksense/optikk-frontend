import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@shared/store/appStore';
import { aiRunDetailQueries } from '../api/queryOptions';

export function useAiRunDetail(spanId: string) {
  const { selectedTeamId } = useAppStore();

  const { data: detail, isLoading: isDetailLoading } = useQuery(
    aiRunDetailQueries.detail(selectedTeamId, spanId),
  );

  const { data: messages = [], isLoading: isMessagesLoading } = useQuery(
    aiRunDetailQueries.messages(selectedTeamId, spanId),
  );

  const traceId = detail?.traceId ?? '';

  const { data: context, isLoading: isContextLoading } = useQuery(
    aiRunDetailQueries.context(selectedTeamId, spanId, traceId),
  );

  return {
    detail,
    messages,
    context,
    isLoading: isDetailLoading,
    isMessagesLoading,
    isContextLoading,
  };
}
