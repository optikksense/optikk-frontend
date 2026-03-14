import { Brain } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { PageHeader } from '@shared/components/ui';
import { formatDuration, formatNumber, formatTimestamp } from '@shared/utils/formatters';

import { useAiRunDetail } from '../../hooks/useAiRunDetail';
import type { LLMMessage, ChainSpan } from '../../types';

import './AiRunDetailPage.css';

export default function AiRunDetailPage(): JSX.Element {
  const { spanId = '' } = useParams<{ spanId: string }>();
  const { detail, messages, context, isLoading, isMessagesLoading, isContextLoading } =
    useAiRunDetail(spanId);

  if (isLoading || !detail) {
    return (
      <div className="ai-run-detail-page">
        <PageHeader
          title="LLM Run Detail"
          icon={<Brain size={24} />}
          breadcrumbs={[
            { label: 'LLM Runs', path: '/ai-runs' },
            { label: spanId.slice(0, 12) + '…' },
          ]}
        />
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          {isLoading ? 'Loading...' : 'Run not found'}
        </div>
      </div>
    );
  }

  const totalTokens = detail.inputTokens + detail.outputTokens;
  const inputPct = totalTokens > 0 ? (detail.inputTokens / totalTokens) * 100 : 50;

  return (
    <div className="ai-run-detail-page">
      <PageHeader
        title={detail.model || 'LLM Run'}
        icon={<Brain size={24} />}
        breadcrumbs={[
          { label: 'LLM Runs', path: '/ai-runs' },
          { label: detail.model || spanId.slice(0, 12) + '…' },
        ]}
      />

      {/* Metadata row */}
      <div className="ai-run-detail-grid">
        <div className="ai-run-detail-card">
          <h3>Metadata</h3>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Model</span>
            <span className="ai-run-detail-field-value">{detail.model}</span>
          </div>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Provider</span>
            <span className="ai-run-detail-field-value">{detail.provider || '—'}</span>
          </div>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Operation</span>
            <span className="ai-run-detail-field-value">{detail.operationType || '—'}</span>
          </div>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Status</span>
            <span className="ai-run-detail-field-value">
              {detail.hasError ? (
                <span className="ai-runs-status-badge error">Error</span>
              ) : (
                <span className="ai-runs-status-badge ok">OK</span>
              )}
            </span>
          </div>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Finish Reason</span>
            <span className="ai-run-detail-field-value">{detail.finishReason || '—'}</span>
          </div>
        </div>

        <div className="ai-run-detail-card">
          <h3>Performance</h3>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Duration</span>
            <span className="ai-run-detail-field-value">{formatDuration(detail.durationMs)}</span>
          </div>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Service</span>
            <span className="ai-run-detail-field-value">{detail.serviceName}</span>
          </div>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Span Kind</span>
            <span className="ai-run-detail-field-value">{detail.spanKind}</span>
          </div>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Start Time</span>
            <span className="ai-run-detail-field-value">{formatTimestamp(detail.startTime)}</span>
          </div>
        </div>

        <div className="ai-run-detail-card">
          <h3>Tokens</h3>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Input</span>
            <span className="ai-run-detail-field-value">{formatNumber(detail.inputTokens)}</span>
          </div>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Output</span>
            <span className="ai-run-detail-field-value">{formatNumber(detail.outputTokens)}</span>
          </div>
          <div className="ai-run-detail-field">
            <span className="ai-run-detail-field-label">Total</span>
            <span className="ai-run-detail-field-value">{formatNumber(totalTokens)}</span>
          </div>
          <div className="ai-run-token-bar">
            <div className="ai-run-token-bar-input" style={{ width: `${inputPct}%` }} title={`Input: ${formatNumber(detail.inputTokens)}`} />
            <div className="ai-run-token-bar-output" style={{ width: `${100 - inputPct}%` }} title={`Output: ${formatNumber(detail.outputTokens)}`} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            <span style={{ color: '#3b82f6' }}>Input</span>
            <span style={{ color: '#10b981' }}>Output</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-run-messages-panel">
        <h3>Messages {isMessagesLoading && '(loading...)'}</h3>
        {messages.length === 0 && !isMessagesLoading && (
          <div style={{ padding: '20px 18px', color: 'var(--text-muted)', fontSize: 12.5 }}>
            No prompt/completion messages found. Ensure your instrumentation sends gen_ai.content events.
          </div>
        )}
        {messages.map((msg: LLMMessage, i: number) => (
          <div key={i} className="ai-run-message">
            <div className={`ai-run-message-role ${msg.role}`}>
              {msg.role}
            </div>
            <div className="ai-run-message-content">{msg.content}</div>
          </div>
        ))}
      </div>

      {/* Context chain */}
      {context && (
        <div className="ai-run-context-panel">
          <h3>Execution Context {isContextLoading && '(loading...)'}</h3>
          {context.ancestors.map((span: ChainSpan) => (
            <ContextSpanRow key={span.spanId} span={span} isCurrent={false} />
          ))}
          <ContextSpanRow span={context.current} isCurrent={true} />
          {context.children.map((span: ChainSpan) => (
            <ContextSpanRow key={span.spanId} span={span} isCurrent={false} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContextSpanRow({ span, isCurrent }: { span: ChainSpan; isCurrent: boolean }): JSX.Element {
  return (
    <div className={`ai-run-context-span ${isCurrent ? 'current' : ''}`}>
      <span className={`ai-run-context-role-badge ${span.role}`}>
        {span.role.replace('_', ' ')}
      </span>
      <span style={{ fontWeight: isCurrent ? 600 : 400, color: 'var(--text-primary)', flex: 1 }}>
        {span.operationName}
        {span.model && <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 11 }}>({span.model})</span>}
      </span>
      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
        {span.serviceName}
      </span>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
        {formatDuration(span.durationMs)}
      </span>
    </div>
  );
}
