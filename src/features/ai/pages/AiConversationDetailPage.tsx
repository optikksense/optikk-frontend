/**
 * Conversation Detail — Turn-by-turn view of a single conversation.
 */
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { aiService } from "../api/aiService";
import styles from "./AiOverviewPage.module.css";

export default function AiConversationDetailPage() {
  const { conversationId } = useParams({ strict: false }) as { conversationId: string };
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const navigate = useNavigate();

  const summary = useQuery({
    queryKey: ["ai-conv-summary", teamId, conversationId, refreshKey],
    queryFn: () => aiService.getConversationSummary(conversationId),
    enabled: !!conversationId,
  });

  const turns = useQuery({
    queryKey: ["ai-conv-turns", teamId, conversationId, refreshKey],
    queryFn: () => aiService.getConversationTurns(conversationId),
    enabled: !!conversationId,
  });

  const s = summary.data;

  return (
    <div className={styles.page}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate({ to: "/ai-conversations" as any })} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>
          ← Back to Conversations
        </button>
        <h2 style={{ color: "var(--text-primary, #e8eaf0)", fontSize: 16, fontWeight: 600, margin: 0 }}>
          Conversation: {conversationId}
        </h2>
      </div>

      {s && (
        <div className={styles.statGrid}>
          <StatCard label="Turns" value={s.turnCount} />
          <StatCard label="Total Tokens" value={formatNumber(s.totalTokens)} />
          <StatCard label="Total Time" value={`${s.totalMs.toFixed(0)}ms`} />
          <StatCard label="Models" value={s.models || "—"} />
          <StatCard label="Error Turns" value={s.errorTurns} />
        </div>
      )}

      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Turns ({turns.data?.length ?? 0})</h3>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Timestamp</th>
                <th>Model</th>
                <th>Duration</th>
                <th>In Tok</th>
                <th>Out Tok</th>
                <th>Finish</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {(turns.data ?? []).map((t, i) => (
                <tr key={t.spanId} className={styles.clickRow} onClick={() => navigate({ to: `/ai-explorer/${t.spanId}` as any })}>
                  <td>{i + 1}</td>
                  <td style={{ fontSize: 11 }}>{new Date(t.timestamp).toLocaleTimeString()}</td>
                  <td className={styles.mono}>{t.model}</td>
                  <td>{t.durationMs.toFixed(0)}ms</td>
                  <td>{formatNumber(t.inputTokens)}</td>
                  <td>{formatNumber(t.outputTokens)}</td>
                  <td>{t.finishReason || "—"}</td>
                  <td>{t.hasError ? <span className={styles.errorText}>Error</span> : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
