/**
 * Conversations List — Paginated conversation list with session tracking.
 */
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import styles from "./AiOverviewPage.module.css";

export default function AiConversationsPage() {
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const navigate = useNavigate();

  const queryKeyBase = [teamId, startMs, endMs, refreshKey];

  const conversations = useQuery({
    queryKey: ["ai-conversations", ...queryKeyBase],
    queryFn: () => aiService.getConversations(startMs, endMs),
  });

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Conversations ({conversations.data?.length ?? 0})</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Conversation ID</th>
                <th>Service</th>
                <th>Model</th>
                <th>Turns</th>
                <th>Total Tokens</th>
                <th>Errors</th>
                <th>First Turn</th>
                <th>Last Turn</th>
              </tr>
            </thead>
            <tbody>
              {(conversations.data ?? []).map((c) => (
                <tr key={c.conversationId} className={styles.clickRow} onClick={() => navigate({ to: `/ai-conversations/${encodeURIComponent(c.conversationId)}` as any })}>
                  <td className={styles.mono} style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{c.conversationId}</td>
                  <td>{c.serviceName}</td>
                  <td className={styles.mono}>{c.model}</td>
                  <td>{c.turnCount}</td>
                  <td>{formatNumber(c.totalTokens)}</td>
                  <td>{c.hasError ? <span className={styles.errorText}>Yes</span> : "—"}</td>
                  <td style={{ fontSize: 11 }}>{new Date(c.firstTurn).toLocaleString()}</td>
                  <td style={{ fontSize: 11 }}>{new Date(c.lastTurn).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {conversations.data?.length === 0 && <div className={styles.emptyState}>No conversations found. Conversations require gen_ai.conversation.id attribute.</div>}
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
