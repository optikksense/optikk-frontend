import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, ChevronRight, GitFork } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

import { HighlightedText } from "@shared/components/primitives/HighlightedText";

import { useTimezone } from "@/app/store/appStore";

import { useLogsExplorerStore } from "../../store/logsExplorerStore";
import type { LogRecord } from "../../types/log";
import { serviceSwatchColor } from "../../utils/serviceHue";
import { severityStyle } from "../../utils/severity";
import { getTraceId } from "../../utils/traceCorrelation";
import { ExpandedLogRow } from "./ExpandedLogRow";

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
  const navigate = useNavigate();
  const expanded = useLogsExplorerStore((s) => s.expandedRows.has(row.id));
  const toggleExpanded = useLogsExplorerStore((s) => s.toggleRowExpanded);
  const sev = severityStyle(row.severity_bucket);
  const tz = useTimezone();
  const traceId = getTraceId(row);

  // Collapse newlines so load-generator separators / multi-line bodies stay
  // on a single row, and surface a visible placeholder for empty bodies so
  // the row keeps a stable visual presence.
  const displayBody = useMemo(() => {
    const collapsed = (row.body ?? "").replace(/\s*\n\s*/g, " ⏎ ").trim();
    return collapsed.length > 0 ? collapsed : "(empty)";
  }, [row.body]);

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

  const handleTrace = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!traceId) return;
      navigate({ to: `/traces/${encodeURIComponent(traceId)}` });
    },
    [navigate, traceId]
  );

  return (
    <>
      <div
        className={`ok-tr l-${sev.slug} ${isSelected ? "is-sel" : ""}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleClick();
        }}
      >
        <button
          type="button"
          onClick={handleToggle}
          className="ok-tr-x"
          aria-label={expanded ? "Collapse row" : "Expand row"}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        <span className="ok-tr-t">{formatTs(row.timestamp, tz)}</span>

        <span className="ok-tr-svc">
          <span
            className="ok-tr-svc-d"
            style={{ background: serviceSwatchColor(row.service_name) }}
          />
          {row.service_name}
        </span>

        <span>
          <span className={`ok-lvl l-${sev.slug}`}>
            <span className="ok-lvl-d" />
            {sev.shortLabel}
          </span>
        </span>

        <span className="ok-tr-msg">
          <span
            className="ok-tr-msg-t"
            style={row.body ? undefined : { color: "var(--fg-3)", fontStyle: "italic" }}
          >
            <HighlightedText text={displayBody} match={searchTerm} />
          </span>
          {traceId ? (
            <button
              type="button"
              onClick={handleTrace}
              className="ok-tr-trace"
              title={`Open trace ${traceId}`}
            >
              <GitFork size={10} />
              trace
              <ArrowRight size={10} />
            </button>
          ) : null}
        </span>
      </div>
      {expanded ? <ExpandedLogRow row={row} /> : null}
    </>
  );
}

export const LogRow = memo(LogRowComponent);
