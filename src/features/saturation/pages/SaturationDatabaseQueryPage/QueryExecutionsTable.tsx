import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

import type { QueryExecutionRow } from "@/features/saturation/api/databaseQueryDetailApi";
import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";
import { ROUTES } from "@/shared/constants/routes";

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString();
}

const COLUMNS: ColumnDef<QueryExecutionRow>[] = [
  {
    header: "Time",
    accessorKey: "timestamp",
    size: 110,
    cell: ({ row: { original: row } }) => (
      <span className="font-mono text-[11.5px] text-foreground-secondary">
        {fmtTime(row.timestamp)}
      </span>
    ),
  },
  {
    header: "Duration",
    accessorKey: "duration_ms",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span
        className={`font-mono font-semibold ${row.is_error ? "text-error" : "text-foreground"}`}
      >
        {fmtMs(row.duration_ms)}
      </span>
    ),
  },
  {
    header: "Rows",
    accessorKey: "rows",
    size: 70,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono">{row.rows == null ? "—" : fmtNum(row.rows)}</span>
    ),
  },
  {
    header: "Service",
    accessorKey: "service",
    size: 160,
    cell: ({ row: { original: row } }) => (
      <span className="font-mono text-[11.5px]">{row.service || "—"}</span>
    ),
  },
  {
    header: "Host",
    accessorKey: "host",
    size: 160,
    cell: ({ row: { original: row } }) => (
      <span className="font-mono text-[11.5px] text-foreground-secondary">{row.host || "—"}</span>
    ),
  },
  {
    header: "",
    id: "chevron",
    size: 34,
    cell: () => <ChevronRight size={14} className="text-foreground-muted" />,
  },
];

// Slowest/latest raw executions; row click opens the owning trace.
export function QueryExecutionsTable({
  rows,
  loading,
}: {
  rows: QueryExecutionRow[];
  loading: boolean;
}) {
  const navigate = useNavigate();
  return (
    <PanelCard title="Recent executions" subtitle="latest spans for this query" padded={false}>
      <DataTable
        data={{
          columns: COLUMNS,
          rows,
          loading,
        }}
        pagination={{ pageSize: 10 }}
        config={{
          emptyText: "No executions recorded in the current window.",
          onRow: (row) => ({
            onClick: () =>
              navigate({
                to: ROUTES.traceDetail.replace("$traceId", row.trace_id) as never,
              }),
            style: { cursor: "pointer" },
          }),
        }}
      />
    </PanelCard>
  );
}
