import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import type { SimpleTableColumn } from "@shared/components/primitives/ui/simple-table";
import DataTable from "@shared/components/ui/data-display/DataTable";

import type { QueryExecutionRow } from "@/features/saturation/api/databaseQueryDetailApi";
import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleTimeString();
}

const COLUMNS: SimpleTableColumn<QueryExecutionRow>[] = [
  {
    title: "Time",
    key: "timestamp",
    width: 110,
    render: (_v, row) => (
      <span className="font-mono text-[11.5px] text-foreground-secondary">
        {fmtTime(row.timestamp)}
      </span>
    ),
  },
  {
    title: "Duration",
    key: "duration_ms",
    width: 90,
    align: "right",
    sorter: (a, b) => a.duration_ms - b.duration_ms,
    render: (_v, row) => (
      <span
        className={`font-mono font-semibold ${row.is_error ? "text-error" : "text-foreground"}`}
      >
        {fmtMs(row.duration_ms)}
      </span>
    ),
  },
  {
    title: "Rows",
    key: "rows",
    width: 70,
    align: "right",
    render: (_v, row) => (
      <span className="font-mono">{row.rows == null ? "—" : fmtNum(row.rows)}</span>
    ),
  },
  {
    title: "Service",
    key: "service",
    width: 160,
    render: (_v, row) => <span className="font-mono text-[11.5px]">{row.service || "—"}</span>,
  },
  {
    title: "Host",
    key: "host",
    width: 160,
    render: (_v, row) => (
      <span className="font-mono text-[11.5px] text-foreground-secondary">{row.host || "—"}</span>
    ),
  },
  {
    title: "",
    key: "chevron",
    width: 34,
    render: () => <ChevronRight size={14} className="text-foreground-muted" />,
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
      <DataTable<QueryExecutionRow>
        data={{
          columns: COLUMNS,
          rows,
          loading,
          rowKey: (r) => `${r.trace_id}::${r.span_id}`,
        }}
        pagination={{ pageSize: 10 }}
        config={{
          emptyText: "No executions recorded in the current window.",
          onRow: (row) => ({
            onClick: () =>
              navigate(
                dynamicNavigateOptions(ROUTES.traceDetail.replace("$traceId", row.trace_id))
              ),
            style: { cursor: "pointer" },
          }),
        }}
      />
    </PanelCard>
  );
}
