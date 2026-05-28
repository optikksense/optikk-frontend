import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Copy, GitFork, Link2, X } from "lucide-react";
import { memo, useMemo } from "react";
import toast from "react-hot-toast";

import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";
import { Button } from "@shared/components/primitives/ui";

import { cn } from "@/lib/utils";

import { getLogById } from "../../api/logsExplorerApi";
import { LEVEL_DOT, levelBadgeClasses } from "../table/LogRow";
import type { LogRecord } from "../../types/log";
import { serviceSwatchColor } from "../../utils/serviceHue";
import { severityStyle } from "../../utils/severity";
import { getSpanId, getTraceId } from "../../utils/traceCorrelation";

const ASIDE =
  "flex min-w-0 flex-col gap-3 overflow-y-auto rounded-[8px] border border-[var(--line)] bg-[var(--bg-1)] p-[14px]";
const ICON_BTN =
  "inline-grid h-7 w-7 cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent text-[var(--fg-2)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]";
const BTN_SM =
  "inline-flex h-[26px] cursor-pointer items-center gap-1 rounded-[5px] border border-[var(--line)] bg-[var(--bg-0)] px-[10px] text-xs text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)] disabled:cursor-not-allowed disabled:opacity-40";
const BTN_SM_PRI =
  "border-transparent bg-[var(--accent)] text-[oklch(0.99_0.005_270)] hover:bg-[var(--accent-2)] hover:text-[oklch(0.99_0.005_270)]";

interface Props {
  readonly logId: string;
  readonly onClose: () => void;
  readonly onPrev?: () => void;
  readonly onNext?: () => void;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" });
  } catch {
    return iso;
  }
}

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diffSec = Math.round((Date.now() - d) / 1000);
  const a = Math.abs(diffSec);
  if (a < 60) return `${a}s ago`;
  if (a < 3600) return `${Math.round(a / 60)}m ago`;
  if (a < 86400) return `${Math.round(a / 3600)}h ago`;
  return `${Math.round(a / 86400)}d ago`;
}

function flattenAttrs(log: LogRecord): Array<[string, string]> {
  return [
    ...Object.entries(log.attributes_string ?? {}),
    ...Object.entries(log.attributes_number ?? {}).map(
      ([k, v]) => [k, String(v)] as [string, string]
    ),
    ...Object.entries(log.attributes_bool ?? {}).map(
      ([k, v]) => [k, v ? "true" : "false"] as [string, string]
    ),
  ].sort(([a], [b]) => a.localeCompare(b));
}

