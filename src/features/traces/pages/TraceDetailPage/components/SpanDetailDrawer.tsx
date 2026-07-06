import { Check, Copy, ScrollText, Zap } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";

import type { TraceLog } from "@shared/api/schemas/tracesSchemas";
import {
  DrawerHeader,
  DrawerIconButton,
  DrawerJson,
  DrawerSection,
  DrawerShell,
  DrawerTabs,
} from "@shared/components/ui/overlay/detail-drawer";
import type { TraceRecord } from "@shared/entities/trace/model";
import { formatDuration } from "@shared/utils/formatters";
import { getSeverityTheme } from "@/features/log/utils/logTransformers";

import type { RelatedTrace, SpanAttributes, SpanEvent } from "../../../types";
import { SpanInfoTab } from "./span-detail/SpanInfoTab";

interface SelectedSpan {
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

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly span: SelectedSpan | null;
  readonly spanId: string | null;
  readonly spans: readonly TraceRecord[];
  readonly traceId: string;
  readonly spanAttributes: SpanAttributes | null;
  readonly spanAttributesLoading: boolean;
  readonly spanEvents: readonly SpanEvent[];
  readonly relatedTraces: readonly RelatedTrace[];
  readonly traceLogs: readonly TraceLog[];
  readonly traceStartMs?: number;
  readonly traceEndMs?: number;
  readonly isCritical: boolean;
  readonly onSpanClick: (span: { span_id: string }) => void;
  readonly onAddFilter: (key: string, value: string) => void;
  readonly onOpenInLogs: () => void;
}

type SpanTab = "info" | "json" | "logs";

function statusColor(httpStatus: number | undefined): string | undefined {
  if (httpStatus == null) return undefined;
  if (httpStatus >= 500) return "var(--err-fg)";
  if (httpStatus >= 400) return "var(--warn-fg)";
  return undefined;
}

function SpanDetailDrawerComponent(props: Props) {
  const { span, spanId, spans, traceId, traceLogs, onClose, open } = props;
  const [tab, setTab] = useState<SpanTab>("info");
  useEffect(() => {
    if (open) setTab("info");
  }, [open]);

  const record = useMemo(
    () => (spanId ? (spans.find((s) => s.span_id === spanId) ?? null) : null),
    [spans, spanId]
  );

  const spanLogs = useMemo(
    () => (spanId ? traceLogs.filter((l) => l.span_id === spanId) : []),
    [traceLogs, spanId]
  );

  const jsonDoc = useMemo(() => {
    if (!record) return { span_id: spanId };
    return {
      span_id: record.span_id,
      trace_id: record.trace_id || traceId,
      parent_span_id: record.parent_span_id ?? null,
      name: record.operation_name,
      service: record.service_name,
      kind: record.span_kind,
      status: record.status,
      duration_ms: record.duration_ms,
      start_time: record.start_time,
      end_time: record.end_time,
      attributes: props.spanAttributes?.attributesString ?? {},
      resource: props.spanAttributes?.resourceAttributes ?? {},
    };
  }, [record, spanId, traceId, props.spanAttributes]);

  // The drawer is only opened with a selected span; nothing to render otherwise.
  if (!span || !spanId) return null;

  const isError = (span.status ?? "").toUpperCase() === "ERROR";
  const httpStatus = span.response_status_code ? Number(span.response_status_code) : undefined;
  const dur = span.duration_ms ?? 0;

  const { traceStartMs, traceEndMs } = props;
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

  const footer = (
    <>
      <span className="flex-1" />
      <button
        type="button"
        onClick={props.onOpenInLogs}
        className="inline-flex h-[30px] cursor-pointer items-center gap-1.5 rounded-md border-0 bg-[var(--accent)] px-3 text-[12px] text-[var(--accent-fg,oklch(0.99_0.005_270))] hover:bg-[var(--accent-2)]"
      >
        <ScrollText size={13} /> View span logs
      </button>
    </>
  );

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      width="min(560px, calc(100vw - 24px))"
      footer={footer}
    >
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
          {props.isCritical && (
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

      <DrawerTabs
        tabs={[
          { id: "info", label: "Info" },
          { id: "json", label: "JSON" },
          { id: "logs", label: "Logs", badge: spanLogs.length || null },
        ]}
        active={tab}
        onChange={(id) => setTab(id as SpanTab)}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-4">
        {tab === "info" && (
          <SpanInfoTab
            spanAttributes={props.spanAttributes}
            loading={props.spanAttributesLoading}
            spans={spans}
            selectedSpanId={spanId}
            spanEvents={props.spanEvents}
            relatedTraces={props.relatedTraces}
            traceStartMs={traceStartMs}
            traceEndMs={traceEndMs}
            onSpanClick={props.onSpanClick}
            onAddFilter={props.onAddFilter}
          />
        )}

        {tab === "json" && <DrawerJson data={jsonDoc} />}

        {tab === "logs" && (
          <DrawerSection
            title={`Logs in this span · ${spanLogs.length}`}
            action={
              <button
                type="button"
                onClick={props.onOpenInLogs}
                className="cursor-pointer border-0 bg-transparent font-mono text-[12px] text-[var(--accent-2)]"
              >
                open in logs →
              </button>
            }
          >
            {spanLogs.length === 0 ? (
              <div className="py-2 text-[12px] text-[var(--fg-3)]">
                No logs recorded for this span.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {spanLogs.map((l, i) => {
                  const { level, color } = getSeverityTheme(l.severity_text);
                  return (
                    <div
                      key={l.id || `${l.timestamp}-${i}`}
                      className="group flex flex-col gap-1.5 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-surface-inset"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: color }}
                        />
                        <span className="font-mono text-[11px] text-foreground-muted">
                          {String(l.timestamp)}
                        </span>
                        {l.severity_text && (
                          <span
                            className="rounded px-1.5 py-0.5 font-semibold text-[10px] uppercase tracking-wider"
                            style={{ color, background: `${color}15` }}
                          >
                            {level}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[12.5px] text-[var(--fg-0)] leading-[1.4]">
                        {l.body || "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DrawerSection>
        )}
      </div>
    </DrawerShell>
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

export const SpanDetailDrawer = memo(SpanDetailDrawerComponent);
