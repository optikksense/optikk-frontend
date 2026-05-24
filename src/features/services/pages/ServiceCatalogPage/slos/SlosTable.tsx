import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";

import { SloBarCell } from "../catalog/SloBarCell";
import { type SloTableRow, useSloRows } from "../hooks/useSloRows";

function tone(status: string | undefined): string {
  if (status === "critical" || status === "burning") return "text-[var(--color-error,#ef4444)]";
  if (status === "at-risk") return "text-[var(--color-warning,#f59e0b)]";
  return "text-[var(--text-primary)]";
}

const COLUMNS: SimpleTableColumn<SloTableRow>[] = [
  {
    title: "Service",
    key: "service_name",
    width: 220,
    render: (_v, row) => (
      <span className="font-mono text-[12px] text-[var(--text-primary)]">{row.service_name}</span>
    ),
  },
  {
    title: "SLO",
    key: "slo_name",
    width: 200,
    render: (_v, row) => (
      <span className={`truncate font-mono text-[12px] ${tone(row.status)}`}>
        {row.slo_name ?? "—"}
      </span>
    ),
  },
  {
    title: "Burn rate",
    key: "burnRate",
    width: 130,
    align: "right",
    sorter: (a, b) => a.burnRate - b.burnRate,
    render: (_v, row) => (
      <span className={`font-mono text-[12px] ${tone(row.status)}`}>
        {row.burnRate.toFixed(1)}x
      </span>
    ),
  },
  {
    title: "Remaining budget",
    key: "remainingBudget",
    width: 240,
    sorter: (a, b) => a.remainingBudget - b.remainingBudget,
    defaultSortOrder: "ascend",
    render: (_v, row) => <SloBarCell slo={row} />,
  },
  {
    title: "Status",
    key: "status",
    width: 120,
    render: (_v, row) => (
      <span className={`text-[12px] capitalize ${tone(row.status)}`}>{row.status ?? "—"}</span>
    ),
  },
];

export function SlosTable() {
  const { rows, isPending } = useSloRows();
  if (rows.length === 0) {
    return (
      <div className="grid h-[160px] place-items-center text-[12px] text-[var(--text-muted)]">
        {isPending ? "Loading SLOs…" : "No SLOs configured."}
      </div>
    );
  }
  return (
    <SimpleTable
      columns={COLUMNS}
      dataSource={rows}
      rowKey={(r) => `${r.service_name}::${r.slo_name ?? "default"}`}
      pagination={{ pageSize: 50 }}
    />
  );
}
