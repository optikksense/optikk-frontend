import { MessageSquare } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '@shared/components/ui';
import { useAppStore } from '@shared/store/appStore';
import { formatDuration, formatNumber, formatTimestamp } from '@shared/utils/formatters';

import { aiConversationQueries } from '../../api/queryOptions';
import type { ConversationTurn } from '../../types';

import './AiConversationDetailPage.css';

export default function AiConversationDetailPage(): JSX.Element {
  const { conversationId = '' } = useParams<{ conversationId: string }>();
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

  const { data: turns = [], isLoading } = useQuery(
    aiConversationQueries.detail(selectedTeamId, decodeURIComponent(conversationId), startMs, endMs),
  );

  return (
    <div className="ai-conversation-detail-page">
      <PageHeader
        title="Conversation"
        icon={<MessageSquare size={24} />}
        breadcrumbs={[
          { label: 'Conversations', path: '/ai-conversations' },
          { label: decodeURIComponent(conversationId).slice(0, 20) + (conversationId.length > 20 ? '…' : '') },
        ]}
      />

      <div className="ai-conversation-timeline">
        <h3>
          <MessageSquare size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Turns
          <span className="traces-count-badge" style={{ marginLeft: 8 }}>
            {formatNumber(turns.length)}
          </span>
        </h3>

        {isLoading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        )}

        {!isLoading && turns.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}>
            No turns found for this conversation.
          </div>
        )}

        {turns.map((turn: ConversationTurn, i: number) => (
          <div
            key={turn.spanId}
            className="ai-convo-turn"
            onClick={() => navigate(`/ai-runs/${turn.spanId}`)}
          >
            <div className="ai-convo-turn-number">{i + 1}</div>
            <div className="ai-convo-turn-content">
              <div className="ai-convo-turn-header">
                <span className="ai-convo-turn-model">{turn.model}</span>
                {turn.hasError && (
                  <span className="ai-runs-status-badge error" style={{ fontSize: 10, padding: '1px 6px' }}>Error</span>
                )}
              </div>
              <div className="ai-convo-turn-meta">
                <span>{formatDuration(turn.durationMs)}</span>
                <span>{formatNumber(turn.inputTokens + turn.outputTokens)} tokens</span>
                <span>{formatTimestamp(turn.startTime)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
