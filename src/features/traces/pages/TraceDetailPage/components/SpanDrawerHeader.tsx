import { Check, Copy, X, Zap } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";

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

function statusClass(httpStatus: number | undefined): string {
  if (httpStatus == null) return "";
  if (httpStatus >= 500) return "tdp-sd-stat-v-err";
  if (httpStatus >= 400) return "tdp-sd-stat-v-warn";
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

  // Mini timeline: span window relative to trace.
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
      className="tdp-sd-head outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]"
    >
      <div className="tdp-sd-head-top">
        <span className="tdp-sd-svc">{span.service_name || "unknown"}</span>
        {span.span_kind && <span className="tdp-sd-kind">{span.span_kind}</span>}
        <span className={`tdp-sd-pill ${isError ? "tdp-sd-pill-err" : "tdp-sd-pill-ok"}`}>
          {isError ? "error" : "ok"}
        </span>
        {isCritical && (
          <span
            className="tdp-sd-pill tdp-sd-pill-crit"
            title="This span is on the trace's critical path"
          >
            <Zap size={10} /> critical path
          </span>
        )}
        <span className="tdp-sd-head-spacer" />
        <button
          type="button"
          onClick={onCopy}
          title="Copy span ID"
          className="tdp-iconbtn"
          aria-label="Copy span ID"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close span detail"
          className="tdp-iconbtn"
        >
          <X size={14} />
        </button>
      </div>

      <h2 className="tdp-sd-op">{span.operation_name || "(no operation)"}</h2>

      {traceWindow > 0 && (
        <div className="tdp-sd-mini">
          <div className="tdp-sd-mini-track">
            <div
              className={`tdp-sd-mini-bar ${isError ? "tdp-sd-mini-bar-err" : ""}`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            />
          </div>
          <div className="tdp-sd-mini-axis">
            <span>+{formatDuration(offsetMs)}</span>
            <span>{formatDuration(traceWindow)}</span>
          </div>
        </div>
      )}

      <div className="tdp-sd-stats">
        <div>
          <div className="tdp-sd-stat-k">Duration</div>
          <div className="tdp-sd-stat-v">{formatDuration(dur)}</div>
        </div>
        {span.http_method && (
          <div>
            <div className="tdp-sd-stat-k">Method</div>
            <div className="tdp-sd-stat-v">{span.http_method}</div>
          </div>
        )}
        {httpStatus != null && (
          <div>
            <div className="tdp-sd-stat-k">Status</div>
            <div className={`tdp-sd-stat-v ${statusClass(httpStatus)}`}>{httpStatus}</div>
          </div>
        )}
        <div>
          <div className="tdp-sd-stat-k">Span ID</div>
          <div className="tdp-sd-stat-v" title={spanId}>
            {spanId.slice(0, 10)}…
          </div>
        </div>
      </div>
    </div>
  );
});
