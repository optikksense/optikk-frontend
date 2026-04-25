import { AlertCircle, Check, Copy } from "lucide-react";
import { memo, useCallback, useState } from "react";

import { formatDuration } from "@shared/utils/formatters";

interface Stats {
  readonly totalSpans: number;
  readonly duration: number;
  readonly services: Set<string>;
  readonly errors: number;
}

interface Props {
  readonly traceId: string;
  readonly stats: Stats;
  readonly criticalPathCount: number;
  readonly linkedLogsCount: number;
  readonly startMs?: number;
  readonly rootService?: string;
  readonly rootOperation?: string;
}

/** Sticky metadata bar replacing stat cards (B1). Datadog-style single-row summary. */
function TraceMetaBarComponent(props: Props) {
  const { traceId, stats, criticalPathCount, linkedLogsCount, startMs, rootService, rootOperation } = props;
  return (
    <div className="sticky top-[64px] z-10 flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2 text-[12px]">
      <TraceIdCopy traceId={traceId} />
      {rootService ? (
        <span className="truncate">
          <span className="text-[var(--text-muted)]">Root:</span>{" "}
          <span className="font-semibold">{rootService}</span>
          {rootOperation ? <span className="text-[var(--text-secondary)]"> · {rootOperation}</span> : null}
        </span>
      ) : null}
      <MetaItem label="Duration" value={formatDuration(stats.duration)} />
      <MetaItem label="Spans" value={String(stats.totalSpans)} />
      <MetaItem label="Services" value={String(stats.services.size)} />
      <MetaItem
        label="Errors"
        value={String(stats.errors)}
        tone={stats.errors > 0 ? "error" : undefined}
        icon={stats.errors > 0 ? <AlertCircle size={12} /> : undefined}
      />
      <MetaItem label="Critical path" value={String(criticalPathCount)} />
      <MetaItem label="Linked logs" value={String(linkedLogsCount)} />
      {startMs && startMs > 0 ? <MetaItem label="Start" value={new Date(startMs).toISOString().replace("T", " ").slice(0, 19)} /> : null}
      <RetentionWarning startMs={startMs} />
    </div>
  );
}

/** Shows a warning when the trace is approaching the 30-day retention horizon. */
function RetentionWarning({ startMs }: { startMs?: number }) {
  if (!startMs || startMs <= 0) return null;
  const ageDays = Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24));
  if (ageDays < 25) return null;
  const tone = ageDays >= 30 ? "#e8494d" : "#e0b400";
  return (
    <span
      className="ml-auto flex items-center gap-1 rounded px-2 py-0.5 text-[11px]"
      style={{ backgroundColor: `${tone}22`, color: tone }}
      title="Traces are retained for 30 days."
    >
      {ageDays}d old · retention {Math.max(0, 30 - ageDays)}d left
    </span>
  );
}

function TraceIdCopy({ traceId }: { traceId: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(traceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }, [traceId]);
  return (
    <button
      type="button"
      onClick={onCopy}
      className="flex items-center gap-1.5 rounded bg-[var(--bg-secondary)] px-2 py-0.5 font-mono text-[11px] hover:bg-[var(--bg-tertiary,var(--bg-secondary))]"
      title={traceId}
    >
      <span className="text-[var(--text-muted)]">trace</span>
      <span>{traceId.slice(0, 12)}…</span>
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function MetaItem({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone?: "error";
  icon?: React.ReactNode;
}) {
  const color = tone === "error" ? "#e8494d" : undefined;
  return (
    <span className="flex items-center gap-1.5 text-[12px]" style={{ color }}>
      {icon}
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-semibold" style={{ color }}>{value}</span>
    </span>
  );
}

export const TraceMetaBar = memo(TraceMetaBarComponent);
