import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";

import { relativeTimeFromIso } from "../../ServiceDetailPage/formatters";
import type { DeployRow } from "./useDeploysData";

const COLUMNS: SimpleTableColumn<DeployRow>[] = [
  {
    title: "Service",
    key: "service_name",
    width: 280,
    render: (_v, row) => (
      <span className="font-mono text-[12.5px] font-semibold text-[var(--text-primary)]">
        {row.service_name}
      </span>
    ),
  },
  {
    title: "Version",
    key: "version",
    width: 160,
    render: (_v, row) => (
      <span className="font-mono text-[12px] text-[var(--text-primary)]">{row.version || "—"}</span>
    ),
  },
  {
    title: "Environment",
    key: "environment",
    width: 140,
    render: (_v, row) => (
      <span className="font-mono text-[11px] text-[var(--text-muted)]">
        {row.environment || "—"}
      </span>
    ),
  },
  {
    title: "When",
    key: "deployed_at",
    width: 120,
    align: "right",
    sorter: (a, b) => a.deployedAtMs - b.deployedAtMs,
    defaultSortOrder: "descend",
    render: (_v, row) => (
      <span className="font-mono text-[11px] text-[var(--text-muted)]">
        {relativeTimeFromIso(row.deployed_at)}
      </span>
    ),
  },
];

interface RecentDeploysTableProps {
  readonly rows: DeployRow[];
  readonly onRowClick: (serviceName: string) => void;
}

export function RecentDeploysTable({ rows, onRowClick }: RecentDeploysTableProps) {
  if (rows.length === 0) {
    return (
      <div className="grid h-[160px] place-items-center text-[12px] text-[var(--text-muted)]">
        No deploys.
      </div>
    );
  }
  return (
    <SimpleTable
      columns={COLUMNS}
      dataSource={rows}
      rowKey={(r) => `${r.service_name}::${r.version}::${r.environment}`}
      pagination={{ pageSize: 50 }}
      onRow={(record) => ({
        onClick: () => onRowClick(record.service_name),
        style: { cursor: "pointer" },
      })}
    />
  );
}