function LogDetailPanelComponent({ logId, onClose, onPrev, onNext }: Props) {
  const navigate = useNavigate();

  const q = useQuery({
    queryKey: ["logs", "detail", logId],
    queryFn: () => getLogById(logId),
    enabled: Boolean(logId),
    staleTime: 30_000,
  });

  if (q.isPending) {
    return (
      <aside className={ASIDE}>
        <div className="p-4 text-[13px] text-[var(--fg-3)]">Loading log…</div>
      </aside>
    );
  }

  if (q.isError) {
    return (
      <aside className={ASIDE}>
        <p className="text-[13px] font-medium text-[var(--err-c)]">Could not load log</p>
        <pre className="text-[11px] text-[var(--fg-3)]">{formatErrorForDisplay(q.error)}</pre>
        <div className="flex gap-1.5">
          <Button variant="secondary" onClick={() => void q.refetch()}>
            Retry
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </aside>
    );
  }

  const log = q.data?.log;
  if (!log) {
    return (
      <aside className={ASIDE}>
        <div className="p-3 text-[var(--fg-3)]">No data</div>
      </aside>
    );
  }

  const sev = severityStyle(log.severity_bucket);
  const attrs = flattenAttrs(log);
  const traceId = getTraceId(log);
  const spanId = getSpanId(log);
  const standardFields: Array<[string, string]> = [
    ["service", log.service_name],
    ["level", log.severity_text ?? sev.label],
    ["host", log.host ?? ""],
    ["pod", log.pod ?? ""],
    ["container", log.container ?? ""],
    ["env", log.environment ?? ""],
    ["scope", log.scope_name ?? ""],
  ].filter(([, v]) => v !== "") as Array<[string, string]>;

  const allFields: Array<[string, string]> = [...standardFields, ...attrs];

  return (
    <aside className={ASIDE}>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--fg-0)]">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: serviceSwatchColor(log.service_name) }}
          />
          {log.service_name}
        </span>
        <span className={levelBadgeClasses(sev.slug)}>
          <span className={LEVEL_DOT} />
          {sev.shortLabel}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          className={ICON_BTN}
          title="Copy JSON"
          onClick={() => void navigator.clipboard.writeText(JSON.stringify(log, null, 2))}
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          className={ICON_BTN}
          title="Permalink"
          onClick={() => void navigator.clipboard.writeText(window.location.href)}
        >
          <Link2 size={14} />
        </button>
        <button type="button" className={ICON_BTN} title="Close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className="break-words text-[13px] leading-[1.55] text-[var(--fg-0)] [font-family:'Geist_Mono',monospace]">
        {log.body || "—"}
      </div>

      <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[var(--fg-3)] [font-family:'Geist_Mono',monospace] [&_b]:font-medium [&_b]:text-[var(--fg-1)]">
        <span>{formatTime(log.timestamp)}</span>
        <span>·</span>
        <span>{relativeTime(log.timestamp)}</span>
        {log.host ? (
          <>
            <span>·</span>
            <b>{log.host}</b>
          </>
        ) : null}
        {log.environment ? (
          <>
            <span>·</span>
            <span>{log.environment}</span>
          </>
        ) : null}
      </div>

      {traceId ? (
        <div className="flex flex-col gap-2 rounded-[7px] border border-[var(--accent-ln)] bg-[var(--accent-bg)] p-3">
          <div className="flex items-center gap-[7px] text-xs font-semibold text-[var(--accent-2)]">
            <GitFork size={12} />
            Correlated with a distributed trace
          </div>
          <div className="break-all text-[11px] text-[var(--fg-1)] [font-family:'Geist_Mono',monospace]">
            {traceId}
          </div>
          {spanId ? (
            <div className="break-all text-[11px] text-[var(--fg-3)] [font-family:'Geist_Mono',monospace]">
              span_id · {spanId}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              className={cn(BTN_SM, BTN_SM_PRI)}
              onClick={() => navigate({ to: `/traces/${encodeURIComponent(traceId)}` })}
            >
              Open trace
            </button>
            <button
              type="button"
              className={BTN_SM}
              onClick={() => {
                void navigator.clipboard.writeText(`trace_id:${traceId}`);
                toast.success("Trace filter copied — paste into search");
              }}
              title="Copy trace_id filter to clipboard"
            >
              All logs in this trace
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 rounded-[7px] border border-[var(--line)] bg-transparent p-3">
          <div className="flex items-center gap-[7px] text-xs font-medium text-[var(--fg-2)]">
            <GitFork size={12} />
            No trace correlation
          </div>
          <div className="text-[11px] text-[var(--fg-3)]">
            This log was not emitted with a trace_id. Instrument the emitter to stitch it to a
            distributed trace.
          </div>
        </div>
      )}

      <div className="border-t border-[var(--line)] pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--fg-3)]">
        Fields
      </div>
      <div className="flex flex-col gap-px overflow-hidden rounded-md border border-[var(--line)]">
        {allFields.map(([k, v]) => (
          <FieldRow key={k} field={k} value={v} />
        ))}
      </div>

      {onPrev || onNext ? (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={!onPrev}
            onClick={onPrev}
            className={cn(BTN_SM, "flex-1 justify-center")}
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={!onNext}
            onClick={onNext}
            className={cn(BTN_SM, "flex-1 justify-center")}
          >
            Next →
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function FieldRow({ field, value }: { field: string; value: string }) {
  const isErr = field.startsWith("error") || field.startsWith("exception");
  const onCopy = useMemo(() => () => void navigator.clipboard.writeText(value), [value]);
  return (
    <div
      className={cn(
        "group grid grid-cols-[130px_1fr_22px] items-center gap-2 bg-[var(--bg-0)] px-[10px] py-[5px] text-[11.5px] [font-family:'Geist_Mono',monospace] hover:bg-[var(--bg-2)] [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[var(--line)]",
        isErr && "bg-[oklch(0.7_0.2_25/0.07)]"
      )}
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--fg-2)]">
        {field}
      </span>
      <span
        className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--fg-0)]"
        title={value}
      >
        {value}
      </span>
      <button
        type="button"
        className="grid cursor-pointer place-items-center border-0 bg-transparent text-sm text-[var(--accent-2)] opacity-0 group-hover:opacity-100"
        title="Copy"
        onClick={onCopy}
      >
        +
      </button>
    </div>
  );
}

export const LogDetailPanel = memo(LogDetailPanelComponent);
