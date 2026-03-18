import { Alert } from 'antd';
import { Brain } from 'lucide-react';
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { PageHeader } from '@shared/components/ui';
import { useAppStore } from '@shared/store/appStore';
import { formatDuration, formatNumber } from '@shared/utils/formatters';

import { aiTraceQueries } from '../../api/queryOptions';
import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';
import type { LLMTraceSpan, LLMTraceSummary } from '../../types';

import './AiTraceDetailPage.css';

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string): string {
  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export default function AiTraceDetailPage(): JSX.Element {
  const { traceId = '' } = useParams<{ traceId: string }>();
  const navigate = useNavigate();
  const { selectedTeamId } = useAppStore();

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
    <div className="ai-trace-detail-page">
      <PageHeader
        title="LLM Trace"
        icon={<Brain size={24} />}
        breadcrumbs={[
          { label: 'LLM Runs', path: '/ai-runs' },
          { label: traceId.slice(0, 16) + '…' },
        ]}
      />

      {spansError && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            type="error"
            showIcon
            message="The LLM trace could not be loaded."
            description={getErrorMessage(spansError, 'The backend request for trace spans failed.')}
          />
        </div>
      )}

      {summaryError && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            type="error"
            showIcon
            message="Trace summary is unavailable"
            description={getErrorMessage(summaryError, 'The backend request for trace summary failed.')}
          />
        </div>
      )}

      {summary && (
        <div className="ai-trace-summary-row">
          <SummaryCard label="Spans" value={formatNumber(summary.totalSpans)} />
          <SummaryCard label="LLM Calls" value={formatNumber(summary.llmCalls)} />
          <SummaryCard label="Tool Calls" value={formatNumber(summary.toolCalls)} />
          <SummaryCard label="Total Tokens" value={formatNumber(summary.totalTokens)} />
          <SummaryCard label="LLM Time" value={`${summary.llmTimePct.toFixed(1)}%`} />
          <SummaryCard label="Models" value={String(summary.modelsUsed.length)} />
        </div>
      )}

      <div className="ai-trace-waterfall">
        <h3>Trace Waterfall</h3>
        {isLoading && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        )}
        {!isLoading && !spansError && spans.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No spans found</div>
        )}
        {!spansError && spans.map((span) => (
          <SpanRow
            key={span.spanId}
            span={span}
            depth={depthMap.get(span.spanId) ?? 0}
            traceStartMs={traceStartMs}
            traceDurationMs={traceDurationMs}
            onClick={() => navigate(`/ai-runs/${span.spanId}`)}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="ai-trace-summary-card">
      <div className="ai-trace-summary-card-label">{label}</div>
      <div className="ai-trace-summary-card-value">{value}</div>
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
}): JSX.Element {
  const spanStartMs = new Date(span.startTime).getTime();
  const leftPct = ((spanStartMs - traceStartMs) / traceDurationMs) * 100;
  const widthPct = Math.max((span.durationMs / traceDurationMs) * 100, 0.5);
  const tokens = (span.inputTokens ?? 0) + (span.outputTokens ?? 0);

  return (
    <div className="ai-trace-span-row" onClick={onClick}>
      <span className="ai-trace-span-indent" style={{ width: depth * 16 }} />
      <span className={`ai-run-context-role-badge ${span.role}`} style={{ fontSize: 9, padding: '1px 5px' }}>
        {span.role.replace('_', ' ')}
      </span>
      <span className="ai-trace-span-name" title={span.operationName}>
        {span.operationName}
      </span>
      <div className="ai-trace-span-bar-container">
        <div
          className={`ai-trace-span-bar ${span.role}`}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
        />
      </div>
      <div className="ai-trace-span-meta">
        {span.model && <span className="ai-trace-span-model">{span.model}</span>}
        {tokens > 0 && <span className="ai-trace-span-tokens">{formatNumber(tokens)} tok</span>}
      </div>
      <span className="ai-trace-span-duration">{formatDuration(span.durationMs)}</span>
    </div>
  );
}
