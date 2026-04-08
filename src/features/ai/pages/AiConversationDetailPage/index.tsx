import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { resolveTimeRangeBounds } from "@/types";
import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { PageHeader } from "@shared/components/ui";
import { formatDuration, formatNumber, formatTimestamp } from "@shared/utils/formatters";

import { aiConversationQueries } from "../../api/queryOptions";
import type { ConversationTurn } from "../../types";

export default function AiConversationDetailPage() {
  const { conversationId = "" } = useParams({ strict: false });
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
    <div className="mx-auto max-w-[900px] px-6 pb-6">
      <PageHeader
        title="Conversation"
        icon={<MessageSquare size={24} />}
        breadcrumbs={[
          { label: "Conversations", path: "/ai-conversations" },
          {
            label:
              decodeURIComponent(conversationId).slice(0, 20) +
              (conversationId.length > 20 ? "…" : ""),
          },
        ]}
      />

      <div className="overflow-hidden rounded-[10px] border border-[var(--border-color)] bg-[var(--glass-bg)]">
        <h3 className="m-0 border-[var(--border-color)] border-b px-[18px] py-[14px] font-semibold text-[13px] text-[var(--text-primary)]">
          <MessageSquare size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Turns
          <span className="traces-count-badge" style={{ marginLeft: 8 }}>
            {formatNumber(turns.length)}
          </span>
        </h3>

        {isLoading && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            Loading...
          </div>
        )}

        {!isLoading && turns.length === 0 && (
          <div
            style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 12.5 }}
          >
            No turns found for this conversation.
          </div>
        )}

        {turns.map((turn: ConversationTurn, i: number) => (
          <div
            key={turn.spanId}
            className="flex cursor-pointer gap-3 border-[var(--border-color)] border-b px-[18px] py-[14px] transition-colors last:border-b-0 hover:bg-white/[0.02]"
            onClick={() => navigate({ to: `/ai-runs/${turn.spanId}` })}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--glass-bg)] font-semibold text-[11px] text-[var(--text-muted)]">
              {i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-semibold text-[12px] text-[var(--text-primary)]">
                  {turn.model}
                </span>
                {turn.hasError && (
                  <span
                    className={cn(
                      "inline-flex rounded px-2 py-0.5 font-semibold text-[10px]",
                      "bg-[rgba(240,68,56,0.12)] text-[#f04438]"
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
