import { ChevronRight } from "lucide-react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import {
  formatDuration,
  formatNumber,
  formatPercentage,
  formatTimestamp,
} from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";
import type { Deployment } from "../../api/deploymentsApi";

function Delta({ value, unit }: { readonly value: number | null; readonly unit: "pct" | "ms" }) {
  if (value == null) {
    return <span className="text-foreground-muted">—</span>;
  }
  const formatted =
    unit === "pct"
      ? `${value >= 0 ? "+" : ""}${value.toFixed(2)} pp`
      : `${value >= 0 ? "+" : "-"}${formatDuration(Math.abs(value))}`;
  return (
    <span
      className={value > 0 ? "text-error" : value < 0 ? "text-success" : "text-foreground-muted"}
    >
      {formatted}
    </span>
  );
}

const columns: ColumnDef<Deployment>[] = [
  {
    header: "Service / version",
    accessorKey: "service",
    size: 260,
    cell: ({ row: { original: row } }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-semibold text-[12.5px] text-foreground">{row.service}</span>
        <span className="truncate font-mono text-[11px] text-foreground-secondary">
          {row.version}
          {row.previousVersion ? (
            <span className="ml-1.5 text-foreground-muted">← {row.previousVersion}</span>
          ) : null}
        </span>
      </div>
    ),
  },
  {
    header: "Environment",
    accessorKey: "environment",
    size: 120,
    cell: ({ getValue }) => (
      <span className="rounded bg-muted px-2 py-1 font-mono text-[11px] text-foreground-secondary">
        {String(getValue()) || "default"}
      </span>
    ),
  },
  {
    header: "Deployed at",
    accessorKey: "firstSeen",
    size: 170,
    cell: ({ getValue }) => (
      <span className="font-mono text-[11.5px] text-foreground-secondary">
        {formatTimestamp(String(getValue()))}
      </span>
    ),
  },
  {
    header: "Traffic share",
    accessorKey: "trafficShare",
    size: 110,
    meta: { align: "right" },
    cell: ({ getValue }) => (
      <span className="font-mono tabular-nums">{formatPercentage(Number(getValue()), 1)}</span>
    ),
  },
  {
    header: "Requests",
    accessorKey: "requestCount",
    size: 100,
    meta: { align: "right" },
    cell: ({ getValue }) => (
      <span className="font-mono tabular-nums">{formatNumber(Number(getValue()))}</span>
    ),
  },
  {
    header: "Error rate",
    accessorKey: "errorRate",
    size: 150,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <div className="flex items-center justify-end gap-2 font-mono text-[11.5px] tabular-nums">
        <span>{formatPercentage(row.errorRate, row.errorRate < 0.1 ? 3 : 2)}</span>
        <Delta value={row.errorRateDelta} unit="pct" />
      </div>
    ),
  },
  {
    header: "P95",
    accessorKey: "p95Ms",
    size: 145,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <div className="flex items-center justify-end gap-2 font-mono text-[11.5px] tabular-nums">
        <span>{formatDuration(row.p95Ms)}</span>
        <Delta value={row.p95DeltaMs} unit="ms" />
      </div>
    ),
  },
  {
    header: "",
    id: "open",
    size: 36,
    meta: { align: "right" },
    cell: () => <ChevronRight size={14} className="text-foreground-muted" />,
  },
];

interface DeploymentTableProps {
  readonly rows: Deployment[];
  readonly loading: boolean;
  readonly onOpen: (deployment: Deployment) => void;
}

export function DeploymentTable({ rows, loading, onOpen }: DeploymentTableProps) {
  return (
    <DataTable
      data={{ columns, rows, loading }}
      pagination={{ pageSize: 50 }}
      config={{
        emptyText: "No versioned deployments match the current filters.",
        onRow: (deployment) => ({
          onClick: () => onOpen(deployment),
          style: { cursor: "pointer" },
        }),
      }}
      resize={{ storageKey: "deployments-list" }}
    />
  );
}
