import { useParams } from "@tanstack/react-router";
import { Brain } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatDuration, formatNumber, formatTimestamp } from "@shared/utils/formatters";

import { AiWorkspaceLayout } from "../../components/AiWorkspaceLayout";
import { useAiRunDetail } from "../../hooks/useAiRunDetail";
import type { ChainSpan, LLMMessage } from "../../types";

function getErrorMessage(error: { message?: string } | null | undefined, fallback: string): string {
  if (error?.message) {
    return error.message;
  }

  return fallback;
}

export default function AiRunDetailPage(): JSX.Element {
  const { spanId = "" } = useParams({ strict: false });
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
      <AiWorkspaceLayout
          title="LLM Run Detail"
          icon={<Brain size={24} />}
          subtitle="Inspect prompt/completion content, token usage, latency, and execution context for a single AI call."
          breadcrumbs={[
            { label: "LLM Runs", path: "/ai-runs" },
            { label: `${spanId.slice(0, 12)}…` },
          ]}
        >
        {isLoading ? (
          <div className="p-10 text-center text-[var(--text-muted)]">Loading...</div>
        ) : detailError ? (
          <div className="p-6">
            <div className="rounded-lg border border-[var(--error-border,rgba(240,68,56,0.2))] bg-[var(--error-bg,rgba(240,68,56,0.08))] px-4 py-3 text-[var(--error-text,#f04438)]">
              <strong>The LLM run detail could not be loaded.</strong>
              <div className="mt-1 text-[13px]">
                {getErrorMessage(detailError, "The backend request failed for this run.")}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-[var(--text-muted)]">Run not found</div>
        )}
      </AiWorkspaceLayout>
    );
  }

  const totalTokens = detail.inputTokens + detail.outputTokens;
  const inputPct = totalTokens > 0 ? (detail.inputTokens / totalTokens) * 100 : 50;

  return (
    <AiWorkspaceLayout
        title={detail.model || "LLM Run"}
        icon={<Brain size={24} />}
        subtitle="Review metadata, prompt payloads, token breakdown, and surrounding execution context."
        breadcrumbs={[
          { label: "LLM Runs", path: "/ai-runs" },
          { label: detail.model || `${spanId.slice(0, 12)}…` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="info">{detail.provider || "provider unknown"}</Badge>
            <Badge variant={detail.hasError ? "error" : "success"}>
              {detail.hasError ? "Error" : "Healthy"}
            </Badge>
          </div>
        }
      >

      {/* Metadata row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Metadata card */}
        <PageSurface padding="lg">
          <h3 className="mt-0 mb-3 font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-[0.5px]">
            Metadata
          </h3>
          <RunField label="Model" value={detail.model} />
          <RunField label="Provider" value={detail.provider || "—"} />
          <RunField label="Operation" value={detail.operationType || "—"} />
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
          <RunField label="Finish Reason" value={detail.finishReason || "—"} />
        </PageSurface>

        {/* Performance card */}
        <PageSurface padding="lg">
          <h3 className="mt-0 mb-3 font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-[0.5px]">
            Performance
          </h3>
          <RunField label="Duration" value={formatDuration(detail.durationMs)} />
          <RunField label="Service" value={detail.serviceName} />
          <RunField label="Span Kind" value={detail.spanKind} />
          <RunField label="Start Time" value={formatTimestamp(detail.startTime)} />
        </PageSurface>

        {/* Tokens card */}
        <PageSurface padding="lg">
          <h3 className="mt-0 mb-3 font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-[0.5px]">
            Tokens
          </h3>
          <RunField label="Input" value={formatNumber(detail.inputTokens)} />
          <RunField label="Output" value={formatNumber(detail.outputTokens)} />
          <RunField label="Total" value={formatNumber(totalTokens)} />
          {/* Token bar */}
          <div className="mt-2 flex h-5 overflow-hidden rounded">
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
          <div className="mt-1 flex justify-between text-[10px] text-[var(--text-muted)]">
            <span className="text-[#3b82f6]">Input</span>
            <span className="text-[#10b981]">Output</span>
          </div>
        </PageSurface>
      </div>

      {/* Messages */}
      <PageSurface padding="sm" className="overflow-hidden p-0">
        <h3 className="m-0 border-[var(--border-color)] border-b px-[18px] py-[14px] font-semibold text-[13px] text-[var(--text-primary)]">
          Messages {isMessagesLoading && "(loading...)"}
        </h3>
        {messagesError && (
          <div className="px-[18px] pt-4">
            <div className="rounded-lg border border-[var(--error-border,rgba(240,68,56,0.2))] bg-[var(--error-bg,rgba(240,68,56,0.08))] px-4 py-3 text-[var(--error-text,#f04438)]">
              <strong>Messages could not be loaded</strong>
              <div className="mt-1 text-[13px]">
                {getErrorMessage(messagesError, "The backend request for run messages failed.")}
              </div>
            </div>
          </div>
        )}
        {messages.length === 0 && !isMessagesLoading && (
          <div className="px-[18px] py-5 text-[12.5px] text-[var(--text-muted)]">
            No prompt/completion messages found. Ensure your instrumentation sends gen_ai.content
            events.
          </div>
        )}
        {messages.map((msg: LLMMessage, i: number) => (
          <div
            key={i}
            className="border-[var(--border-color)] border-b px-[18px] py-[14px] last:border-b-0"
          >
            <div
              className={cn(
                "mb-2 inline-flex rounded px-2 py-0.5 font-semibold text-[11px] capitalize",
                msg.role === "system" && "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]",
                msg.role === "user" && "bg-[rgba(59,130,246,0.12)] text-[#3b82f6]",
                msg.role === "assistant" && "bg-[rgba(16,185,129,0.12)] text-[#10b981]",
                msg.role === "tool" && "bg-[rgba(245,158,11,0.12)] text-[#f59e0b]"
              )}
            >
              {msg.role}
            </div>
            <div className="whitespace-pre-wrap break-words font-mono text-[12.5px] text-[var(--text-primary)] leading-relaxed">
              {msg.content}
            </div>
          </div>
        ))}
      </PageSurface>

      {/* Context chain */}
      {context && (
        <PageSurface padding="sm" className="overflow-hidden p-0">
          <h3 className="m-0 border-[var(--border-color)] border-b px-[18px] py-[14px] font-semibold text-[13px] text-[var(--text-primary)]">
            Execution Context {isContextLoading && "(loading...)"}
          </h3>
          {context.ancestors.map((span: ChainSpan) => (
            <ContextSpanRow key={span.spanId} span={span} isCurrent={false} />
          ))}
          <ContextSpanRow span={context.current} isCurrent={true} />
          {context.children.map((span: ChainSpan) => (
            <ContextSpanRow key={span.spanId} span={span} isCurrent={false} />
          ))}
        </PageSurface>
      )}
      {!context && contextError && (
        <PageSurface padding="sm" className="overflow-hidden p-0">
          <h3 className="m-0 border-[var(--border-color)] border-b px-[18px] py-[14px] font-semibold text-[13px] text-[var(--text-primary)]">
            Execution Context
          </h3>
          <div className="px-[18px] py-4">
            <div className="rounded-lg border border-[var(--error-border,rgba(240,68,56,0.2))] bg-[var(--error-bg,rgba(240,68,56,0.08))] px-4 py-3 text-[var(--error-text,#f04438)]">
              <strong>Execution context could not be loaded</strong>
              <div className="mt-1 text-[13px]">
                {getErrorMessage(contextError, "The backend request for execution context failed.")}
              </div>
            </div>
          </div>
        </PageSurface>
      )}
    </AiWorkspaceLayout>
  );
}

function RunField({ label, value }: { label: string; value: React.ReactNode }): JSX.Element {
  return (
    <div className="flex items-center justify-between py-[5px] text-[12.5px]">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-medium font-mono text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function ContextSpanRow({ span, isCurrent }: { span: ChainSpan; isCurrent: boolean }): JSX.Element {
  return (
    <div
      className={cn(
        "flex items-center gap-[10px] border-[var(--border-color)] border-b px-[18px] py-[10px] text-[12px] last:border-b-0",
        isCurrent && "bg-[var(--color-primary-subtle-08)]"
      )}
    >
      <span
        className={cn(
          "inline-flex min-w-[60px] justify-center rounded-[3px] bg-[var(--glass-bg)] px-[6px] py-0.5 font-semibold text-[10px] text-[var(--text-muted)] uppercase",
          span.role === "llm_call" && "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6]",
          span.role === "tool_call" && "bg-[rgba(245,158,11,0.12)] text-[#f59e0b]",
          span.role === "retriever" && "bg-[rgba(6,182,212,0.12)] text-[#06b6d4]",
          (span.role === "chain" || span.role === "agent") &&
            "bg-[rgba(16,185,129,0.12)] text-[#10b981]"
        )}
      >
        {span.role.replace("_", " ")}
      </span>
      <span style={{ fontWeight: isCurrent ? 600 : 400, color: "var(--text-primary)", flex: 1 }}>
        {span.operationName}
        {span.model && (
          <span style={{ color: "var(--text-muted)", marginLeft: 6, fontSize: 11 }}>
            ({span.model})
          </span>
        )}
      </span>
      <span className="text-[11px] text-[var(--text-muted)]">{span.serviceName}</span>
      <span className="font-mono text-[11px] text-[var(--text-secondary)]">
        {formatDuration(span.durationMs)}
      </span>
    </div>
  );
}
