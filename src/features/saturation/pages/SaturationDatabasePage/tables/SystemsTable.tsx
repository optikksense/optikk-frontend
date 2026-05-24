import { useNavigate } from "@tanstack/react-router";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { dynamicNavigateOptions } from "@shared/utils/navigation";

import type { DatastoreSystemRow } from "@/features/saturation/api/datastoresExplorerSchemas";
import { fmtMs, fmtNum, fmtPct } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";
import { ROUTES } from "@/shared/constants/routes";

import { useDatabaseSystems } from "../hooks/useDatabaseSystems";

function errTone(rate: number): string {
  if (rate >= 0.02) return "text-[var(--color-error,#ef4444)]";
  if (rate >= 0.005) return "text-[var(--color-warning,#f59e0b)]";
  return "text-[var(--text-primary)]";
}

const COLUMNS: SimpleTableColumn<DatastoreSystemRow>[] = [
  {
    title: "System",
    key: "system",
    width: 200,
    render: (_v, row) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-mono text-[12px] text-[var(--text-primary)]">
          {row.system}
        </span>
        <span className="truncate text-[11px] text-[var(--text-muted)]">{row.category}</span>
      </div>
    ),
  },
  {
    title: "Queries",
    key: "query_count",
    width: 120,
    align: "right",
    sorter: (a, b) => a.query_count - b.query_count,
    defaultSortOrder: "descend",
    render: (_v, row) => <span className="font-mono">{fmtNum(row.query_count)}</span>,
  },
  {
    title: "Avg",
    key: "avg_latency_ms",
    width: 100,
    align: "right",
    sorter: (a, b) => a.avg_latency_ms - b.avg_latency_ms,
    render: (_v, row) => <span className="font-mono">{fmtMs(row.avg_latency_ms)}</span>,
  },
  {
    title: "p95",
    key: "p95_latency_ms",
    width: 100,
    align: "right",
    sorter: (a, b) => a.p95_latency_ms - b.p95_latency_ms,
    render: (_v, row) => <span className="font-mono">{fmtMs(row.p95_latency_ms)}</span>,
  },
  {
    title: "Error %",
    key: "error_rate",
    width: 100,
    align: "right",
    sorter: (a, b) => a.error_rate - b.error_rate,
    render: (_v, row) => (
      <span className={`font-mono ${errTone(row.error_rate)}`}>{fmtPct(row.error_rate)}</span>
    ),
  },
  {
    title: "Connections",
    key: "active_connections",
    width: 120,
    align: "right",
    sorter: (a, b) => a.active_connections - b.active_connections,
    render: (_v, row) => <span className="font-mono">{fmtNum(row.active_connections)}</span>,
  },
];

export function SystemsTable() {
  const navigate = useNavigate();
  const { data, isPending } = useDatabaseSystems();
  const rows = data ?? [];
  return (
    <PanelCard
      title="Database systems"
      subtitle={data ? `${rows.length} systems` : undefined}
      padded={false}
    >
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-[var(--text-muted)]">
          {isPending ? "Loading…" : "No database systems in window."}
        </div>
      ) : (
        <SimpleTable
          columns={COLUMNS}
          dataSource={rows}
          rowKey={(r) => r.system}
          pagination={{ pageSize: 25 }}
          onRow={(record) => ({
            onClick: () =>
              navigate(
                dynamicNavigateOptions(
                  ROUTES.saturationDatastoreDetail.replace(
                    "$system",
                    encodeURIComponent(record.system)
                  )
                )
              ),
            style: { cursor: "pointer" },
          })}
        />
      )}
    </PanelCard>
  );
}
