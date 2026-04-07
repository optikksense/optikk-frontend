import { MessageSquare } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '@shared/components/ui';
import { useTeamId, useTimeRange, useRefreshKey } from '@app/store/appStore';
import { resolveTimeRangeBounds } from '@/types';
import { formatDuration, formatNumber, formatTimestamp } from '@shared/utils/formatters';
import { cn } from '@/lib/utils';

import { aiConversationQueries } from '../../api/queryOptions';
import type { ConversationTurn } from '../../types';

export default function AiConversationDetailPage() {
  const { conversationId = '' } = useParams({ strict: false });
  const navigate = useNavigate();
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();

  const { startMs, endMs } = useMemo(() => {
    void refreshKey;
    const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
    return { startMs: startTime, endMs: endTime };
  }, [refreshKey, timeRange]);

  const { data: turns = [], isLoading } = useQuery(
    aiConversationQueries.detail(selectedTeamId, decodeURIComponent(conversationId), startMs, endMs)
  );

  return (
    <div className="max-w-[900px] mx-auto px-6 pb-6">
      <PageHeader
        title="Conversation"
        icon={<MessageSquare size={24} />}
        breadcrumbs={[
          { label: 'Conversations', path: '/ai-conversations' },
          {
            label:
              decodeURIComponent(conversationId).slice(0, 20) +
              (conversationId.length > 20 ? '…' : ''),
          },
        ]}
      />

      <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[10px] overflow-hidden">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)] px-[18px] py-[14px] m-0 border-b border-[var(--border-color)]">
          <MessageSquare size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Turns
          <span className="traces-count-badge" style={{ marginLeft: 8 }}>
            {formatNumber(turns.length)}
          </span>
        </h3>

        {isLoading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading...
          </div>
        )}

        {!isLoading && turns.length === 0 && (
          <div
            style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12.5 }}
          >
            No turns found for this conversation.
          </div>
        )}

        {turns.map((turn: ConversationTurn, i: number) => (
          <div
            key={turn.spanId}
            className="flex gap-3 px-[18px] py-[14px] border-b border-[var(--border-color)] cursor-pointer transition-colors last:border-b-0 hover:bg-white/[0.02]"
            onClick={() => navigate({ to: `/ai-runs/${turn.spanId}` })}
          >
            <div className="w-7 h-7 rounded-full bg-[var(--glass-bg)] border border-[var(--border-color)] flex items-center justify-center text-[11px] font-semibold text-[var(--text-muted)] shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold text-[var(--text-primary)]">
                  {turn.model}
                </span>
                {turn.hasError && (
                  <span
                    className={cn(
                      'inline-flex py-0.5 px-2 rounded text-[10px] font-semibold',
                      'bg-[rgba(240,68,56,0.12)] text-[#f04438]'
                    )}
                  >
                    Error
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-[11px] text-[var(--text-muted)]">
                <span className="font-mono">{formatDuration(turn.durationMs)}</span>
                <span className="font-mono">
                  {formatNumber(turn.inputTokens + turn.outputTokens)} tokens
                </span>
                <span className="font-mono">{formatTimestamp(turn.startTime)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
