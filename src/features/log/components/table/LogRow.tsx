import { ChevronDown, ChevronRight } from "lucide-react";
import { memo, useCallback } from "react";

import { useTimezone } from "@/app/store/appStore";

import type { LogRecord } from "../../types/log";
import { severityStyle } from "../../utils/severity";
import { useLogsExplorerStore } from "../../store/logsExplorerStore";
import { ExpandedLogRow } from "./ExpandedLogRow";
import { LogBodyCell } from "./LogBodyCell";

interface Props {
  readonly row: LogRecord;
  readonly searchTerm?: string;
  readonly isSelected?: boolean;
  readonly onClick?: (row: LogRecord) => void;
  readonly onContextMenu?: (row: LogRecord, x: number, y: number) => void;
}

function formatTs(ts: string, tz: string): string {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const opts: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      fractionalSecondDigits: 3,
    };
    if (tz !== "local") opts.timeZone = tz;
    return new Intl.DateTimeFormat("sv-SE", opts).format(d);
  } catch {
    return ts;
  }
}

function LogRowComponent({ row, searchTerm, isSelected, onClick, onContextMenu }: Props) {
  const expanded = useLogsExplorerStore((s) => s.expandedRows.has(row.id));
  const toggleExpanded = useLogsExplorerStore((s) => s.toggleRowExpanded);
  const wrapLines = useLogsExplorerStore((s) => s.wrapLines);
  const density = useLogsExplorerStore((s) => s.density);
  const sev = severityStyle(row.severity_bucket);
  const tz = useTimezone();

  const handleClick = useCallback(() => onClick?.(row), [onClick, row]);
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (onContextMenu) {
        e.preventDefault();
        onContextMenu(row, e.clientX, e.clientY);
      }
    },
    [onContextMenu, row]
  );
  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleExpanded(row.id);
    },
    [toggleExpanded, row.id]
  );

  const py = density === "compact" ? "py-1" : "py-2";
  const fontSize = density === "compact" ? "text-[11px]" : "text-[12px]";

  return (
    <div
      className={`border-b border-[var(--border-color)] transition-colors hover:bg-[var(--bg-hover)] ${
        isSelected ? "ring-1 ring-inset ring-[var(--color-primary)]" : ""
      }`}
    >
      {/* Main row */}
      <div
        className={`flex cursor-pointer items-start gap-2 px-2 ${py}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Expand toggle */}
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
          aria-label={expanded ? "Collapse row" : "Expand row"}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Timestamp */}
        <span className={`w-[180px] shrink-0 font-mono ${fontSize} text-[var(--text-muted)] leading-5`}>
          {formatTs(row.timestamp, tz)}
        </span>

        {/* Service */}
        <span className={`w-[140px] shrink-0 truncate font-medium ${fontSize} leading-5 text-[var(--text-primary)]`}>
          {row.service_name}
        </span>

        {/* Severity badge */}
        <span
          className="inline-flex h-5 w-[52px] shrink-0 items-center justify-center gap-1 rounded-sm font-mono font-semibold text-[10px] uppercase"
          style={{
            backgroundColor: `${sev.color}18`,
            border: `1px solid ${sev.color}55`,
            color: sev.color,
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: sev.color }}
          />
          {sev.shortLabel}
        </span>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <LogBodyCell body={row.body} searchTerm={searchTerm} wrapLines={wrapLines} />
        </div>
      </div>

      {/* Expanded content */}
      {expanded ? <ExpandedLogRow row={row} /> : null}
    </div>
  );
}

export const LogRow = memo(LogRowComponent);
