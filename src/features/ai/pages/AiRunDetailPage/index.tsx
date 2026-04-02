import { Brain } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { PageHeader } from '@shared/components/ui';
import { formatDuration, formatNumber, formatTimestamp } from '@shared/utils/formatters';
import { cn } from '@/lib/utils';

import { useAiRunDetail } from '../../hooks/useAiRunDetail';
import type { LLMMessage, ChainSpan } from '../../types';

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string): string {
  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export default function AiRunDetailPage(): JSX.Element {
  const { spanId = '' } = useParams<{ spanId: string }>();
  const {
    detail,
    messages,
    context,
    isLoading,
    isMessagesLoading,
    isContextLoading,
    detailError,
    messagesError,
    contextError,
  } = useAiRunDetail(spanId);

  if (isLoading || detailError || !detail) {
    return (
      <div className="max-w-[1200px] mx-auto px-0 pb-6">
        <PageHeader
          title="LLM Run Detail"
          icon={<Brain size={24} />}
          breadcrumbs={[
            { label: 'LLM Runs', path: '/ai-runs' },
            { label: spanId.slice(0, 12) + '…' },
          ]}
        />
        {isLoading ? (
          <div className="p-10 text-center text-[var(--text-muted)]">Loading...</div>
        ) : detailError ? (
          <div className="p-6">
            <div className="px-4 py-3 rounded-lg bg-[var(--error-bg,rgba(240,68,56,0.08))] border border-[var(--error-border,rgba(240,68,56,0.2))] text-[var(--error-text,#f04438)]">
              <strong>The LLM run detail could not be loaded.</strong>
              <div className="mt-1 text-[13px]">
                {getErrorMessage(detailError, 'The backend request failed for this run.')}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-[var(--text-muted)]">Run not found</div>
        )}
      </div>
    );
  }

  const totalTokens = detail.inputTokens + detail.outputTokens;
  const inputPct = totalTokens > 0 ? (detail.inputTokens / totalTokens) * 100 : 50;

  return (
    <div className="max-w-[1200px] mx-auto px-0 pb-6">
      <PageHeader
        title={detail.model || 'LLM Run'}
        icon={<Brain size={24} />}
        breadcrumbs={[
          { label: 'LLM Runs', path: '/ai-runs' },
          { label: detail.model || spanId.slice(0, 12) + '…' },
        ]}
      />

      {/* Metadata row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {/* Metadata card */}
        <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[10px] p-4">
          <h3 className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.5px] mt-0 mb-3">
            Metadata
          </h3>
          <RunField label="Model" value={detail.model} />
          <RunField label="Provider" value={detail.provider || '—'} />
          <RunField label="Operation" value={detail.operationType || '—'} />
          <RunField
            label="Status"
            value={
              detail.hasError ? (
                <span className="ai-runs-status-badge error">Error</span>
              ) : (
                <span className="ai-runs-status-badge ok">OK</span>
              )
            }
          />
          <RunField label="Finish Reason" value={detail.finishReason || '—'} />
        </div>

        {/* Performance card */}
        <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[10px] p-4">
          <h3 className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.5px] mt-0 mb-3">
            Performance
          </h3>
          <RunField label="Duration" value={formatDuration(detail.durationMs)} />
          <RunField label="Service" value={detail.serviceName} />
          <RunField label="Span Kind" value={detail.spanKind} />
          <RunField label="Start Time" value={formatTimestamp(detail.startTime)} />
        </div>

        {/* Tokens card */}
        <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[10px] p-4">
          <h3 className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.5px] mt-0 mb-3">
            Tokens
          </h3>
          <RunField label="Input" value={formatNumber(detail.inputTokens)} />
          <RunField label="Output" value={formatNumber(detail.outputTokens)} />
          <RunField label="Total" value={formatNumber(totalTokens)} />
          {/* Token bar */}
          <div className="flex h-5 rounded overflow-hidden mt-2">
            <div
              className="bg-[#3b82f6]"
              style={{ width: `${inputPct}%` }}
              title={`Input: ${formatNumber(detail.inputTokens)}`}
            />
            <div
              className="bg-[#10b981]"
              style={{ width: `${100 - inputPct}%` }}
              title={`Output: ${formatNumber(detail.outputTokens)}`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
            <span className="text-[#3b82f6]">Input</span>
            <span className="text-[#10b981]">Output</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[10px] mb-5 overflow-hidden">
        <h3 className="text-[13px] font-semibold text-[var(--text-primary)] px-[18px] py-[14px] m-0 border-b border-[var(--border-color)]">
          Messages {isMessagesLoading && '(loading...)'}
        </h3>
        {messagesError && (
          <div className="px-[18px] pt-4">
            <div className="px-4 py-3 rounded-lg bg-[var(--error-bg,rgba(240,68,56,0.08))] border border-[var(--error-border,rgba(240,68,56,0.2))] text-[var(--error-text,#f04438)]">
              <strong>Messages could not be loaded</strong>
              <div className="mt-1 text-[13px]">
                {getErrorMessage(messagesError, 'The backend request for run messages failed.')}
              </div>
            </div>
          </div>
        )}
        {messages.length === 0 && !isMessagesLoading && (
          <div className="px-[18px] py-5 text-[var(--text-muted)] text-[12.5px]">
            No prompt/completion messages found. Ensure your instrumentation sends gen_ai.content
            events.
          </div>
        )}
        {messages.map((msg: LLMMessage, i: number) => (
          <div
            key={i}
            className="px-[18px] py-[14px] border-b border-[var(--border-color)] last:border-b-0"
          >
            <div
              className={cn(
                'inline-flex px-2 py-0.5 rounded text-[11px] font-semibold mb-2 capitalize',
                msg.role === 'system' && 'bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]',
                msg.role === 'user' && 'bg-[rgba(59,130,246,0.12)] text-[#3b82f6]',
                msg.role === 'assistant' && 'bg-[rgba(16,185,129,0.12)] text-[#10b981]',
                msg.role === 'tool' && 'bg-[rgba(245,158,11,0.12)] text-[#f59e0b]'
              )}
            >
              {msg.role}
            </div>
            <div className="text-[12.5px] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap break-words font-mono">
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Context chain */}
      {context && (
        <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[10px] overflow-hidden">
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)] px-[18px] py-[14px] m-0 border-b border-[var(--border-color)]">
            Execution Context {isContextLoading && '(loading...)'}
          </h3>
          {context.ancestors.map((span: ChainSpan) => (
            <ContextSpanRow key={span.spanId} span={span} isCurrent={false} />
          ))}
          <ContextSpanRow span={context.current} isCurrent={true} />
          {context.children.map((span: ChainSpan) => (
            <ContextSpanRow key={span.spanId} span={span} isCurrent={false} />
          ))}
        </div>
      )}
      {!context && contextError && (
        <div className="bg-[var(--glass-bg)] border border-[var(--border-color)] rounded-[10px] overflow-hidden">
          <h3 className="text-[13px] font-semibold text-[var(--text-primary)] px-[18px] py-[14px] m-0 border-b border-[var(--border-color)]">
            Execution Context
          </h3>
          <div className="px-[18px] py-4">
            <div className="px-4 py-3 rounded-lg bg-[var(--error-bg,rgba(240,68,56,0.08))] border border-[var(--error-border,rgba(240,68,56,0.2))] text-[var(--error-text,#f04438)]">
              <strong>Execution context could not be loaded</strong>
              <div className="mt-1 text-[13px]">
                {getErrorMessage(contextError, 'The backend request for execution context failed.')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RunField({ label, value }: { label: string; value: React.ReactNode }): JSX.Element {
  return (
    <div className="flex justify-between items-center py-[5px] text-[12.5px]">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-[var(--text-primary)] font-medium font-mono">{value}</span>
    </div>
  );
}

function ContextSpanRow({ span, isCurrent }: { span: ChainSpan; isCurrent: boolean }): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-[10px] px-[18px] py-[10px] border-b border-[var(--border-color)] last:border-b-0 text-[12px]',
        isCurrent && 'bg-[var(--color-primary-subtle-08)]'
      )}
    >
      <span
        className={cn(
          'inline-flex px-[6px] py-0.5 rounded-[3px] text-[10px] font-semibold uppercase bg-[var(--glass-bg)] text-[var(--text-muted)] min-w-[60px] justify-center',
          span.role === 'llm_call' && 'bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]',
          span.role === 'tool_call' && 'bg-[rgba(245,158,11,0.12)] text-[#f59e0b]',
          span.role === 'retriever' && 'bg-[rgba(6,182,212,0.12)] text-[#06b6d4]',
          (span.role === 'chain' || span.role === 'agent') &&
            'bg-[rgba(16,185,129,0.12)] text-[#10b981]'
        )}
      >
        {span.role.replace('_', ' ')}
      </span>
      <span style={{ fontWeight: isCurrent ? 600 : 400, color: 'var(--text-primary)', flex: 1 }}>
        {span.operationName}
        {span.model && (
          <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontSize: 11 }}>
            ({span.model})
          </span>
        )}
      </span>
      <span className="text-[var(--text-muted)] text-[11px]">{span.serviceName}</span>
      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
        {formatDuration(span.durationMs)}
      </span>
    </div>
  );
}
