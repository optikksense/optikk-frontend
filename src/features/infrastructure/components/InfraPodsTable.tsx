import { useMemo } from "react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

import type { FleetPod } from "../types";
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

interface InfraPodsTableProps {
  readonly pods: readonly FleetPod[];
  readonly onOpenContainer: (container: string) => void;
  readonly onOpenHost: (host: string) => void;
  readonly isPending?: boolean;
  readonly emptyText?: string;
}

function buildColumns(onOpenHost: (host: string) => void): ColumnDef<FleetPod>[] {
  return [
    {
      id: "Container",
      header: "Container",
      accessorFn: (c) => c.podName,
      size: 260,
      cell: ({ row: { original: c } }) => (
        <EntityNameCell
          name={c.podName}
          sublabel={c.services.length > 0 ? c.services.join(", ") : "—"}
          errorRate={c.errorRate}
        />
      ),
    },
    {
      id: "Host",
      header: "Host",
      accessorFn: (c) => c.host,
      cell: ({ row: { original: c } }) => (
        <button
          type="button"
          onClick={(ev) => {
            ev.stopPropagation();
            onOpenHost(c.host);
          }}
          className="font-mono text-[12.5px] text-primary hover:underline"
        >
          {c.host}
        </button>
      ),
    },
    numericColumn<FleetPod>("Requests", (c) => c.requestCount),
    errorRateColumn<FleetPod>("Error rate", (c) => c.errorRate),
    latencyColumn<FleetPod>("p95", (c) => c.p95LatencyMs, 90),
    lastSeenColumn<FleetPod>((c) => c.lastSeen),
    chevronColumn<FleetPod>(),
  ];
}

export default function InfraPodsTable({
  pods,
  onOpenContainer,
  onOpenHost,
  isPending,
  emptyText,
}: InfraPodsTableProps) {
  const columns = useMemo(() => buildColumns(onOpenHost), [onOpenHost]);
  return (
    <DataTable
      data={{ columns, rows: [...pods], loading: isPending }}
      pagination={{ pageSize: PAGE_SIZE }}
      config={{ onRow: clickableRow((c: FleetPod) => onOpenContainer(c.podName)), emptyText }}
    />
  );
}
