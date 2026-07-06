import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";

import { SAT_TABLE_CLASS } from "@/features/saturation/pages/SaturationPage/components/tableClasses";
import DataTable from "@shared/components/ui/data-display/DataTable";

import { type Level, fmtPct, fmtRate, levelFromError } from "./model";

const LV_COLOR: Record<Level, string> = { ok: "var(--ok)", warn: "var(--warn)", err: "var(--err)" };

interface Pathway {
  producer: string;
  topic: string;
  group: string;
  consumer: string;
  consume_rate_per_sec: number;
  error_rate: number;
}

interface Props {
  readonly pathways: readonly Pathway[];
  readonly onProducerClick?: (producer: string) => void;
  readonly onRowClick?: (pathway: Pathway) => void;
  /** When true, shows Producer column (topology tab). When false, shows Consumer column (consumers tab). */
  readonly variant: "topology" | "consumers";
}

const topologyColumns: ColumnDef<Pathway>[] = [
  {
    accessorKey: "producer",
    header: "Producer",
    cell: ({ row }) => (
      <span className="strong font-semibold">{row.original.producer}</span>
    ),
  },
  { accessorKey: "topic", header: "Topic" },
  {
    accessorKey: "group",
    header: "Consumer group",
    cell: ({ row }) => {
      const lv = levelFromError(row.original.error_rate);
      return (
        <span>
          <span
            className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full align-middle"
            style={{ background: LV_COLOR[lv] }}
          />
          {row.original.group}{" "}
          <span className="text-[var(--fg-3)]">· {row.original.consumer}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "consume_rate_per_sec",
    header: "Msg/s",
    meta: { align: "right" },
    cell: ({ row }) => fmtRate(row.original.consume_rate_per_sec),
  },
  {
    accessorKey: "error_rate",
    header: "Err",
    meta: { align: "right" },
    cell: ({ row }) => {
      const lv = levelFromError(row.original.error_rate);
      return <span style={{ color: LV_COLOR[lv] }}>{fmtPct(row.original.error_rate)}</span>;
    },
  },
  {
    id: "chevron",
    header: "",
    size: 32,
    cell: () => <ChevronRight size={14} className="text-[var(--fg-3)]" />,
  },
];

const consumersColumns: ColumnDef<Pathway>[] = [
  {
    accessorKey: "group",
    header: "Consumer group",
    cell: ({ row }) => {
      const lv = levelFromError(row.original.error_rate);
      return (
        <span className="strong font-semibold">
          <span
            className="mr-1.5 inline-block h-[7px] w-[7px] rounded-full align-middle"
            style={{ background: LV_COLOR[lv] }}
          />
          {row.original.group}
        </span>
      );
    },
  },
  {
    accessorKey: "consumer",
    header: "Service",
    cell: ({ row }) => <span className="dim">{row.original.consumer}</span>,
  },
  {
    accessorKey: "topic",
    header: "Reads topic",
    cell: ({ row }) => <span className="dim">{row.original.topic}</span>,
  },
  {
    accessorKey: "consume_rate_per_sec",
    header: "Msg/s",
    meta: { align: "right" },
    cell: ({ row }) => fmtRate(row.original.consume_rate_per_sec),
  },
  {
    accessorKey: "error_rate",
    header: "Err",
    meta: { align: "right" },
    cell: ({ row }) => {
      const lv = levelFromError(row.original.error_rate);
      return <span style={{ color: LV_COLOR[lv] }}>{fmtPct(row.original.error_rate)}</span>;
    },
  },
  {
    id: "chevron",
    header: "",
    size: 32,
    cell: () => <ChevronRight size={14} className="text-[var(--fg-3)]" />,
  },
];

export function KafkaPathwaysTable({ pathways, onRowClick, variant }: Props) {
  const columns = variant === "topology" ? topologyColumns : consumersColumns;

  return (
    <DataTable
      data={{
        columns: columns as ColumnDef<Pathway, unknown>[],
        rows: pathways as Pathway[],
      }}
      config={{
        emptyText: "No pathways found",
        onRow: (row) => ({
          onClick: () => onRowClick?.(row),
          className: "cursor-pointer",
        }),
      }}
    />
  );
}
