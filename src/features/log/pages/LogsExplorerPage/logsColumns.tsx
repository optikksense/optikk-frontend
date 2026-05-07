import type { ColumnDef } from "@/features/explorer/types/results";
import { HighlightedText } from "@shared/components/primitives/HighlightedText";

import type { LogRecord } from "../../types/log";
import { severityStyle } from "../../utils/severity";

/**
 * Factory for the typed log column defs. Pass the active free-text search
 * term so the body cell can underline matches inline (Datadog parity).
 * Keys match `DEFAULT_LOG_COLUMNS` / `ALL_LOG_COLUMNS` so toggling via
 * `useExplorerColumns` keeps working.
 */
export function buildLogColumns(searchTerm: string | undefined): readonly ColumnDef<LogRecord>[] {
  return [
    {
      key: "timestamp",
      label: "TIMESTAMP",
      width: 210,
      render: (row) => (
        <span className="font-mono text-[12px] text-[var(--text-secondary)] leading-5">
          {formatTs(row.timestamp)}
        </span>
      ),
    },
    {
      key: "service",
      label: "SERVICE",
      width: 150,
      render: (row) => (
        <span className="truncate font-medium text-[13px] text-[var(--text-primary)]">
          {row.service_name}
        </span>
      ),
    },
    {
      key: "severity",
      label: "SEVERITY",
      width: 84,
      render: (row) => <SeverityBadge bucket={row.severity_bucket} />,
    },
    {
      key: "severity_bucket",
      label: "Severity #",
      width: 90,
      render: (row) => (
        <span className="font-mono text-[var(--text-secondary)] text-xs">
          {row.severity_bucket}
        </span>
      ),
    },
    {
      key: "host",
      label: "HOST",
      width: 140,
      render: (row) => (
        <span className="truncate font-mono text-[12px] text-[var(--text-secondary)]">
          {row.host ?? ""}
        </span>
      ),
    },
    {
      key: "pod",
      label: "Pod",
      width: 160,
      render: (row) => <span className="truncate text-[12px]">{row.pod ?? ""}</span>,
    },
    {
      key: "container",
      label: "Container",
      width: 140,
      render: (row) => <span className="truncate text-[12px]">{row.container ?? ""}</span>,
    },
    {
      key: "environment",
      label: "Env",
      width: 100,
      render: (row) => <span className="truncate text-[12px]">{row.environment ?? ""}</span>,
    },
    {
      key: "body",
      label: "MESSAGE",
      render: (row) => (
        <HighlightedText
          className="truncate font-mono text-[13px] text-[var(--text-primary)] leading-5"
          text={row.body}
          match={searchTerm}
        />
      ),
    },
    {
      key: "trace_id",
      label: "Trace",
      width: 140,
      render: (row) => (
        <span className="truncate font-mono text-[12px] text-[var(--text-muted)]">
          {(row.trace_id ?? "").slice(0, 12)}
        </span>
      ),
    },
  ];
}

function SeverityBadge({ bucket }: { bucket: number }) {
  const style = severityStyle(bucket);
  return (
    <span
      className="inline-flex h-5 items-center gap-1.5 rounded-sm px-1.5 font-mono font-semibold text-[11px] uppercase leading-5"
      style={{
        backgroundColor: `${style.color}18`,
        border: `1px solid ${style.color}55`,
        color: style.color,
      }}
      title={style.label}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {style.shortLabel}
    </span>
  );
}

function formatTs(ts: string): string {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    // Full datetime: YYYY-MM-DD HH:mm:ss.SSS
    const iso = d.toISOString();
    return `${iso.slice(0, 10)} ${iso.slice(11, 23)}`;
  } catch {
    return ts;
  }
}
