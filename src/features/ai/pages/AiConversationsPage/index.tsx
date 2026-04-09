import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { useMemo } from "react";

import { resolveTimeRangeBounds } from "@/types";
import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import type { ApiErrorShape } from "@shared/api/api/interceptors/errorInterceptor";
import { Badge } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatNumber, formatRelativeTime, formatTimestamp } from "@shared/utils/formatters";

import { aiConversationQueries } from "../../api/queryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import type { Conversation } from "../../types";

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string): string {
  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export default function AiConversationsPage() {
  const navigate = useNavigate();
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();

  const { startMs, endMs } = useMemo(() => {
    void refreshKey;
    const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
    return { startMs: startTime, endMs: endTime };
  }, [refreshKey, timeRange]);

  const conversationsQuery = useQuery(aiConversationQueries.list(selectedTeamId, startMs, endMs));
  const conversations = (conversationsQuery.data ?? []) as Conversation[];
  const isLoading = conversationsQuery.isLoading;
  const error = (conversationsQuery.error ?? null) as ApiErrorShape | null;

  return (
    <AiWorkspaceLayout
      title="Conversations"
      icon={<MessageSquare size={24} />}
      subtitle="Track multi-turn AI threads, model usage, and recent activity from the same workspace shell as the rest of the AI platform."
      actions={<Badge variant="info">{formatNumber(conversations.length)} conversations</Badge>}
    >
      <PageSurface padding="sm" className="overflow-hidden p-0">
        <h3 className="m-0 border-[var(--border-color)] border-b px-[18px] py-[14px] font-semibold text-[13px] text-[var(--text-primary)]">
          <MessageSquare size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
          Conversations
          <span className="traces-count-badge" style={{ marginLeft: 8 }}>
            {formatNumber(conversations.length)}
          </span>
        </h3>

        <div className="grid cursor-default grid-cols-[1fr_140px_160px_80px_100px_140px] items-center gap-2 border-[var(--border-color)] border-b px-[18px] py-[10px] font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-[0.5px]">
          <span>Conversation ID</span>
          <span>Model</span>
          <span>Service</span>
          <span>Turns</span>
          <span>Tokens</span>
          <span>Last Activity</span>
        </div>

        {isLoading && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            Loading...
          </div>
        )}

        {!isLoading && error && (
          <div style={{ padding: 24 }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                background: "var(--error-bg, rgba(240,68,56,0.08))",
                border: "1px solid var(--error-border, rgba(240,68,56,0.2))",
                color: "var(--error-text, #f04438)",
              }}
            >
              <strong>Conversations could not be loaded</strong>
              <div style={{ marginTop: 4, fontSize: 13 }}>
                {getErrorMessage(error, "The backend request for conversations failed.")}
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && conversations.length === 0 && (
          <div
            style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 12.5 }}
          >
            No conversations found. Ensure your instrumentation sets a conversation id attribute
            such as <code>ai.conversation.id</code> or <code>gen_ai.conversation.id</code>.
          </div>
        )}

        {!error &&
          conversations.map((convo) => (
            <div
              key={convo.conversationId}
              className="grid cursor-pointer grid-cols-[1fr_140px_160px_80px_100px_140px] items-center gap-2 border-[var(--border-color)] border-b px-[18px] py-[10px] text-[12px] transition-colors last:border-b-0 hover:bg-white/[0.02]"
              onClick={() =>
                navigate({ to: `/ai-conversations/${encodeURIComponent(convo.conversationId)}` })
              }
            >
              <span
                className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[var(--text-link)]"
                title={convo.conversationId}
              >
                {convo.conversationId}
              </span>
              <span>{convo.model}</span>
              <span className="traces-service-tag">
                <span className="traces-service-tag-dot" />
                {convo.serviceName}
              </span>
              <span className="font-mono">{convo.turnCount}</span>
              <span className="font-mono">{formatNumber(convo.totalTokens)}</span>
              <span className="traces-timestamp" title={formatTimestamp(convo.lastTurn)}>
                {formatRelativeTime(convo.lastTurn)}
              </span>
            </div>
          ))}
      </PageSurface>
    </AiWorkspaceLayout>
  );
}
