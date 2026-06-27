import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import type { SimpleTableColumn } from "@shared/components/primitives/ui/simple-table";
import SparklineChart from "@shared/components/ui/charts/micro/SparklineChart";
import DataTable from "@shared/components/ui/data-display/DataTable";

import type { DatastoreSystemRow } from "@/features/saturation/api/datastoresExplorerSchemas";
import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

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

function buildColumns(sparklines: Map<string, number[]>): SimpleTableColumn<DatastoreSystemRow>[] {
  return [
    {
      title: "Instance",
      key: "system",
      width: 260,
      render: (_v, row) => (
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
      title: "Region",
      key: "server_hint",
      width: 150,
      render: (_v, row) => (
        <span className="font-mono text-[12px] text-foreground-secondary">
          {row.server_hint || "—"}
        </span>
      ),
    },
    {
      title: "Queries",
      key: "query_count",
      width: 100,
      align: "right",
      sorter: (a, b) => a.query_count - b.query_count,
      render: (_v, row) => (
        <span className="font-mono font-semibold text-foreground">{fmtNum(row.query_count)}</span>
      ),
    },
    {
      title: "Trend",
      key: "trend",
      width: 110,
      render: (_v, row) => {
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
      title: "Avg",
      key: "avg_latency_ms",
      width: 84,
      align: "right",
      sorter: (a, b) => a.avg_latency_ms - b.avg_latency_ms,
      render: (_v, row) => <span className="font-mono">{fmtMs(row.avg_latency_ms)}</span>,
    },
    {
      title: "p95",
      key: "p95_latency_ms",
      width: 84,
      align: "right",
      sorter: (a, b) => a.p95_latency_ms - b.p95_latency_ms,
      defaultSortOrder: "descend",
      render: (_v, row) => (
        <span className={`font-mono ${p95Class(row.p95_latency_ms)}`}>
          {fmtMs(row.p95_latency_ms)}
        </span>
      ),
    },
    {
      title: "Connections",
      key: "active_connections",
      width: 110,
      align: "right",
      sorter: (a, b) => a.active_connections - b.active_connections,
      render: (_v, row) => <span className="font-mono">{fmtNum(row.active_connections)}</span>,
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_v, row) => <StatusPill status={instanceStatus(row)} />,
    },
    {
      title: "",
      key: "chevron",
      width: 34,
      render: () => <ChevronRight size={14} className="text-foreground-muted" />,
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
    <DataTable<DatastoreSystemRow>
      data={{ columns, rows, loading, rowKey: "system" }}
      pagination={{ showPagination: false }}
      config={{
        emptyText: "No datastore instances match the current filters.",
        onRow: (row) => ({
          onClick: () =>
            navigate(
              dynamicNavigateOptions(
                ROUTES.saturationDatabaseDetail.replace("$system", encodeURIComponent(row.system))
              )
            ),
          style: { cursor: "pointer" },
        }),
      }}
    />
  );
}
