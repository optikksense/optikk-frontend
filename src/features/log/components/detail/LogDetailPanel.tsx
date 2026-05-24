import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Copy, GitFork, Link2, X } from "lucide-react";
import { memo, useMemo } from "react";
import toast from "react-hot-toast";

import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";
import { Button } from "@shared/components/primitives/ui";

import { getLogById } from "../../api/logsExplorerApi";
import type { LogRecord } from "../../types/log";
import { serviceSwatchColor } from "../../utils/serviceHue";
import { severityStyle } from "../../utils/severity";
import { getSpanId, getTraceId } from "../../utils/traceCorrelation";

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
      <aside className="ok-detail">
        <div style={{ padding: 16, color: "var(--fg-3)", fontSize: 13 }}>Loading log…</div>
      </aside>
    );
  }

  if (q.isError) {
    return (
      <aside className="ok-detail">
        <p style={{ fontWeight: 500, fontSize: 13, color: "var(--err-c)" }}>Could not load log</p>
        <pre style={{ fontSize: 11, color: "var(--fg-3)" }}>{formatErrorForDisplay(q.error)}</pre>
        <div style={{ display: "flex", gap: 6 }}>
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
      <aside className="ok-detail">
        <div style={{ padding: 12, color: "var(--fg-3)" }}>No data</div>
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
    <aside className="ok-detail">
      <div className="ok-detail-h">
        <span className="ok-detail-svc">
          <span
            className="ok-tr-svc-d"
            style={{ background: serviceSwatchColor(log.service_name) }}
          />
          {log.service_name}
        </span>
        <span className={`ok-lvl l-${sev.slug}`}>
          <span className="ok-lvl-d" />
          {sev.shortLabel}
        </span>
        <span className="ok-detail-sp" />
        <button
          type="button"
          className="ok-ib"
          title="Copy JSON"
          onClick={() => void navigator.clipboard.writeText(JSON.stringify(log, null, 2))}
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          className="ok-ib"
          title="Permalink"
          onClick={() => void navigator.clipboard.writeText(window.location.href)}
        >
          <Link2 size={14} />
        </button>
        <button type="button" className="ok-ib" title="Close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>

      <div className="ok-detail-msg">{log.body || "—"}</div>

      <div className="ok-detail-meta">
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
        <div className="ok-callout">
          <div className="ok-callout-h">
            <GitFork size={12} />
            Correlated with a distributed trace
          </div>
          <div className="ok-callout-id">{traceId}</div>
          {spanId ? (
            <div className="ok-callout-id" style={{ color: "var(--fg-3)" }}>
              span_id · {spanId}
            </div>
          ) : null}
          <div className="ok-callout-a">
            <button
              type="button"
              className="ok-btn-sm is-pri"
              onClick={() => navigate({ to: `/traces/${encodeURIComponent(traceId)}` })}
            >
              Open trace
            </button>
            <button
              type="button"
              className="ok-btn-sm"
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
        <div className="ok-callout ok-callout-empty">
          <div className="ok-callout-h">
            <GitFork size={12} />
            No trace correlation
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-3)" }}>
            This log was not emitted with a trace_id. Instrument the emitter to stitch it to a
            distributed trace.
          </div>
        </div>
      )}

      <div className="ok-detail-sect-t">Fields</div>
      <div className="ok-fields">
        {allFields.map(([k, v]) => (
          <FieldRow key={k} field={k} value={v} />
        ))}
      </div>

      {onPrev || onNext ? (
        <div className="ok-detail-actions">
          <button
            type="button"
            disabled={!onPrev}
            onClick={onPrev}
            className="ok-btn-sm"
            style={{ flex: 1, justifyContent: "center" }}
          >
            ← Prev
          </button>
          <button
            type="button"
            disabled={!onNext}
            onClick={onNext}
            className="ok-btn-sm"
            style={{ flex: 1, justifyContent: "center" }}
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
    <div className={`ok-kv ${isErr ? "is-err" : ""}`}>
      <span className="ok-kv-k">{field}</span>
      <span className="ok-kv-v" title={value}>
        {value}
      </span>
      <button type="button" className="ok-kv-c" title="Copy" onClick={onCopy}>
        +
      </button>
    </div>
  );
}

export const LogDetailPanel = memo(LogDetailPanelComponent);
