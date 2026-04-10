/**
 * LLM Span Detail — Deep-dive into a single AI span.
 *
 * Improvements:
 * - Mini-waterfall trace context (parent→current→children with duration bars)
 * - Related spans section
 * - Copy-to-clipboard on messages
 * - Collapsible long messages
 * - Trace ID link to main Traces page
 * - Conversation ID link
 */
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useMemo } from "react";
import { useTimeRange, useTeamId } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import { AiStatCard } from "../components/AiStatCard";
import { formatNumber, formatMs, formatPercent } from "../utils/formatters";
import styles from "./AiOverviewPage.module.css";

export default function AiSpanDetailPage() {
  const { spanId = "" } = useParams({ strict: false });
  const teamId = useTeamId();
  const navigate = useNavigate();

  const detail = useQuery({
    queryKey: ["ai-span-detail", teamId, spanId],
    queryFn: () => aiService.getSpanDetail(spanId),
    enabled: !!spanId,
  });

  const messages = useQuery({
    queryKey: ["ai-span-messages", teamId, spanId],
    queryFn: () => aiService.getSpanMessages(spanId),
    enabled: !!spanId,
  });

  const traceContext = useQuery({
    queryKey: ["ai-span-context", teamId, spanId, detail.data?.traceId ?? ""],
    queryFn: () => aiService.getTraceContext(spanId, detail.data!.traceId),
    enabled: !!spanId && !!detail.data?.traceId,
  });

  const related = useQuery({
    queryKey: ["ai-span-related", teamId, spanId, detail.data?.model ?? ""],
    queryFn: () => aiService.getRelatedSpans(spanId, detail.data!.model, detail.data!.operationType),
    enabled: !!spanId && !!detail.data?.model,
  });

  const tokenBreakdown = useQuery({
    queryKey: ["ai-span-tokens", teamId, spanId, detail.data?.model ?? ""],
    queryFn: () => aiService.getTokenBreakdown(spanId, detail.data!.model),
    enabled: !!spanId && !!detail.data?.model,
  });

  const d = detail.data;

  if (!d && detail.isLoading) {
    return <div className={styles.page}><div className={styles.loading}>Loading span detail…</div></div>;
  }
  if (!d) {
    return <div className={styles.page}><div className={styles.emptyState}>Span not found.</div></div>;
  }

  const totalTokens = d.inputTokens + d.outputTokens;
  const inputPct = totalTokens > 0 ? (d.inputTokens / totalTokens) * 100 : 50;

  return (
    <div className={styles.page}>
      {/* Hero stats */}
      <div className={styles.statGrid}>
        <AiStatCard label="Model" value={d.model} />
        <AiStatCard label="Provider" value={d.provider || "—"} />
        <AiStatCard label="Duration" value={formatMs(d.durationMs)} />
        <AiStatCard label="Input Tokens" value={formatNumber(d.inputTokens)} />
        <AiStatCard label="Output Tokens" value={formatNumber(d.outputTokens)} />
        <AiStatCard label="Status" value={d.hasError ? "Error" : "OK"} accent={d.hasError ? "red" : "green"} />
      </div>

      {/* Metadata + Token Breakdown */}
      <div className={styles.detailGrid}>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Metadata</h3>
          <KvRow label="Operation" value={d.operationType || d.operationName} />
          <KvRow label="Service" value={d.serviceName} />
          <KvRow label="Span Kind" value={d.kindString} />
          <KvRow label="Temperature" value={d.temperature > 0 ? String(d.temperature) : "—"} />
          <KvRow label="Top P" value={d.topP > 0 ? String(d.topP) : "—"} />
          <KvRow label="Max Tokens" value={d.maxTokens > 0 ? formatNumber(d.maxTokens) : "—"} />
          <KvRow label="Finish Reason" value={d.finishReason || "—"} />
          <KvRow label="Response Model" value={d.responseModel || "—"} />
          <KvRow label="Started" value={new Date(d.timestamp).toLocaleString()} />
          {d.conversationId && (
            <div className={styles.kvRow}>
              <span className={styles.kvLabel}>Conversation</span>
              <button
                className={styles.copyBtn}
                style={{ fontFamily: "inherit" }}
                onClick={() => navigate({ to: `/ai-conversations/${encodeURIComponent(d.conversationId)}` as any })}
              >
                {d.conversationId.slice(0, 16)}… → Detail
              </button>
            </div>
          )}
        </div>

        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Token Breakdown</h3>
          {/* Visual bar */}
          <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ width: `${inputPct}%`, background: "#3b82f6" }} title={`Input: ${formatNumber(d.inputTokens)}`} />
            <div style={{ width: `${100 - inputPct}%`, background: "#22c55e" }} title={`Output: ${formatNumber(d.outputTokens)}`} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted, #8b8fa3)" }}>
            <span style={{ color: "#3b82f6" }}>Input ({formatNumber(d.inputTokens)})</span>
            <span style={{ color: "#22c55e" }}>Output ({formatNumber(d.outputTokens)})</span>
          </div>

          {tokenBreakdown.data && (
            <div style={{ marginTop: 16 }}>
              <KvRow label="Avg Input (model)" value={formatNumber(tokenBreakdown.data.avgInputModel)} />
              <KvRow label="Avg Output (model)" value={formatNumber(tokenBreakdown.data.avgOutputModel)} />
            </div>
          )}

          <KvRow label="Tokens/sec" value={d.tokensPerSec > 0 ? `${d.tokensPerSec.toFixed(1)}` : "—"} />
        </div>
      </div>

      {/* Trace Lineage links */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Trace Lineage</h3>
        <div className={styles.detailGrid} style={{ gap: 8 }}>
          <div>
            <KvRow label="Span ID" value={d.spanId} />
            <KvRow label="Parent Span" value={d.parentSpanId || "—"} />
          </div>
          <div>
            <div className={styles.kvRow}>
              <span className={styles.kvLabel}>Trace ID</span>
              <button
                className={styles.copyBtn}
                style={{ fontFamily: "inherit" }}
                onClick={() => navigate({ to: `/traces/${d.traceId}` as any })}
              >
                {d.traceId.slice(0, 20)}… → Traces
              </button>
            </div>
            <KvRow label="Server" value={d.serverAddress || "—"} />
          </div>
        </div>
      </div>

      {/* Mini-Waterfall Trace Context */}
      {traceContext.data && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Execution Context (Waterfall)</h3>
          <WaterfallView
            ancestors={traceContext.data.ancestors}
            current={traceContext.data.current}
            children_={traceContext.data.children}
            onSpanClick={(id) => navigate({ to: `/ai-explorer/${id}` as any })}
          />
        </div>
      )}

      {/* Messages */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>Messages {messages.isLoading && "(loading…)"}</h3>
        {(messages.data ?? []).length === 0 && !messages.isLoading && (
          <div className={styles.emptyState} style={{ padding: 24 }}>No prompt/completion messages found for this span.</div>
        )}
        <div className={styles.messageList}>
          {(messages.data ?? []).map((msg, i) => (
            <MessageCard key={i} role={msg.role} content={msg.content} />
          ))}
        </div>
      </div>

      {/* Related Spans */}
      {related.data && related.data.length > 0 && (
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>Related Spans (same model & operation)</h3>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Span ID</th><th>Duration</th><th>In Tok</th><th>Out Tok</th><th>Finish</th><th>Status</th></tr></thead>
              <tbody>
                {related.data.map((r) => (
                  <tr key={r.spanId} className={styles.clickRow} onClick={() => navigate({ to: `/ai-explorer/${r.spanId}` as any })}>
                    <td className={styles.mono}>{r.spanId.slice(0, 16)}…</td>
                    <td>{formatMs(r.durationMs)}</td>
                    <td>{formatNumber(r.inputTokens)}</td>
                    <td>{formatNumber(r.outputTokens)}</td>
                    <td style={{ fontSize: 11 }}>{r.finishReason || "—"}</td>
                    <td>{r.hasError ? <span className={styles.errorText}>Error</span> : <span style={{ color: "#22c55e" }}>OK</span>}</td>
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

// ---- Sub-components ----

function KvRow({ label, value }: { label: string; value: string | number | React.ReactNode }) {
  return (
    <div className={styles.kvRow}>
      <span className={styles.kvLabel}>{label}</span>
      <span className={styles.kvValue}>{value}</span>
    </div>
  );
}

function MessageCard({ role, content }: { role: string; content: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = content.length > 500;
  const styleClass =
    role === "user" ? styles.messageUser :
    role === "assistant" ? styles.messageAssistant :
    styles.messageSystem;

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(content).catch(() => {});
  }, [content]);

  return (
    <div className={`${styles.message} ${styleClass}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className={styles.messageRole}>{role}</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "var(--text-muted, #8b8fa3)" }}>{content.length} chars</span>
          <button className={styles.copyBtn} onClick={copyToClipboard}>Copy</button>
        </div>
      </div>
      <div className={`${styles.messageContent} ${isLong && !expanded ? styles.collapsedMsg : ""}`}>
        {content}
      </div>
      {isLong && (
        <button className={styles.expandBtn} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Collapse" : "Expand full message"}
        </button>
      )}
    </div>
  );
}

interface WaterfallSpan {
  spanId: string;
  parentSpanId?: string;
  serviceName: string;
  operationName: string;
  durationMs: number;
  hasError: boolean;
  isAi?: boolean;
  kindString?: string;
}

function WaterfallView({
  ancestors,
  current,
  children_,
  onSpanClick,
}: {
  ancestors: WaterfallSpan[];
  current: WaterfallSpan;
  children_: WaterfallSpan[];
  onSpanClick: (id: string) => void;
}) {
  const allSpans: (WaterfallSpan & { isCurrent: boolean; depth: number })[] = [
    ...ancestors.map((s, i) => ({ ...s, isCurrent: false, depth: i })),
    { ...current, isCurrent: true, depth: ancestors.length },
    ...children_.map((s, i) => ({ ...s, isCurrent: false, depth: ancestors.length + 1 + i })),
  ];

  const maxDuration = Math.max(...allSpans.map((s) => s.durationMs), 1);

  return (
    <div>
      {allSpans.map((span) => {
        const barWidth = Math.max((span.durationMs / maxDuration) * 100, 2);
        return (
          <div
            key={span.spanId}
            className={styles.waterfallRow}
            style={{ paddingLeft: span.depth * 16, cursor: span.isCurrent ? "default" : "pointer" }}
            onClick={() => !span.isCurrent && onSpanClick(span.spanId)}
          >
            <div
              className={styles.waterfallBar}
              style={{
                width: `${barWidth}%`,
                background: span.hasError ? "#ef4444" : span.isAi ? "#6366f1" : "#3b82f6",
              }}
            />
            <span className={span.isCurrent ? styles.waterfallCurrent : ""} style={{ fontSize: 12, color: "var(--text-primary, #e8eaf0)", flex: 1 }}>
              {span.operationName}
              {span.isCurrent && <span style={{ fontSize: 10, color: "var(--accent, #6366f1)", marginLeft: 6 }}>← current</span>}
            </span>
            <span style={{ fontSize: 10, color: "var(--text-muted, #8b8fa3)" }}>{span.serviceName}</span>
            <span className={styles.mono} style={{ fontSize: 10, flexShrink: 0, color: "var(--text-secondary, #c0c4d4)" }}>
              {formatMs(span.durationMs)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
