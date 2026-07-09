import { DrawerHeader, DrawerIconButton } from "@shared/components/ui/overlay/detail-drawer";
import { formatDuration } from "@shared/utils/formatters";
import { Check, Copy, Zap } from "lucide-react";
import { useState } from "react";

export interface SelectedSpan {
  readonly span_id?: string;
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

interface SpanDrawerHeaderProps {
  span: SelectedSpan;
  spanId: string;
  isCritical: boolean;
  traceStartMs?: number;
  traceEndMs?: number;
  onClose: () => void;
}

function statusColor(httpStatus: number | undefined): string | undefined {
  if (httpStatus == null) return undefined;
  if (httpStatus >= 500) return "var(--err-fg)";
  if (httpStatus >= 400) return "var(--warn-fg)";
  return undefined;
}

export function SpanDrawerHeader({
  span,
  spanId,
  isCritical,
  traceStartMs,
  traceEndMs,
  onClose,
}: SpanDrawerHeaderProps) {
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
    <DrawerHeader onClose={onClose} actions={<CopySpanId spanId={spanId} />}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-[12.5px] text-[var(--fg-0)]">
          {span.service_name || "unknown"}
        </span>
        {span.span_kind && (
          <span className="rounded-[4px] bg-[var(--bg-inset)] px-1.5 py-px font-mono text-[10.5px] text-[var(--fg-3)]">
            {span.span_kind}
          </span>
        )}
        <span
          className="inline-flex items-center gap-1 rounded-full px-[7px] py-px font-mono text-[10.5px]"
          style={{
            color: isError ? "var(--err-fg)" : "var(--ok-fg)",
            background: isError ? "var(--err-soft)" : "var(--ok-soft)",
          }}
        >
          {isError ? "error" : "ok"}
        </span>
        {isCritical && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-[7px] py-px font-mono text-[10.5px]"
            style={{ color: "var(--warn-fg)", background: "var(--warn-soft)" }}
            title="This span is on the trace's critical path"
          >
            <Zap size={10} /> critical path
          </span>
        )}
      </div>

      <h2 className="mt-2 break-words font-semibold text-[16px] text-[var(--fg-0)] leading-[1.3]">
        {span.operation_name || "(no operation)"}
      </h2>

      {traceWindow > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          <div className="relative h-1.5 rounded-[3px] bg-[var(--bg-inset)]">
            <div
              className="absolute top-0 h-full rounded-[3px]"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                background: isError ? "var(--err)" : "var(--accent)",
              }}
            />
          </div>
          <div className="flex justify-between font-mono text-[10px] text-[var(--fg-3)]">
            <span>+{formatDuration(offsetMs)}</span>
            <span>{formatDuration(traceWindow)}</span>
          </div>
        </div>
      )}

      <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-x-4 gap-y-2.5">
        <Stat label="Duration" value={formatDuration(dur)} />
        {span.http_method && <Stat label="Method" value={span.http_method} />}
        {httpStatus != null && (
          <Stat label="Status" value={String(httpStatus)} color={statusColor(httpStatus)} />
        )}
        <Stat label="Span ID" value={`${spanId.slice(0, 10)}…`} title={spanId} />
      </div>
    </DrawerHeader>
  );
}

function CopySpanId({ spanId }: { spanId: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <DrawerIconButton
      icon={copied ? <Check size={14} /> : <Copy size={14} />}
      title="Copy span ID"
      onClick={() =>
        void navigator.clipboard?.writeText(spanId).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1100);
        })
      }
    />
  );
}

function Stat({
  label,
  value,
  color,
  title,
}: {
  label: string;
  value: string;
  color?: string;
  title?: string;
}) {
  return (
    <div>
      <div className="text-[10.5px] text-[var(--fg-3)] uppercase tracking-[0.05em]">{label}</div>
      <div
        className="font-mono text-[13px] text-[var(--fg-0)] tabular-nums"
        style={color ? { color } : undefined}
        title={title}
      >
        {value}
      </div>
    </div>
  );
}
