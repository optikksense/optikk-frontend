import DataTable from "@shared/components/ui/data-display/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

import type { InfrastructureNode } from "../types";
import {
  EntityNameCell,
  chevronColumn,
  clickableRow,
  errorRateColumn,
  lastSeenColumn,
  latencyColumn,
  numericColumn,
} from "./tableCells";

const PAGE_SIZE = 10;

interface InfraHostsTableProps {
  readonly nodes: readonly InfrastructureNode[];
  readonly onOpenNode: (host: string) => void;
  readonly isPending?: boolean;
  readonly emptyText?: string;
}

const COLUMNS: ColumnDef<InfrastructureNode>[] = [
  {
    id: "Host",
    header: "Host",
    accessorFn: (n) => n.host,
    size: 220,
    cell: ({ row: { original: n } }) => <EntityNameCell name={n.host} errorRate={n.errorRate} />,
  },
  {
    id: "Services",
    header: "Services",
    accessorFn: (n) => n.services.join(", "),
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
  numericColumn<InfrastructureNode>("Requests", (n) => n.requestCount),
  errorRateColumn<InfrastructureNode>("Error rate", (n) => n.errorRate),
  latencyColumn<InfrastructureNode>("p95", (n) => n.p95LatencyMs, 90),
  lastSeenColumn<InfrastructureNode>((n) => n.lastSeen),
  chevronColumn<InfrastructureNode>(),
];

export function InfraHostsTable({ nodes, onOpenNode, isPending, emptyText }: InfraHostsTableProps) {
  return (
    <DataTable
      data={{ columns: COLUMNS, rows: [...nodes], loading: isPending }}
      pagination={{ pageSize: PAGE_SIZE }}
      config={{ onRow: clickableRow((n: InfrastructureNode) => onOpenNode(n.host)), emptyText }}
    />
  );
}
