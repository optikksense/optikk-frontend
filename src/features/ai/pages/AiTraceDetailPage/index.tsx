import { Brain } from 'lucide-react';
import { useMemo } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '@shared/components/ui';
import { useTeamId } from '@app/store/appStore';
import { formatDuration, formatNumber } from '@shared/utils/formatters';
import { cn } from '@/lib/utils';

import { aiTraceQueries } from '../../api/queryOptions';
import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';
import type { LLMTraceSpan, LLMTraceSummary } from '../../types';

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string): string {
  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export default function AiTraceDetailPage() {
  const { traceId = '' } = useParams({ strict: false });
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

    let minStart = Infinity;
    let maxEnd = 0;
    for (const sp of spans) {
      const start = new Date(sp.startTime).getTime();
      const end = start + sp.durationMs;
      if (start < minStart) minStart = start;
      if (end > maxEnd) maxEnd = end;
    }
    return {
      depthMap: dm,
      traceStartMs: minStart === Infinity ? 0 : minStart,
      traceDurationMs: maxEnd - (minStart === Infinity ? 0 : minStart) || 1,
    };
  }, [spans]);

  return (
    <div className="max-w-[1400px] mx-auto px-0 pb-6">
      <PageHeader
        title="LLM Trace"
        icon={<Brain size={24} />}
        breadcrumbs={[
          { label: 'LLM Runs', path: '/ai-runs' },
          { label: traceId.slice(0, 16) + '…' },
        ]}
      />

      {spansError && (
        <div className="mb-4">
          <div className="px-4 py-3 rounded-lg bg-[var(--error-bg,rgba(240,68,56,0.08))] border border-[var(--error-border,rgba(240,68,56,0.2))] text-[var(--error-text,#f04438)]">
            <strong>The LLM trace could not be loaded.</strong>
            <div className="mt-1 text-[13px]">
              {getErrorMessage(spansError, 'The backend request for trace spans failed.')}
            </div>
          </div>
        </div>
      )}

      {summaryError && (
        <div className="mb-4">
          <div className="px-4 py-3 rounded-lg bg-[var(--error-bg,rgba(240,68,56,0.08))] border border-[var(--error-border,rgba(240,68,56,0.2))] text-[var(--error-text,#f04438)]">
            <strong>Trace summary is unavailable</strong>
            <div className="mt-1 text-[13px]">
              {getErrorMessage(summaryError, 'The backend request for trace summary failed.')}
            </div>
          </div>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-6 gap-3 mb-5">
          <SummaryCard label="Spans" value={formatNumber(summary.totalSpans)} />
          <SummaryCard label="LLM Calls" value={formatNumber(summary.llmCalls)} />
          <SummaryCard label="Tool Calls" value={formatNumber(summary.toolCalls)} />
          <SummaryCard label="Total Tokens" value={formatNumber(summary.totalTokens)} />
          <SummaryCard label="LLM Time" value={`${summary.llmTimePct.toFixed(1)}%`} />
          <SummaryCard label="Models" value={String(summary.modelsUsed.length)} />
        </div>
      )}

      <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[10px] overflow-hidden">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)] px-[18px] py-[14px] m-0 border-b border-[var(--border-color)]">
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
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-lg px-[14px] py-3 text-center">
      <div className="text-[10px] uppercase tracking-[0.5px] text-[var(--text-muted)] mb-1">
        {label}
      </div>
      <div className="text-[18px] font-bold text-[var(--text-primary)] font-mono">{value}</div>
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
      className="flex items-center gap-2 px-[18px] py-2 border-b border-[var(--border-color)] last:border-b-0 text-[12px] cursor-pointer transition-colors duration-100 hover:bg-[rgba(255,255,255,0.02)]"
      onClick={onClick}
    >
      {/* Indent spacer */}
      <span className="inline-block shrink-0" style={{ width: depth * 16 }} />

      {/* Role badge */}
      <span
        className={cn(
          'inline-flex px-[5px] py-px rounded-[3px] text-[9px] font-semibold uppercase bg-[var(--glass-bg)] text-[var(--text-muted)] min-w-[52px] justify-center shrink-0',
          span.role === 'llm_call' && 'bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]',
          span.role === 'tool_call' && 'bg-[rgba(245,158,11,0.12)] text-[#f59e0b]',
          span.role === 'retriever' && 'bg-[rgba(6,182,212,0.12)] text-[#06b6d4]',
          (span.role === 'chain' || span.role === 'agent') &&
            'bg-[rgba(16,185,129,0.12)] text-[#10b981]'
        )}
      >
        {span.role.replace('_', ' ')}
      </span>

      {/* Span name */}
      <span
        className="w-[220px] min-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap text-[var(--text-primary)] shrink-0"
        title={span.operationName}
      >
        {span.operationName}
      </span>

      {/* Waterfall bar */}
      <div className="flex-1 h-[18px] relative min-w-[100px]">
        <div
          className={cn(
            'absolute h-full rounded-[3px] min-w-[2px]',
            span.role === 'llm_call' && 'bg-[rgba(139,92,246,0.7)]',
            span.role === 'tool_call' && 'bg-[rgba(245,158,11,0.7)]',
            span.role === 'retriever' && 'bg-[rgba(6,182,212,0.7)]',
            (span.role === 'chain' || span.role === 'agent') && 'bg-[rgba(16,185,129,0.5)]',
            span.role === 'other' && 'bg-[rgba(148,163,184,0.4)]'
          )}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
      </div>

      {/* Meta: model + tokens */}
      <div className="flex items-center gap-1.5 min-w-[180px] justify-end">
        {span.model && (
          <span className="text-[10px] text-[#8b5cf6] bg-[rgba(139,92,246,0.1)] px-1.5 py-px rounded-[3px]">
            {span.model}
          </span>
        )}
        {tokens > 0 && (
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            {formatNumber(tokens)} tok
          </span>
        )}
      </div>

      {/* Duration */}
      <span className="text-[11px] text-[var(--text-secondary)] font-mono min-w-[60px] text-right shrink-0">
        {formatDuration(span.durationMs)}
      </span>
    </div>
  );
}
