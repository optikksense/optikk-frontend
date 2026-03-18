import { Alert } from 'antd';
import { MessageSquare } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';
import { PageHeader } from '@shared/components/ui';
import { useAppStore } from '@shared/store/appStore';
import { formatNumber, formatTimestamp } from '@shared/utils/formatters';
import { relativeTime } from '@shared/utils/time';

import { aiConversationQueries } from '../../api/queryOptions';
import type { Conversation } from '../../types';

import './AiConversationsPage.css';

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string): string {
  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export default function AiConversationsPage(): JSX.Element {
  const navigate = useNavigate();
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const { startMs, endMs } = useMemo(() => {
    const resolvedEndMs =
      timeRange.value === 'custom' && timeRange.endTime != null ? Number(timeRange.endTime) : Date.now();
    const resolvedStartMs =
      timeRange.value === 'custom' && timeRange.startTime != null
        ? Number(timeRange.startTime)
        : resolvedEndMs - (timeRange.minutes ?? 60) * 60 * 1000;
    return { startMs: resolvedStartMs, endMs: resolvedEndMs };
  }, [refreshKey, timeRange]);

  const conversationsQuery = useQuery(aiConversationQueries.list(selectedTeamId, startMs, endMs));
  const conversations = (conversationsQuery.data ?? []) as Conversation[];
  const isLoading = conversationsQuery.isLoading;
  const error = (conversationsQuery.error ?? null) as ApiErrorShape | null;

  return (
    <div className="ai-conversations-page">
      <PageHeader title="Conversations" icon={<MessageSquare size={24} />} />

      <div className="ai-conversations-table">
        <h3>
          <MessageSquare size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
          Conversations
          <span className="traces-count-badge" style={{ marginLeft: 8 }}>
            {formatNumber(conversations.length)}
          </span>
        </h3>

        <div className="ai-convo-row ai-convo-row-header">
          <span>Conversation ID</span>
          <span>Model</span>
          <span>Service</span>
          <span>Turns</span>
          <span>Tokens</span>
          <span>Last Activity</span>
        </div>

        {isLoading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        )}

        {!isLoading && error && (
          <div style={{ padding: 24 }}>
            <Alert
              type="error"
              showIcon
              message="Conversations could not be loaded"
              description={getErrorMessage(error, 'The backend request for conversations failed.')}
            />
          </div>
        )}

        {!isLoading && !error && conversations.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
            No conversations found. Ensure your instrumentation sets a conversation id attribute such as <code>ai.conversation.id</code> or <code>gen_ai.conversation.id</code>.
          </div>
        )}

        {!error && conversations.map((convo) => (
          <div
            key={convo.conversationId}
            className="ai-convo-row"
            onClick={() => navigate(`/ai-conversations/${encodeURIComponent(convo.conversationId)}`)}
          >
            <span className="ai-convo-id" title={convo.conversationId}>
              {convo.conversationId}
            </span>
            <span>{convo.model}</span>
            <span className="traces-service-tag">
              <span className="traces-service-tag-dot" />
              {convo.serviceName}
            </span>
            <span style={{ fontFamily: 'monospace' }}>{convo.turnCount}</span>
            <span style={{ fontFamily: 'monospace' }}>{formatNumber(convo.totalTokens)}</span>
            <span className="traces-timestamp" title={formatTimestamp(convo.lastTurn)}>
              {relativeTime(convo.lastTurn)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
