import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Brain } from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { useTeamId } from "@app/store/appStore";
import { Badge } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatDuration, formatNumber } from "@shared/utils/formatters";

import type { ApiErrorShape } from "@shared/api/api/interceptors/errorInterceptor";
import { aiTraceQueries } from "../../api/queryOptions";
import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import type { LLMTraceSpan, LLMTraceSummary } from "../../types";

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string): string {
  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export default function AiTraceDetailPage() {
  const { traceId = "" } = useParams({ strict: false });
  const navigate = useNavigate();
  const selectedTeamId = useTeamId();

  const spansQuery = useQuery(aiTraceQueries.trace(selectedTeamId, traceId));
  const spans = (spansQuery.data ?? []) as LLMTraceSpan[];
  const isLoading = spansQuery.isLoading;
  const spansError = (spansQuery.error ?? null) as ApiErrorShape | null;

  const summaryQuery = useQuery(aiTraceQueries.summary(selectedTeamId, traceId));
  const summary = summaryQuery.data as LLMTraceSummary | undefined;
  const summaryError = (summaryQuery.error ?? null) as ApiErrorShape | null;

  // Build depth map for indentation
  const { depthMap, traceStartMs, traceDurationMs } = useMemo(() => {
    const dm = new Map<string, number>();
    const parentMap = new Map<string, string>();
    for (const sp of spans) {
      if (sp.parentSpanId) parentMap.set(sp.spanId, sp.parentSpanId);
    }
    const getDepth = (id: string): number => {
      if (dm.has(id)) return dm.get(id)!;
      const pid = parentMap.get(id);
      const d = pid && parentMap.has(pid) ? getDepth(pid) + 1 : pid ? 1 : 0;
      dm.set(id, d);
      return d;
    };
    for (const sp of spans) getDepth(sp.spanId);

    let minStart = Number.POSITIVE_INFINITY;
    let maxEnd = 0;
    for (const sp of spans) {
      const start = new Date(sp.startTime).getTime();
      const end = start + sp.durationMs;
      if (start < minStart) minStart = start;
      if (end > maxEnd) maxEnd = end;
    }
    return {
      depthMap: dm,
      traceStartMs: minStart === Number.POSITIVE_INFINITY ? 0 : minStart,
      traceDurationMs: maxEnd - (minStart === Number.POSITIVE_INFINITY ? 0 : minStart) || 1,
    };
  }, [spans]);

  return (
    <AiWorkspaceLayout
        title="LLM Trace"
        icon={<Brain size={24} />}
        subtitle="Follow the full traced execution path across model calls, tools, and chained operations."
        breadcrumbs={[
          { label: "LLM Runs", path: "/ai-runs" },
          { label: `${traceId.slice(0, 16)}…` },
        ]}
        actions={
          summary ? <Badge variant="info">{formatNumber(summary.totalSpans)} spans</Badge> : undefined
        }
      >

      {spansError && (
        <div className="mb-4">
          <div className="rounded-lg border border-[var(--error-border,rgba(240,68,56,0.2))] bg-[var(--error-bg,rgba(240,68,56,0.08))] px-4 py-3 text-[var(--error-text,#f04438)]">
            <strong>The LLM trace could not be loaded.</strong>
            <div className="mt-1 text-[13px]">
              {getErrorMessage(spansError, "The backend request for trace spans failed.")}
            </div>
          </div>
        </div>
      )}

      {summaryError && (
        <div className="mb-4">
          <div className="rounded-lg border border-[var(--error-border,rgba(240,68,56,0.2))] bg-[var(--error-bg,rgba(240,68,56,0.08))] px-4 py-3 text-[var(--error-text,#f04438)]">
            <strong>Trace summary is unavailable</strong>
            <div className="mt-1 text-[13px]">
              {getErrorMessage(summaryError, "The backend request for trace summary failed.")}
            </div>
          </div>
        </div>
      )}

      {summary && (
        <div className="mb-5 grid grid-cols-6 gap-3">
          <SummaryCard label="Spans" value={formatNumber(summary.totalSpans)} />
          <SummaryCard label="LLM Calls" value={formatNumber(summary.llmCalls)} />
          <SummaryCard label="Tool Calls" value={formatNumber(summary.toolCalls)} />
          <SummaryCard label="Total Tokens" value={formatNumber(summary.totalTokens)} />
          <SummaryCard label="LLM Time" value={`${summary.llmTimePct.toFixed(1)}%`} />
          <SummaryCard label="Models" value={String(summary.modelsUsed.length)} />
        </div>
      )}

      <PageSurface padding="sm" className="overflow-hidden p-0">
        <h3 className="m-0 border-[var(--border-color)] border-b px-[18px] py-[14px] font-semibold text-[13px] text-[var(--text-primary)]">
          Trace Waterfall
        </h3>
        {isLoading && <div className="p-10 text-center text-[var(--text-muted)]">Loading...</div>}
        {!isLoading && !spansError && spans.length === 0 && (
          <div className="p-10 text-center text-[var(--text-muted)]">No spans found</div>
        )}
        {!spansError &&
          spans.map((span) => (
            <SpanRow
              key={span.spanId}
              span={span}
              depth={depthMap.get(span.spanId) ?? 0}
              traceStartMs={traceStartMs}
              traceDurationMs={traceDurationMs}
              onClick={() => navigate({ to: `/ai-runs/${span.spanId}` })}
            />
          ))}
      </PageSurface>
    </AiWorkspaceLayout>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--glass-bg)] px-[14px] py-3 text-center">
      <div className="mb-1 text-[10px] text-[var(--text-muted)] uppercase tracking-[0.5px]">
        {label}
      </div>
      <div className="font-bold font-mono text-[18px] text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

function SpanRow({
  span,
  depth,
  traceStartMs,
  traceDurationMs,
  onClick,
}: {
  span: LLMTraceSpan;
  depth: number;
  traceStartMs: number;
  traceDurationMs: number;
  onClick: () => void;
}) {
  const spanStartMs = new Date(span.startTime).getTime();
  const leftPct = ((spanStartMs - traceStartMs) / traceDurationMs) * 100;
  const widthPct = Math.max((span.durationMs / traceDurationMs) * 100, 0.5);
  const tokens = (span.inputTokens ?? 0) + (span.outputTokens ?? 0);

  return (
    <div
      className="flex cursor-pointer items-center gap-2 border-[var(--border-color)] border-b px-[18px] py-2 text-[12px] transition-colors duration-100 last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]"
      onClick={onClick}
    >
      {/* Indent spacer */}
      <span className="inline-block shrink-0" style={{ width: depth * 16 }} />

      {/* Role badge */}
      <span
        className={cn(
          "inline-flex min-w-[52px] shrink-0 justify-center rounded-[3px] bg-[var(--glass-bg)] px-[5px] py-px font-semibold text-[9px] text-[var(--text-muted)] uppercase",
          span.role === "llm_call" && "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]",
          span.role === "tool_call" && "bg-[rgba(245,158,11,0.12)] text-[#f59e0b]",
          span.role === "retriever" && "bg-[rgba(6,182,212,0.12)] text-[#06b6d4]",
          (span.role === "chain" || span.role === "agent") &&
            "bg-[rgba(16,185,129,0.12)] text-[#10b981]"
        )}
      >
        {span.role.replace("_", " ")}
      </span>

      {/* Span name */}
      <span
        className="w-[220px] min-w-[220px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text-primary)]"
        title={span.operationName}
      >
        {span.operationName}
      </span>

      {/* Waterfall bar */}
      <div className="relative h-[18px] min-w-[100px] flex-1">
        <div
          className={cn(
            "absolute h-full min-w-[2px] rounded-[3px]",
            span.role === "llm_call" && "bg-[rgba(139,92,246,0.7)]",
            span.role === "tool_call" && "bg-[rgba(245,158,11,0.7)]",
            span.role === "retriever" && "bg-[rgba(6,182,212,0.7)]",
            (span.role === "chain" || span.role === "agent") && "bg-[rgba(16,185,129,0.5)]",
            span.role === "other" && "bg-[rgba(148,163,184,0.4)]"
          )}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
      </div>

      {/* Meta: model + tokens */}
      <div className="flex min-w-[180px] items-center justify-end gap-1.5">
        {span.model && (
          <span className="rounded-[3px] bg-[rgba(139,92,246,0.1)] px-1.5 py-px text-[#8b5cf6] text-[10px]">
            {span.model}
          </span>
        )}
        {tokens > 0 && (
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            {formatNumber(tokens)} tok
          </span>
        )}
      </div>

      {/* Duration */}
      <span className="min-w-[60px] shrink-0 text-right font-mono text-[11px] text-[var(--text-secondary)]">
        {formatDuration(span.durationMs)}
      </span>
    </div>
  );
}
