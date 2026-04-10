/**
 * AI Conversation Detail — Chat-style message replay.
 *
 * Fetches messages for each turn's spanId and displays
 * as a LangSmith-style chat thread with role-colored bubbles.
 */
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import { AiStatCard } from "../components/AiStatCard";
import { formatNumber, formatMs } from "../utils/formatters";
import styles from "./AiOverviewPage.module.css";

export default function AiConversationDetailPage() {
  const { conversationId = "" } = useParams({ strict: false });
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);

  const conversation = useQuery({
    queryKey: ["ai-conversation-detail", teamId, conversationId, startMs, endMs, refreshKey],
    queryFn: () => aiService.getConversationDetail(conversationId, startMs, endMs),
    enabled: !!conversationId,
  });

  const turns = conversation.data?.turns ?? [];
  const meta = conversation.data;

  if (conversation.isLoading) {
    return <div className={styles.page}><div className={styles.loading}>Loading conversation…</div></div>;
  }

  return (
    <div className={styles.page}>
      {/* Stats */}
      <div className={styles.statGrid}>
        <AiStatCard label="Conversation" value={conversationId.slice(0, 16) + "…"} />
        <AiStatCard label="Turns" value={meta?.turnCount ?? turns.length} />
        <AiStatCard label="Total Tokens" value={formatNumber(meta?.totalTokens ?? 0)} />
        <AiStatCard label="Model" value={meta?.model ?? "—"} />
        <AiStatCard label="Service" value={meta?.serviceName ?? "—"} />
      </div>

      {/* Turn-by-turn chat thread */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Conversation Thread</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {turns.map((turn, idx) => (
            <TurnMessages key={turn.spanId ?? idx} turn={turn} teamId={teamId} />
          ))}
          {turns.length === 0 && (
            <div className={styles.emptyState}>No turns found for this conversation.</div>
          )}
        </div>
      </div>

      {/* Turn metadata table */}
      {turns.length > 0 && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Turn Metadata</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr><th>#</th><th>Model</th><th>Duration</th><th>In Tok</th><th>Out Tok</th><th>Status</th></tr>
              </thead>
              <tbody>
                {turns.map((turn, idx) => (
                  <tr key={turn.spanId ?? idx}>
                    <td>{idx + 1}</td>
                    <td className={styles.mono}>{turn.model || "—"}</td>
                    <td>{formatMs(turn.durationMs)}</td>
                    <td>{formatNumber(turn.inputTokens)}</td>
                    <td>{formatNumber(turn.outputTokens)}</td>
                    <td>
                      {turn.hasError
                        ? <span className={styles.errorText}>Error</span>
                        : <span style={{ color: "#22c55e" }}>OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Fetch & display messages for a single turn.
 */
interface Turn {
  spanId: string;
  model?: string;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  hasError: boolean;
}

function TurnMessages({ turn, teamId }: { turn: Turn; teamId: number | null }) {
  const [expanded, setExpanded] = useState(true);

  const messages = useQuery({
    queryKey: ["ai-turn-messages", teamId, turn.spanId],
    queryFn: () => aiService.getSpanMessages(turn.spanId),
    enabled: !!turn.spanId && expanded,
    staleTime: 60000,
  });

  return (
    <div style={{ borderLeft: "2px solid var(--border-subtle, #2a2d3a)", paddingLeft: 12, marginBottom: 8 }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, transform: expanded ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.15s" }}>▶</span>
          <span className={styles.mono} style={{ fontSize: 11, color: "var(--text-primary, #e8eaf0)" }}>
            {turn.model || "turn"}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted, #8b8fa3)" }}>
            {formatMs(turn.durationMs)} · {formatNumber(turn.inputTokens + turn.outputTokens)} tokens
          </span>
        </div>
        {turn.hasError && <span className={styles.errorText} style={{ fontSize: 10 }}>Error</span>}
      </div>

      {expanded && (messages.data ?? []).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {(messages.data ?? []).map((msg, i) => {
            const roleColor =
              msg.role === "user" ? "#6366f1" :
              msg.role === "assistant" ? "#22c55e" :
              msg.role === "system" ? "#eab308" :
              "#8b8fa3";

            const bubbleClass =
              msg.role === "user" ? styles.chatUser :
              msg.role === "assistant" ? styles.chatAssistant :
              styles.chatSystem;

            return (
              <div key={i} className={`${styles.chatBubble} ${bubbleClass}`}>
                <div className={styles.chatRole} style={{ color: roleColor }}>{msg.role}</div>
                <div className={styles.chatContent}>{msg.content}</div>
              </div>
            );
          })}
        </div>
      )}

      {expanded && messages.isLoading && (
        <div style={{ fontSize: 11, color: "var(--text-muted, #8b8fa3)", marginTop: 6 }}>Loading messages…</div>
      )}
    </div>
  );
}
