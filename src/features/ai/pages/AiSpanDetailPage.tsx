/**
 * LLM Span Detail — Full detail view for a single AI span.
 */
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import styles from "./AiOverviewPage.module.css";

export default function AiSpanDetailPage() {
  const { spanId } = useParams({ strict: false }) as { spanId: string };
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const navigate = useNavigate();

  const detail = useQuery({
    queryKey: ["ai-span-detail", teamId, spanId],
    queryFn: () => aiService.getSpanDetail(spanId),
    enabled: !!spanId,
  });

  const messages = useQuery({
    queryKey: ["ai-span-messages", teamId, spanId],
    queryFn: () => aiService.getMessages(spanId),
    enabled: !!spanId,
  });

  const traceCtx = useQuery({
    queryKey: ["ai-span-trace-ctx", teamId, spanId],
    queryFn: () => aiService.getTraceContext(spanId),
    enabled: !!spanId,
  });

  const tokenBreakdown = useQuery({
    queryKey: ["ai-span-tokens", teamId, spanId, startMs, endMs, refreshKey],
    queryFn: () => aiService.getTokenBreakdown(spanId, startMs, endMs, detail.data?.model),
    enabled: !!spanId && !!detail.data?.model,
  });

  const d = detail.data;

  if (!d) return <div className={styles.loading}>Loading span detail...</div>;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate({ to: "/ai-explorer" as any })} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>
          ← Back to Explorer
        </button>
        <h2 style={{ color: "var(--text-primary, #e8eaf0)", fontSize: 16, fontWeight: 600, margin: 0 }}>
          {d.model} — {d.operationType || d.operationName}
        </h2>
        {d.hasError && <span className={`${styles.badge} ${styles.critical}`}>ERROR</span>}
      </div>

      {/* Stat Cards */}
      <div className={styles.statGrid}>
        <StatCard label="Duration" value={`${d.durationMs.toFixed(0)}ms`} />
        <StatCard label="Input Tokens" value={d.inputTokens} />
        <StatCard label="Output Tokens" value={d.outputTokens} />
        <StatCard label="Tokens/sec" value={d.tokensPerSec.toFixed(1)} />
        <StatCard label="Model" value={d.model} />
        <StatCard label="Provider" value={d.provider || "—"} />
      </div>

      {/* Two column: Parameters + Token Breakdown */}
      <div className={styles.detailGrid}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Request Parameters</h3>
          <KV label="Temperature" value={d.temperature || "—"} />
          <KV label="Top P" value={d.topP || "—"} />
          <KV label="Max Tokens" value={d.maxTokens || "—"} />
          <KV label="Frequency Penalty" value={d.frequencyPenalty || "—"} />
          <KV label="Presence Penalty" value={d.presencePenalty || "—"} />
          <KV label="Seed" value={d.seed || "—"} />
          <KV label="Finish Reason" value={d.finishReason || "—"} />
          <KV label="Response Model" value={d.responseModel || d.model} />
          <KV label="Server Address" value={d.serverAddress || "—"} />
          {d.conversationId && <KV label="Conversation ID" value={d.conversationId} />}
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Token Usage</h3>
          {tokenBreakdown.data && (
            <>
              <KV label="This Span Input" value={tokenBreakdown.data.inputTokens} />
              <KV label="This Span Output" value={tokenBreakdown.data.outputTokens} />
              <KV label="This Span Total" value={tokenBreakdown.data.totalTokens} />
              <KV label="Model Avg Input" value={tokenBreakdown.data.avgInputModel.toFixed(0)} />
              <KV label="Model Avg Output" value={tokenBreakdown.data.avgOutputModel.toFixed(0)} />
            </>
          )}
          <KV label="Span ID" value={d.spanId} />
          <KV label="Trace ID" value={d.traceId} />
          <KV label="Service" value={d.serviceName} />
        </div>
      </div>

      {/* Messages */}
      {messages.data && messages.data.length > 0 && (
        <div className={`${styles.panel} ${styles.detailFull}`}>
          <h3 className={styles.panelTitle}>Messages ({messages.data.length})</h3>
          <div className={styles.messageList}>
            {messages.data.map((m, i) => (
              <div key={i} className={`${styles.message} ${m.role === "user" ? styles.messageUser : m.role === "system" ? styles.messageSystem : styles.messageAssistant}`}>
                <div className={styles.messageRole}>{m.role}</div>
                <div className={styles.messageContent}>{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trace Context */}
      {traceCtx.data && traceCtx.data.length > 0 && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Trace Context ({traceCtx.data.length} spans)</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Operation</th><th>Service</th><th>Duration</th><th>Kind</th><th>AI</th><th>Error</th></tr></thead>
              <tbody>
                {traceCtx.data.map((s) => (
                  <tr key={s.spanId} className={s.spanId === spanId ? styles.clickRow : undefined} style={s.spanId === spanId ? { background: "rgba(99, 102, 241, 0.1)" } : undefined}>
                    <td>{s.operationName}</td>
                    <td>{s.serviceName}</td>
                    <td>{s.durationMs.toFixed(0)}ms</td>
                    <td>{s.kindString}</td>
                    <td>{s.isAi ? "✓" : ""}</td>
                    <td>{s.hasError ? <span className={styles.errorText}>Error</span> : ""}</td>
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

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={styles.kvRow}>
      <span className={styles.kvLabel}>{label}</span>
      <span className={styles.kvValue}>{value}</span>
    </div>
  );
}
