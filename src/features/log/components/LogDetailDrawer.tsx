import { DetailAttributesTab } from "@/features/explorer/components/detail/DetailAttributesTab";
import type {
  AttributeGroup,
  AttributeRow,
} from "@/features/explorer/components/detail/DetailAttributesTab";
import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";
import { Button } from "@shared/components/primitives/ui";
import { useQuery } from "@tanstack/react-query";

import { getLogById } from "../api/logsExplorerApi";
import type { LogRecord } from "../types/log";
import { severityColor, severityStyle } from "../utils/severity";

import LogDetailCorrelationsTab from "./LogDetailCorrelationsTab";

interface Props {
  readonly logId: string;
  readonly onClose: () => void;
}

function buildAttributeGroups(log: LogRecord): AttributeGroup[] {
  const groups: AttributeGroup[] = [];
  const standard: AttributeRow[] = [];
  const push = (key: string, value: string | undefined | null): void => {
    if (value === undefined || value === null || value === "") return;
    standard.push({ key, value });
  };

  push("timestamp", log.timestamp);
  push("observed_timestamp", log.observed_timestamp);
  push("severity_text", log.severity_text);
  push("severity_bucket", String(log.severity_bucket));
  push("service_name", log.service_name);
  push("scope_name", log.scope_name);
  push("scope_version", log.scope_version);
  push("host", log.host);
  push("pod", log.pod);
  push("container", log.container);
  push("environment", log.environment);

  if (standard.length > 0) {
    groups.push({ label: "Standard fields", rows: standard });
  }

  const attrRows: AttributeRow[] = [];
  for (const [k, v] of Object.entries(log.attributes_string ?? {})) {
    attrRows.push({ key: k, value: v });
  }
  for (const [k, v] of Object.entries(log.attributes_number ?? {})) {
    attrRows.push({ key: k, value: String(v) });
  }
  for (const [k, v] of Object.entries(log.attributes_bool ?? {})) {
    attrRows.push({ key: k, value: v ? "true" : "false" });
  }
  attrRows.sort((a, b) => a.key.localeCompare(b.key));
  if (attrRows.length > 0) {
    groups.push({ label: "Custom attributes", rows: attrRows });
  }

  if (log.resource && Object.keys(log.resource).length > 0) {
    groups.push({
      label: "Resource (JSON)",
      rows: [{ key: "resource", value: JSON.stringify(log.resource, null, 2) }],
    });
  }

  return groups;
}

function formatHeaderTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  } catch {
    return iso;
  }
}

function shortId(id: string): string {
  if (id.length <= 24) return id;
  return `${id.slice(0, 12)}…${id.slice(-8)}`;
}

/**
 * Log detail body: fetches `GET /api/v1/logs/:id` and renders a Datadog-style
 * drawer (message hero, severity/service header, trace correlation, field tables).
 */
export default function LogDetailDrawer({ logId, onClose }: Props) {
  const q = useQuery({
    queryKey: ["logs", "detail", logId],
    queryFn: () => getLogById(logId),
    enabled: Boolean(logId),
    staleTime: 30_000,
  });

  if (q.isPending) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-[13px] text-[var(--text-muted)]">
        Loading log…
      </div>
    );
  }

  if (q.isError) {
    const msg = formatErrorForDisplay(q.error);
    return (
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="font-medium text-[13px] text-[var(--color-error,#ef4444)]">
          Could not load log
        </p>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words rounded border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 font-mono text-[11px] text-[var(--text-muted)]">
          {msg}
        </pre>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => void q.refetch()}>
            Retry
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  const log = q.data?.log;
  if (!log) {
    return (
      <div className="p-4 text-[13px] text-[var(--text-muted)]">
        No log data.
        <Button type="button" variant="secondary" className="ml-2" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  const sev = severityStyle(log.severity_bucket);
  const groups = buildAttributeGroups(log);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 space-y-3 border-[var(--border-color)] border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded px-1.5 py-0.5 font-semibold text-[10px] uppercase"
            style={{
              backgroundColor: `${severityColor(log.severity_bucket)}22`,
              color: severityColor(log.severity_bucket),
            }}
          >
            {sev.shortLabel}
          </span>
          <span className="font-semibold text-[13px] text-[var(--text-primary)]">
            {log.service_name}
          </span>
          <span className="text-[12px] text-[var(--text-muted)]">
            {formatHeaderTime(log.timestamp)}
          </span>
        </div>
        <p className="font-mono text-[10px] text-[var(--text-tertiary)]" title={logId}>
          {shortId(logId)}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
        <section>
          <h3 className="mb-2 font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wide">
            Message
          </h3>
          <div className="rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] p-3">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] text-[var(--text-primary)] leading-relaxed">
              {log.body || "—"}
            </pre>
          </div>
        </section>

        <section>
          <h3 className="mb-2 font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wide">
            Trace correlation
          </h3>
          <div className="rounded-md border border-[var(--border-color)]">
            <LogDetailCorrelationsTab row={log} />
          </div>
        </section>

        {groups.length > 0 ? (
          <section>
            <h3 className="mb-2 font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wide">
              Fields
            </h3>
            <DetailAttributesTab groups={groups} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
