import { ChevronRight } from "lucide-react";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";

import { fmtDelta, fmtMs, fmtNum, fmtPct } from "../../ServiceDetailPage/formatters";
import { SparklineCell } from "./SparklineCell";
import { StatusDot } from "./StatusDot";
import type { CatalogRow } from "./buildCatalogRows";

function ErrorCell({ rate }: { rate: number }) {
  const tone =
    rate >= 0.02
      ? "text-[var(--color-error)]"
      : rate >= 0.005
        ? "text-[var(--color-warning)]"
        : "text-[var(--text-primary)]";
  return <span className={tone}>{fmtPct(rate, rate < 0.001 ? 3 : 2)}</span>;
}

function DeltaCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-[var(--text-muted)]">—</span>;
  const formatted = fmtDelta(1 + value, 1);
  if (!formatted) return <span className="text-[var(--text-muted)]">0%</span>;
  const tone =
    formatted.direction === "up"
      ? "text-[var(--color-error)]"
      : formatted.direction === "down"
        ? "text-[var(--color-success)]"
        : "text-[var(--text-muted)]";
  return <span className={tone}>{formatted.label}</span>;
}

function NameCell({ row }: { row: CatalogRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <StatusDot status={row.status} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-[12.5px] font-semibold text-[var(--text-primary)]">
          {row.serviceName}
        </span>
        <span className="truncate font-mono text-[11px] text-[var(--text-muted)]">
          {row.version}
          {row.environment !== "—" ? ` · ${row.environment}` : ""}
        </span>
      </div>
    </div>
  );
}

function sparkTone(status: CatalogRow["status"]): "info" | "warn" | "err" {
  return status === "error" ? "err" : status === "warn" ? "warn" : "info";
}

const COLUMNS: SimpleTableColumn<CatalogRow>[] = [
  { title: "Service", key: "serviceName", width: 300, render: (_v, row) => <NameCell row={row} /> },
  {
    title: "RPS",
    key: "rps",
    width: 110,
    align: "right",
    sorter: (a, b) => a.rps - b.rps,
    defaultSortOrder: "descend",
    render: (_v, row) => (
      <span className="font-semibold text-[12.5px] text-[var(--text-primary)] tabular-nums">
        {fmtNum(row.rps)}
      </span>
    ),
  },
  {
    title: "Error",
    key: "errorRate",
    width: 90,
    align: "right",
    sorter: (a, b) => a.errorRate - b.errorRate,
    render: (_v, row) => (
      <span className="tabular-nums">
        <ErrorCell rate={row.errorRate} />
      </span>
    ),
  },
  {
    title: "P99",
    key: "p99Ms",
    width: 100,
    align: "right",
    sorter: (a, b) => a.p99Ms - b.p99Ms,
    render: (_v, row) => <span className="font-mono text-[12px] tabular-nums">{fmtMs(row.p99Ms)}</span>,
  },
  {
    title: "Last 1 hour",
    key: "sparkline",
    width: 140,
    render: (_v, row) => <SparklineCell values={row.sparkline} tone={sparkTone(row.status)} width={120} />,
  },
  {
    title: "Δ",
    key: "p99DeltaPct",
    width: 80,
    align: "right",
    render: (_v, row) => (
      <span className="text-[12px] tabular-nums">
        <DeltaCell value={row.p99DeltaPct} />
      </span>
    ),
  },
  {
    title: "",
    key: "chevron",
    width: 40,
    align: "right",
    render: () => <ChevronRight size={14} className="text-[var(--text-muted)]" />,
  },
];

interface CatalogTableProps {
  readonly rows: CatalogRow[];
  readonly onRowClick: (serviceName: string) => void;
}

export function CatalogTable({ rows, onRowClick }: CatalogTableProps) {
  return (
    <SimpleTable
      columns={COLUMNS}
      dataSource={rows}
      rowKey={(r) => r.serviceName}
      pagination={{ pageSize: 50 }}
      onRow={(record) => ({
        onClick: () => onRowClick(record.serviceName),
        style: { cursor: "pointer" },
      })}
    />
  );
}
