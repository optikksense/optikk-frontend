import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";

import {
  fmtDelta,
  fmtMs,
  fmtNum,
  fmtPct,
  relativeTimeFromIso,
} from "../../ServiceDetailPage/formatters";
import { SloBarCell } from "./SloBarCell";
import { SparklineCell } from "./SparklineCell";
import { StatusDot } from "./StatusDot";
import type { CatalogRow } from "./buildCatalogRows";

function ErrorCell({ rate }: { rate: number }) {
  const tone =
    rate >= 0.02
      ? "text-[var(--color-error,#ef4444)]"
      : rate >= 0.005
        ? "text-[var(--color-warning,#f59e0b)]"
        : "text-[var(--text-primary)]";
  return <span className={tone}>{fmtPct(rate, rate < 0.001 ? 3 : 2)}</span>;
}

function DeltaCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-[var(--text-muted)]">—</span>;
  const formatted = fmtDelta(1 + value, 1);
  if (!formatted) return <span className="text-[var(--text-muted)]">0%</span>;
  const tone =
    formatted.direction === "up"
      ? "text-[var(--color-error,#ef4444)]"
      : formatted.direction === "down"
        ? "text-[var(--color-success,#10b981)]"
        : "text-[var(--text-muted)]";
  return <span className={tone}>{formatted.label}</span>;
}

function NameCell({ row }: { row: CatalogRow }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate font-mono text-[12px] text-[var(--text-primary)]">
        {row.serviceName}
      </span>
      <span className="truncate text-[11px] text-[var(--text-muted)]">
        {row.version} · {row.environment}
      </span>
    </div>
  );
}

const COLUMNS: SimpleTableColumn<CatalogRow>[] = [
  { title: "", key: "status", width: 28, render: (_v, row) => <StatusDot status={row.status} /> },
  { title: "Service", key: "serviceName", width: 260, render: (_v, row) => <NameCell row={row} /> },
  {
    title: "Request rate",
    key: "rps",
    width: 130,
    align: "right",
    sorter: (a, b) => a.rps - b.rps,
    defaultSortOrder: "descend",
    render: (_v, row) => (
      <span className="font-mono text-[12px]">
        {fmtNum(row.rps)}
        <span className="ml-1 text-[var(--text-muted)]">/s</span>
      </span>
    ),
  },
  {
    title: "Trend",
    key: "sparkline",
    width: 110,
    render: (_v, row) => (
      <SparklineCell
        values={row.sparkline}
        tone={row.status === "error" ? "err" : row.status === "warn" ? "warn" : "info"}
      />
    ),
  },
  {
    title: "Errors",
    key: "errorRate",
    width: 110,
    align: "right",
    sorter: (a, b) => a.errorRate - b.errorRate,
    render: (_v, row) => <ErrorCell rate={row.errorRate} />,
  },
  {
    title: "p99 latency",
    key: "p99Ms",
    width: 140,
    align: "right",
    sorter: (a, b) => a.p99Ms - b.p99Ms,
    render: (_v, row) => (
      <span className="inline-flex items-baseline justify-end gap-2 font-mono text-[12px]">
        {fmtMs(row.p99Ms)}
        <DeltaCell value={row.p99DeltaPct} />
      </span>
    ),
  },
  { title: "SLO", key: "slo", width: 180, render: (_v, row) => <SloBarCell slo={row.slo} /> },
  {
    title: "Last deploy",
    key: "lastDeployedAt",
    width: 130,
    render: (_v, row) => (
      <span className="font-mono text-[11px] text-[var(--text-muted)]">
        {relativeTimeFromIso(row.lastDeployedAt)}
      </span>
    ),
  },
];

interface CatalogTableProps {
  readonly rows: CatalogRow[];
  readonly onSelect: (serviceName: string) => void;
  readonly selectedServiceName: string | null;
}

export function CatalogTable({ rows, onSelect, selectedServiceName }: CatalogTableProps) {
  return (
    <SimpleTable
      columns={COLUMNS}
      dataSource={rows}
      rowKey={(r) => r.serviceName}
      pagination={{ pageSize: 50 }}
      onRow={(record) => ({
        onClick: () => onSelect(record.serviceName),
        style: {
          cursor: "pointer",
          background:
            selectedServiceName === record.serviceName
              ? "var(--bg-elevated,rgba(255,255,255,0.04))"
              : undefined,
        },
      })}
    />
  );
}
