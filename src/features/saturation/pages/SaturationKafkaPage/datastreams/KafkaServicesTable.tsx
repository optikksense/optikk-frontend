import type { ColumnDef } from "@tanstack/react-table";
import { Server } from "lucide-react";

import DataTable from "@shared/components/ui/data-display/DataTable";

import { type KafkaService, LEVEL_LABEL, fmtRate } from "./model";

const columns: ColumnDef<KafkaService>[] = [
  {
    accessorKey: "id",
    header: "Service",
    cell: ({ row }) => (
      <span className="strong flex items-center gap-2 font-semibold">
        <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[5px] bg-[var(--brand-tint)] text-[var(--brand)]">
          <Server size={11} />
        </span>
        {row.original.id}
      </span>
    ),
  },
  {
    id: "role",
    header: "Role",
    cell: ({ row }) => {
      const s = row.original;
      const role =
        s.produces.length && s.consumes.length
          ? "producer + consumer"
          : s.produces.length
            ? "producer"
            : "consumer";
      return <span className="dim">{role}</span>;
    },
  },
  {
    id: "produces_to",
    header: "Produces to",
    cell: ({ row }) => (
      <span className="dim">{row.original.produces.map((p) => p.topic).join(", ") || "—"}</span>
    ),
  },
  {
    id: "consumes_from",
    header: "Consumes from",
    cell: ({ row }) => (
      <span className="dim">{row.original.consumes.map((c) => c.topic).join(", ") || "—"}</span>
    ),
  },
  {
    accessorKey: "rate",
    header: "Throughput",
    meta: { align: "right" },
    cell: ({ row }) => `${fmtRate(row.original.rate)}/s`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`badge ${row.original.status}`}>
        <span className="b-dot" />
        {LEVEL_LABEL[row.original.status]}
      </span>
    ),
  },
];

interface Props {
  readonly services: readonly KafkaService[];
  readonly onServiceClick?: (serviceId: string) => void;
}

export function KafkaServicesTable({ services, onServiceClick }: Props) {
  const sorted = [...services].sort((a, b) => b.rate - a.rate);

  return (
    <DataTable
      data={{
        columns: columns as ColumnDef<KafkaService, unknown>[],
        rows: sorted,
      }}
      config={{
        emptyText: "No services found",
        onRow: (row) => ({
          onClick: () => onServiceClick?.(row.id),
          className: "cursor-pointer",
        }),
      }}
    />
  );
}
