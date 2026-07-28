import { ChevronRight } from "lucide-react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import { formatDuration, formatNumber, formatRelativeTime } from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";

import type { InfrastructureNode } from "../types";
import { STATUS_COLOR, errorRateColor, trafficStatus } from "./tableCells";

const PAGE_SIZE = 10;

interface InfraHostsTableProps {
  readonly nodes: readonly InfrastructureNode[];
  readonly onOpenNode: (host: string) => void;
}

const COLUMNS: ColumnDef<InfrastructureNode>[] = [
  {
    header: "Host",
    accessorKey: "host",
    size: 220,
    cell: ({ row: { original: n } }) => (
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: STATUS_COLOR[trafficStatus(n.errorRate)] }}
        />
        <div className="font-medium font-mono text-[13px] text-foreground">{n.host}</div>
      </div>
    ),
  },
  {
    header: "Services",
    accessorKey: "services",
    cell: ({ row: { original: n } }) => (
      <>
        <div className="font-mono text-[13px] text-foreground">
          {n.services.length > 0 ? n.services.join(", ") : "—"}
        </div>
        {n.podCount > 0 && (
          <div className="text-[11.5px] text-foreground-muted">{n.podCount} pods</div>
        )}
      </>
    ),
  },
  {
    header: "Requests",
    accessorKey: "requestCount",
    size: 110,
    cell: ({ row: { original: n } }) => (
      <span className="font-mono text-[12.5px] text-foreground-muted">
        {formatNumber(n.requestCount)}
      </span>
    ),
  },
  {
    header: "Error rate",
    accessorKey: "errorRate",
    size: 100,
    cell: ({ row: { original: n } }) => (
      <span
        className="font-mono font-semibold text-[12.5px]"
        style={{ color: errorRateColor(n.errorRate) }}
      >
        {n.errorRate.toFixed(n.errorRate >= 10 ? 0 : 1)}%
      </span>
    ),
  },
  {
    header: "p95",
    accessorKey: "p95LatencyMs",
    size: 90,
    cell: ({ row: { original: n } }) => (
      <span className="font-mono text-[12.5px] text-foreground-muted">
        {formatDuration(n.p95LatencyMs)}
      </span>
    ),
  },
  {
    header: "Last seen",
    accessorKey: "lastSeen",
    size: 110,
    cell: ({ row: { original: n } }) => (
      <span className="font-mono text-[12px] text-foreground-muted">
        {formatRelativeTime(n.lastSeen)}
      </span>
    ),
  },
  {
    id: "open",
    header: "",
    size: 24,
    cell: () => <ChevronRight size={13} className="text-foreground-muted" />,
  },
];

export function InfraHostsTable({ nodes, onOpenNode }: InfraHostsTableProps) {
  return (
    <DataTable
      data={{ columns: COLUMNS, rows: [...nodes] }}
      pagination={{ pageSize: PAGE_SIZE }}
      config={{
        onRow: (n) => ({
          onClick: () => onOpenNode(n.host),
          onKeyDown: (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenNode(n.host);
            }
          },
          tabIndex: 0,
          className: "cursor-pointer transition-colors hover:bg-muted/40",
        }),
      }}
    />
  );
}
