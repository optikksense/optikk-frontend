import type { ColumnDef } from "@/features/explorer/types/results";
import { HighlightedText } from "@shared/components/primitives/HighlightedText";

import type { LogRecord } from "../../types/log";
import { severityColor, severityStyle } from "../../utils/severity";

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
      width: 220,
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {formatTs(row.timestamp)}
        </span>
      ),
    },
    {
      key: "service",
      label: "SERVICE",
      width: 160,
      render: (row) => <span className="truncate text-sm">{row.service_name}</span>,
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
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {row.severity_bucket}
        </span>
      ),
    },
    {
      key: "host",
      label: "HOST",
      width: 160,
      render: (row) => <span className="truncate text-xs">{row.host ?? ""}</span>,
    },
    {
      key: "pod",
      label: "Pod",
      width: 160,
      render: (row) => <span className="truncate text-xs">{row.pod ?? ""}</span>,
    },
    {
      key: "container",
      label: "Container",
      width: 140,
      render: (row) => <span className="truncate text-xs">{row.container ?? ""}</span>,
    },
    {
      key: "environment",
      label: "Env",
      width: 100,
      render: (row) => <span className="truncate text-xs">{row.environment ?? ""}</span>,
    },
    {
      key: "body",
      label: "MESSAGE",
      render: (row) => (
        <HighlightedText className="truncate text-sm" text={row.body} match={searchTerm} />
      ),
    },
    {
      key: "trace_id",
      label: "Trace",
      width: 140,
      render: (row) => (
        <span className="truncate font-mono text-xs text-[var(--text-tertiary)]">
          {(row.trace_id ?? "").slice(0, 12)}
        </span>
      ),
    },
  ];
}

function SeverityBadge({ bucket }: { bucket: number }) {
  const style = severityStyle(bucket);
  // Solid background badge — high visibility, matching reference design.
  // Warn/Error/Fatal get white text; Trace/Debug/Info get dark text.
  const textColor = bucket >= 3 ? "#fff" : "#111";
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold"
      style={{ backgroundColor: severityColor(bucket), color: textColor }}
    >
      [{style.shortLabel}]
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
