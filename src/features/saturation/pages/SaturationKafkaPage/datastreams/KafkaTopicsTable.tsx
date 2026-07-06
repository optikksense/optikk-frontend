import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";

import type { TopicNode } from "@/features/saturation/api/kafkaTopologySchemas";
import DataTable from "@shared/components/ui/data-display/DataTable";

import { fmtRate } from "./model";

const columns: ColumnDef<TopicNode>[] = [
  {
    accessorKey: "topic",
    header: "Topic",
    cell: ({ row }) => <span className="strong font-semibold">{row.original.topic}</span>,
  },
  {
    accessorKey: "producer_count",
    header: "Producers",
    meta: { align: "right" },
  },
  {
    accessorKey: "consumer_group_count",
    header: "Groups",
    meta: { align: "right" },
  },
  {
    accessorKey: "rate_per_sec",
    header: "Msg/s",
    meta: { align: "right" },
    cell: ({ row }) => fmtRate(row.original.rate_per_sec),
  },
  {
    id: "chevron",
    header: "",
    size: 32,
    cell: () => <ChevronRight size={14} className="text-[var(--fg-3)]" />,
  },
];

interface Props {
  readonly topics: readonly TopicNode[];
  readonly onTopicClick?: (topic: TopicNode) => void;
}

export function KafkaTopicsTable({ topics, onTopicClick }: Props) {
  return (
    <DataTable
      data={{
        columns: columns as ColumnDef<TopicNode, unknown>[],
        rows: topics as TopicNode[],
      }}
      config={{
        emptyText: "No topics in scope",
        onRow: (row) => ({
          onClick: () => onTopicClick?.(row),
          className: "cursor-pointer",
        }),
      }}
    />
  );
}
