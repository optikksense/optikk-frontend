import { memo, type ReactNode } from "react";

import type { ColumnConfig } from "@features/explorer/types";

import { LOG_COLUMN_META } from "../config/columns";
import type { LogRecord } from "../types/log";
import { severityStyle } from "../utils/severity";
import LogBodyCell from "./LogBodyCell";
import LogSeverityBadge from "./LogSeverityBadge";

interface Props {
  readonly row: LogRecord;
  readonly columns: readonly ColumnConfig[];
  readonly selected?: boolean;
  readonly onClick: (row: LogRecord) => void;
}

function formatTs(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toISOString().replace("T", " ").slice(0, 23)}Z`;
}

function renderCell(row: LogRecord, key: string): ReactNode {
  switch (key) {
    case "timestamp":
      return <span className="font-mono text-[11px] text-[var(--text-muted)]">{formatTs(row.timestamp)}</span>;
    case "service":
      return <span className="truncate text-[12px] text-[var(--text-primary)]">{row.service_name}</span>;
    case "severity":
      return <LogSeverityBadge bucket={row.severity_bucket} compact />;
    case "severity_bucket":
      return <span className="font-mono text-[12px]">{row.severity_bucket}</span>;
    case "body":
      return <LogBodyCell body={row.body} />;
    case "observed_timestamp":
      return (
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {row.observed_timestamp ? formatTs(row.observed_timestamp) : "—"}
        </span>
      );
    default: {
      const value = (row as unknown as Record<string, unknown>)[key];
      if (value == null || value === "") return <span className="text-[var(--text-muted)]">—</span>;
      return <span className="truncate text-[12px] text-[var(--text-primary)]">{String(value)}</span>;
    }
  }
}

/**
 * One row in the virtualized list. Column order + visibility is driven by
 * the ExplorerColumns config; the left border echoes severity so error-only
 * scroll is visible at a glance.
 */
export const LogRow = memo(function LogRow({ row, columns, selected, onClick }: Props) {
  const stripe = severityStyle(row.severity_bucket).color;
  return (
    <div
      role="row"
      onClick={() => onClick(row)}
      className={`flex h-8 cursor-pointer items-center gap-3 border-b border-[var(--border-color)] px-3 hover:bg-[rgba(255,255,255,0.03)] ${selected ? "bg-[rgba(255,255,255,0.05)]" : ""}`}
      style={{ borderLeft: `2px solid ${stripe}` }}
    >
      {columns
        .filter((column) => column.visible)
        .map((column) => {
          const meta = LOG_COLUMN_META[column.key];
          const width = column.width ?? meta?.width;
          return (
            <div
              key={column.key}
              role="cell"
              className="flex min-w-0 items-center"
              style={width ? { width, flex: "0 0 auto" } : { flex: "1 1 auto", minWidth: 0 }}
            >
              {renderCell(row, column.key)}
            </div>
          );
        })}
    </div>
  );
});

export default LogRow;
