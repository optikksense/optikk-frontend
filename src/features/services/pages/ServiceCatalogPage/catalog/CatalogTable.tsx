import { ChevronRight } from "lucide-react";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";

import { ServiceAvatar } from "../../../components/ServiceAvatar";
import { fmtMs, fmtNum, fmtPct } from "../../ServiceDetailPage/formatters";
import { SparklineCell } from "./SparklineCell";
import { StatusDot } from "./StatusDot";
import type { CatalogRow } from "./buildCatalogRows";

function ErrorCell({ rate }: { rate: number }) {
  const tone = rate >= 0.02 ? "text-error" : rate >= 0.005 ? "text-warning" : "text-foreground";
  return <span className={tone}>{fmtPct(rate, rate < 0.001 ? 3 : 2)}</span>;
}

function NameCell({ row }: { row: CatalogRow }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <StatusDot status={row.status} />
      <ServiceAvatar serviceName={row.serviceName} size={26} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-semibold text-[12.5px] text-foreground">
          {row.serviceName}
        </span>
        <span className="truncate font-mono text-[11px] text-foreground-muted">
          {row.lang} · {row.instances} inst · {row.version}
        </span>
      </div>
    </div>
  );
}

function sparkTone(status: CatalogRow["status"]): "info" | "warn" | "err" {
  return status === "error" ? "err" : status === "warn" ? "warn" : "info";
}

const COLUMNS: SimpleTableColumn<CatalogRow>[] = [
  {
    title: "Service",
    key: "serviceName",
    width: 300,
    headerClassName:
      "text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground-muted pb-2.5",
    cellClassName: "py-[12px] px-3",
    render: (_v, row) => <NameCell row={row} />,
  },
  {
    title: "RPS",
    key: "rps",
    width: 110,
    align: "right",
    headerClassName:
      "text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground-muted pb-2.5",
    cellClassName: "py-[12px] px-3",
    sorter: (a, b) => a.rps - b.rps,
    defaultSortOrder: "descend",
    render: (_v, row) => (
      <span className="font-semibold text-[12.5px] text-foreground tabular-nums">
        {fmtNum(row.rps)}
      </span>
    ),
  },
  {
    title: "Error",
    key: "errorRate",
    width: 90,
    align: "right",
    headerClassName:
      "text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground-muted pb-2.5",
    cellClassName: "py-[12px] px-3",
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
    headerClassName:
      "text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground-muted pb-2.5",
    cellClassName: "py-[12px] px-3",
    sorter: (a, b) => a.p99Ms - b.p99Ms,
    render: (_v, row) => (
      <span className="font-mono text-[12px] tabular-nums">{fmtMs(row.p99Ms)}</span>
    ),
  },
  {
    title: "Last 1 hour",
    key: "sparkline",
    width: 140,
    headerClassName:
      "text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground-muted pb-2.5",
    cellClassName: "py-[12px] px-3",
    render: (_v, row) => (
      <SparklineCell values={row.sparkline} tone={sparkTone(row.status)} width={120} />
    ),
  },
  {
    title: "",
    key: "chevron",
    width: 40,
    align: "right",
    headerClassName:
      "text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground-muted pb-2.5",
    cellClassName: "py-[12px] px-3",
    render: () => <ChevronRight size={14} className="text-foreground-muted" />,
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
      className="[&_table]:rounded-none [&_table]:bg-transparent [&_tr:hover_td]:bg-[var(--bg-row-hover)] [&_tr:last-child]:border-0 [&_tr:nth-child(even)]:bg-transparent [&_tr]:border-[var(--line-2)] [&_tr]:border-b [&_tr]:bg-transparent"
      onRow={(record) => ({
        onClick: () => onRowClick(record.serviceName),
        style: { cursor: "pointer" },
      })}
    />
  );
}
