import { Copy, ExternalLink, X } from "lucide-react";
import { memo, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";
import { Button } from "@shared/components/primitives/ui";

import { getLogById } from "../../api/logsExplorerApi";
import type { LogRecord } from "../../types/log";
import { severityColor, severityStyle } from "../../utils/severity";
import { tryParseJson } from "../../utils/jsonDetect";
import { JsonTreeView } from "../table/JsonTreeView";

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

function shortId(id: string): string {
  if (id.length <= 20) return id;
  return `${id.slice(0, 10)}…${id.slice(-8)}`;
}

/** Full log detail slide-over panel — single unified view with all sections. */
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
      <div className="flex h-full items-center justify-center text-[13px] text-[var(--text-muted)]">
        Loading log…
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <p className="font-medium text-[13px] text-[var(--color-error)]">Could not load log</p>
        <pre className="text-[11px] text-[var(--text-muted)]">{formatErrorForDisplay(q.error)}</pre>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void q.refetch()}>Retry</Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const log = q.data?.log;
  if (!log) return <div className="p-4 text-[var(--text-muted)]">No data</div>;

  const sev = severityStyle(log.severity_bucket);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--border-color)] px-5 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="rounded-md px-2 py-0.5 font-mono font-bold text-[11px] uppercase"
              style={{ backgroundColor: `${severityColor(log.severity_bucket)}22`, color: severityColor(log.severity_bucket) }}
            >
              {sev.shortLabel}
            </span>
            <div>
              <div className="font-semibold text-[15px] text-[var(--text-primary)]">{log.service_name}</div>
              <div className="text-[12px] text-[var(--text-muted)]">{formatTime(log.timestamp)}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(log.body)}
              className="flex h-7 items-center gap-1 rounded px-2 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <Copy size={12} /> Copy
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]" title={logId}>{shortId(logId)}</p>
      </div>

      {/* Unified content — all sections stacked */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Message */}
        <MessageSection log={log} />

        {/* Correlation (trace/span) — shown near top for quick access */}
        {(log.trace_id || log.span_id) ? (
          <CorrelationSection log={log} navigate={navigate} />
        ) : null}

        {/* Fields */}
        <FieldsSection log={log} />

        {/* JSON tree (only when body is valid JSON) */}
        <JsonSection log={log} />
      </div>

      {/* Nav footer */}
      {(onPrev || onNext) ? (
        <div className="flex items-center justify-end gap-1 border-t border-[var(--border-color)] px-4 py-2">
          <button
            type="button"
            disabled={!onPrev}
            onClick={onPrev}
            className="rounded px-2 py-1 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={!onNext}
            onClick={onNext}
            className="rounded px-2 py-1 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      ) : null}
    </div>
  );
}

/* ─── Section components ────────────────────────────────────────────── */

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mb-2 font-semibold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
      {title}
    </h3>
  );
}

function SectionDivider() {
  return <div className="border-t border-[var(--border-color)]" />;
}

function MessageSection({ log }: { log: LogRecord }) {
  return (
    <div>
      <SectionHeader title="Message" />
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] p-4 font-mono text-[12px] text-[var(--text-primary)] leading-relaxed">
        {log.body || "—"}
      </pre>
    </div>
  );
}

function CorrelationSection({ log, navigate }: { log: LogRecord; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <>
      <SectionDivider />
      <div>
        <SectionHeader title="Correlation" />
        <div className="overflow-hidden rounded-md border border-[var(--border-color)]">
          {log.trace_id ? (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-[var(--bg-inset)]">
              <span className="w-[140px] shrink-0 text-[11px] font-medium text-[var(--text-muted)]">trace_id</span>
              <button
                type="button"
                onClick={() => navigate({ to: `/traces/${encodeURIComponent(log.trace_id ?? "")}` })}
                className="flex items-center gap-1 min-w-0 flex-1 font-mono text-[12px] text-[var(--color-primary)] hover:underline"
              >
                <span className="truncate">{log.trace_id}</span>
                <ExternalLink size={10} className="shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(log.trace_id ?? "")}
                className="shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--text-primary)] [div:hover>&]:opacity-100"
              >
                <Copy size={10} />
              </button>
            </div>
          ) : null}
          {log.span_id ? (
            <div className={`flex items-center gap-3 px-3 py-1.5 ${log.trace_id ? "" : "bg-[var(--bg-inset)]"}`}>
              <span className="w-[140px] shrink-0 text-[11px] font-medium text-[var(--text-muted)]">span_id</span>
              <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--text-primary)]">{log.span_id}</span>
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(log.span_id ?? "")}
                className="shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--text-primary)] [div:hover>&]:opacity-100"
              >
                <Copy size={10} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function FieldsSection({ log }: { log: LogRecord }) {
  const fields: [string, string][] = (
    [
      ["timestamp", log.timestamp],
      ["service_name", log.service_name],
      ["severity_text", log.severity_text ?? ""],
      ["host", log.host ?? ""],
      ["pod", log.pod ?? ""],
      ["container", log.container ?? ""],
      ["environment", log.environment ?? ""],
      ["scope_name", log.scope_name ?? ""],
    ] as [string, string][]
  ).filter(([, v]) => v !== "");

  const attrs: [string, string][] = [
    ...Object.entries(log.attributes_string ?? {}),
    ...Object.entries(log.attributes_number ?? {}).map(([k, v]) => [k, String(v)] as [string, string]),
    ...Object.entries(log.attributes_bool ?? {}).map(([k, v]) => [k, v ? "true" : "false"] as [string, string]),
  ].sort(([a], [b]) => a.localeCompare(b));

  return (
    <>
      <SectionDivider />
      <div className="space-y-4">
        <FieldGroup title="Standard Fields" rows={fields} />
        {attrs.length > 0 ? <FieldGroup title="Custom Attributes" rows={attrs} /> : null}
      </div>
    </>
  );
}

function FieldGroup({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div>
      <SectionHeader title={title} />
      <div className="overflow-hidden rounded-md border border-[var(--border-color)]">
        {rows.map(([key, value], i) => (
          <div
            key={key}
            className={`flex items-center gap-3 px-3 py-1.5 ${i % 2 === 0 ? "bg-[var(--bg-inset)]" : ""}`}
          >
            <span className="w-[140px] shrink-0 text-[11px] font-medium text-[var(--text-muted)]">{key}</span>
            <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--text-primary)]">{value}</span>
            <button
              type="button"
              onClick={() => void navigator.clipboard.writeText(value)}
              className="shrink-0 text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--text-primary)] [div:hover>&]:opacity-100"
            >
              <Copy size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function JsonSection({ log }: { log: LogRecord }) {
  const parsed = useMemo(() => tryParseJson(log.body), [log.body]);
  if (!parsed) return null;

  return (
    <>
      <SectionDivider />
      <div>
        <SectionHeader title="Parsed JSON" />
        <div className="rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] p-3">
          <JsonTreeView data={parsed} />
        </div>
      </div>
    </>
  );
}

export const LogDetailPanel = memo(LogDetailPanelComponent);
