import { Check, Copy, X, Zap } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";

import { cn } from "@/lib/utils";
import { formatDuration } from "@shared/utils/formatters";

interface SelectedSpan {
  readonly operation_name?: string;
  readonly service_name?: string;
  readonly status?: string;
  readonly span_kind?: string;
  readonly duration_ms?: number;
  readonly http_method?: string;
  readonly response_status_code?: string;
  readonly start_time?: string;
  readonly end_time?: string;
}

interface Props {
  readonly span: SelectedSpan;
  readonly spanId: string;
  readonly traceStartMs?: number;
  readonly traceEndMs?: number;
  readonly isCritical?: boolean;
  readonly onClose: () => void;
}

const iconBtn =
  "inline-grid place-items-center w-6 h-6 rounded-md text-[var(--text-muted)] bg-transparent border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]";

const sdKind =
  "font-mono text-[10.5px] text-[var(--text-caption)] px-1.5 py-px bg-[var(--bg-tertiary)] rounded-[4px]";

const sdPillBase =
  "inline-flex items-center gap-1 px-[7px] py-[2px] rounded-full text-[10.5px] font-mono";

const statKey =
  "text-[10.5px] text-[var(--text-caption)] uppercase tracking-[0.05em]";
const statVal =
  "text-[13px] text-[var(--text-primary)] font-mono [font-feature-settings:'tnum']";

function statusColor(httpStatus: number | undefined): string {
  if (httpStatus == null) return "";
  if (httpStatus >= 500) return "!text-[var(--color-error)]";
  if (httpStatus >= 400) return "!text-[var(--color-warning)]";
  return "";
}

export const SpanDrawerHeader = forwardRef<HTMLDivElement, Props>(function SpanDrawerHeader(
  { span, spanId, traceStartMs, traceEndMs, isCritical, onClose },
  ref
) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(() => {
    void navigator.clipboard?.writeText(spanId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1100);
    });
  }, [spanId]);

  const isError = (span.status ?? "").toUpperCase() === "ERROR";
  const httpStatus = span.response_status_code ? Number(span.response_status_code) : undefined;
  const dur = span.duration_ms ?? 0;

  const spanStartMs = span.start_time ? new Date(span.start_time).getTime() : undefined;
  const spanEndMs = span.end_time ? new Date(span.end_time).getTime() : undefined;
  const traceWindow = traceStartMs != null && traceEndMs != null ? traceEndMs - traceStartMs : 0;
  const offsetMs = spanStartMs != null && traceStartMs != null ? spanStartMs - traceStartMs : 0;

  let leftPct = 0;
  let widthPct = 0;
  if (
    traceWindow > 0 &&
    spanStartMs != null &&
    spanEndMs != null &&
    traceStartMs != null &&
    traceEndMs != null
  ) {
    leftPct = Math.max(0, Math.min(100, ((spanStartMs - traceStartMs) / traceWindow) * 100));
    widthPct = Math.max(
      1,
      Math.min(100 - leftPct, ((spanEndMs - spanStartMs) / traceWindow) * 100)
    );
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="px-4 py-3.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col gap-2.5 outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[var(--text-primary)] text-[12.5px] font-medium">
          {span.service_name || "unknown"}
        </span>
        {span.span_kind && <span className={sdKind}>{span.span_kind}</span>}
        <span
          className={cn(
            sdPillBase,
            isError
              ? "bg-[var(--color-error-subtle)] text-[var(--color-error)]"
              : "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
          )}
        >
          {isError ? "error" : "ok"}
        </span>
        {isCritical && (
          <span
            className={cn(
              sdPillBase,
              "bg-[color-mix(in_oklch,var(--color-degraded),transparent_84%)] text-[var(--color-degraded)]"
            )}
            title="This span is on the trace's critical path"
          >
            <Zap size={10} /> critical path
          </span>
        )}
        <span className="flex-1" />
        <button
          type="button"
          onClick={onCopy}
          title="Copy span ID"
          className={iconBtn}
          aria-label="Copy span ID"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close span detail"
          className={iconBtn}
        >
          <X size={14} />
        </button>
      </div>

      <h2 className="m-0 text-[16px] font-semibold text-[var(--text-primary)] tracking-[-0.01em] leading-[1.3] break-words">
        {span.operation_name || "(no operation)"}
      </h2>

      {traceWindow > 0 && (
        <div className="flex flex-col gap-1">
          <div className="relative h-1.5 rounded-[3px] bg-[var(--bg-tertiary)]">
            <div
              className={cn(
                "absolute top-0 h-full rounded-[3px]",
                isError ? "bg-[var(--color-error)]" : "bg-[var(--color-primary)]"
              )}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-[var(--text-caption)]">
            <span>+{formatDuration(offsetMs)}</span>
            <span>{formatDuration(traceWindow)}</span>
          </div>
        </div>
      )}

      <div className="grid gap-x-4 gap-y-2.5 grid-cols-[repeat(auto-fit,minmax(80px,1fr))]">
        <div>
          <div className={statKey}>Duration</div>
          <div className={statVal}>{formatDuration(dur)}</div>
        </div>
        {span.http_method && (
          <div>
            <div className={statKey}>Method</div>
            <div className={statVal}>{span.http_method}</div>
          </div>
        )}
        {httpStatus != null && (
          <div>
            <div className={statKey}>Status</div>
            <div className={cn(statVal, statusColor(httpStatus))}>{httpStatus}</div>
          </div>
        )}
        <div>
          <div className={statKey}>Span ID</div>
          <div className={statVal} title={spanId}>
            {spanId.slice(0, 10)}…
          </div>
        </div>
      </div>
    </div>
  );
});
