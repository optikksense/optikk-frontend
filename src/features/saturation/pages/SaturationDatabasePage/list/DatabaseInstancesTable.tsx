import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";
import SparklineChart from "@shared/components/ui/charts/micro/SparklineChart";
import DataTable from "@shared/components/ui/data-display/DataTable";

import type { DatastoreSystemRow } from "@/features/saturation/api/datastoresExplorerSchemas";
import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { ROUTES } from "@/shared/constants/routes";

import { DbEngineIcon } from "../components/DbEngineIcon";
import { StatusPill } from "../components/StatusPill";
import { engineColor, instanceStatus } from "../databaseInstanceModel";

const P95_WARN_MS = 1000;
const P95_CRIT_MS = 2000;

function p95Class(ms: number): string {
  if (ms >= P95_CRIT_MS) return "text-error";
  if (ms >= P95_WARN_MS) return "text-warning";
  return "text-foreground";
}

function buildColumns(sparklines: Map<string, number[]>): ColumnDef<DatastoreSystemRow>[] {
  return [
    {
      header: "Instance",
      accessorKey: "system",
      size: 260,
      cell: ({ row: { original: row } }) => (
        <div className="flex items-center gap-2.5">
          <DbEngineIcon system={row.system} />
          <div className="min-w-0">
            <div className="truncate font-mono font-semibold text-[12.5px] text-foreground">
              {row.system}
            </div>
            <div className="truncate font-mono text-[11px] text-foreground-muted">
              {row.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Region",
      accessorKey: "server_hint",
      size: 150,
      cell: ({ row: { original: row } }) => (
        <span className="font-mono text-[12px] text-foreground-secondary">
          {row.server_hint || "—"}
        </span>
      ),
    },
    {
      header: "Queries",
      accessorKey: "query_count",
      size: 100,
      meta: { align: "right" },
      cell: ({ row: { original: row } }) => (
        <span className="font-mono font-semibold text-foreground">{fmtNum(row.query_count)}</span>
      ),
    },
    {
      header: "Trend",
      accessorKey: "trend",
      size: 110,
      cell: ({ row: { original: row } }) => {
        const series = sparklines.get(row.system) ?? [];
        const status = instanceStatus(row);
        const color =
          status === "err"
            ? "var(--color-error)"
            : status === "warn"
              ? "var(--color-warning)"
              : engineColor(row.system);
        return <SparklineChart data={series} color={color} width={96} height={24} />;
      },
    },
    {
      header: "Avg",
      accessorKey: "avg_latency_ms",
      size: 84,
      meta: { align: "right" },
      cell: ({ row: { original: row } }) => <span className="font-mono">{fmtMs(row.avg_latency_ms)}</span>,
    },
    {
      header: "p95",
      accessorKey: "p95_latency_ms",
      size: 84,
      meta: { align: "right" },
      cell: ({ row: { original: row } }) => (
        <span className={`font-mono ${p95Class(row.p95_latency_ms)}`}>
          {fmtMs(row.p95_latency_ms)}
        </span>
      ),
    },
    {
      header: "Connections",
      accessorKey: "active_connections",
      size: 110,
      meta: { align: "right" },
      cell: ({ row: { original: row } }) => <span className="font-mono">{fmtNum(row.active_connections)}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      size: 120,
      cell: ({ row: { original: row } }) => <StatusPill status={instanceStatus(row)} />,
    },
    {
      header: "",
      id: "chevron",
      size: 34,
      cell: () => <ChevronRight size={14} className="text-foreground-muted" />,
    },
  ];
}

interface DatabaseInstancesTableProps {
  readonly rows: DatastoreSystemRow[];
  readonly loading: boolean;
  readonly sparklines: Map<string, number[]>;
}

export function DatabaseInstancesTable({ rows, loading, sparklines }: DatabaseInstancesTableProps) {
  const navigate = useNavigate();
  const columns = buildColumns(sparklines);
  return (
    <DataTable
      data={{ columns, rows, loading }}
      pagination={{ showPagination: false }}
      config={{
        emptyText: "No datastore instances match the current filters.",
        onRow: (row) => ({
          onClick: () =>
            navigate({
              to: ROUTES.saturationDatabaseDetail.replace(
                "$system",
                encodeURIComponent(row.system)
              ) as never,
            }),
          style: { cursor: "pointer" },
        }),
      }}
    />
  );
}
