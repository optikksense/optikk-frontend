// Shared cells and column builders for the infrastructure tables (hosts,
// containers, services). Every one of these tables renders the same RED
// columns, so they are defined once here rather than per table.

import { ChevronRight } from "lucide-react";

import { fmtMs, formatNumber, formatRelativeTime } from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";

import { type NodeHealthTier, tierForErrorRate } from "../utils/nodeHealth";

const DOT_COLOR: Record<NodeHealthTier, string> = {
  healthy: "var(--ok)",
  degraded: "var(--warn)",
  unhealthy: "var(--err)",
};

const RATE_COLOR: Record<NodeHealthTier, string> = {
  healthy: "var(--fg-1)",
  degraded: "var(--warn-fg)",
  unhealthy: "var(--err)",
};

/** Percentages get more precision the smaller they are, so 0.01% stays 0.01%. */
function formatErrorRate(errorRate: number): string {
  const digits = errorRate >= 10 ? 0 : errorRate >= 1 ? 1 : 2;
  return `${errorRate.toFixed(digits)}%`;
}

interface EntityNameCellProps {
  readonly name: string;
  readonly sublabel?: string;
  /** Drives the traffic-status dot. */
  readonly errorRate: number;
}

/** Primary identity cell: traffic dot, mono name, optional muted sublabel. */
export function EntityNameCell({ name, sublabel, errorRate }: EntityNameCellProps): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: DOT_COLOR[tierForErrorRate(errorRate)] }}
      />
      <div className="min-w-0">
        <div className="truncate font-medium font-mono text-[13px] text-foreground">{name}</div>
        {sublabel !== undefined && (
          <div className="truncate font-mono text-[11.5px] text-foreground-muted">{sublabel}</div>
        )}
      </div>
    </div>
  );
}

export function numericColumn<T>(
  header: string,
  pick: (row: T) => number,
  size = 110
): ColumnDef<T> {
  return {
    id: header,
    header,
    accessorFn: pick,
    size,
    meta: { align: "right" },
    cell: ({ row: { original } }) => (
      <span className="font-mono text-[12.5px] text-foreground-muted">
        {formatNumber(pick(original))}
      </span>
    ),
  };
}

export function errorRateColumn<T>(
  header: string,
  pick: (row: T) => number,
  size = 100
): ColumnDef<T> {
  return {
    id: header,
    header,
    accessorFn: pick,
    size,
    meta: { align: "right" },
    cell: ({ row: { original } }) => (
      <span
        className="font-mono font-semibold text-[12.5px]"
        style={{ color: RATE_COLOR[tierForErrorRate(pick(original))] }}
      >
        {formatErrorRate(pick(original))}
      </span>
    ),
  };
}

export function latencyColumn<T>(
  header: string,
  pick: (row: T) => number,
  size = 100
): ColumnDef<T> {
  return {
    id: header,
    header,
    accessorFn: pick,
    size,
    meta: { align: "right" },
    cell: ({ row: { original } }) => (
      <span className="font-mono text-[12.5px] text-foreground-muted">{fmtMs(pick(original))}</span>
    ),
  };
}

export function lastSeenColumn<T>(pick: (row: T) => string, size = 110): ColumnDef<T> {
  return {
    id: "Last seen",
    header: "Last seen",
    accessorFn: pick,
    size,
    cell: ({ row: { original } }) => (
      <span className="font-mono text-[12px] text-foreground-muted">
        {formatRelativeTime(pick(original))}
      </span>
    ),
  };
}

export function chevronColumn<T>(): ColumnDef<T> {
  return {
    id: "open",
    header: "",
    size: 24,
    cell: () => <ChevronRight size={13} className="text-foreground-muted" />,
  };
}

/** `config.onRow` props that make a row behave as a link to `onOpen`. */
export function clickableRow<T>(
  onOpen: (row: T) => void
): (record: T) => React.HTMLAttributes<HTMLTableRowElement> {
  return (record) => ({
    onClick: () => onOpen(record),
    onKeyDown: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen(record);
      }
    },
    tabIndex: 0,
    className: "cursor-pointer transition-colors hover:bg-muted/40",
  });
}
