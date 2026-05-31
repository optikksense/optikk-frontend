import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";

import type { PartitionLag } from "@/features/saturation/api/kafkaPanelsSchemas";
import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

import { useKafkaPartitionLag } from "../hooks/useKafkaPartitionLag";

const COLUMNS: SimpleTableColumn<PartitionLag>[] = [
  {
    title: "Topic",
    key: "topic",
    width: 260,
    render: (_v, row) => (
      <span className="truncate font-mono text-[12px] text-foreground">{row.topic}</span>
    ),
  },
  {
    title: "Partition",
    key: "partition",
    width: 100,
    align: "right",
    sorter: (a, b) => a.partition - b.partition,
    render: (_v, row) => row.partition,
  },
  {
    title: "Consumer group",
    key: "consumer_group",
    width: 260,
    render: (_v, row) => (
      <span className="truncate font-mono text-[12px] text-foreground-secondary">
        {row.consumer_group}
      </span>
    ),
  },
  {
    title: "Lag",
    key: "lag",
    width: 120,
    align: "right",
    sorter: (a, b) => a.lag - b.lag,
    defaultSortOrder: "descend",
    render: (_v, row) => <span className="font-mono">{fmtNum(row.lag)}</span>,
  },
];

export function PartitionLagTable() {
  const { data, isPending } = useKafkaPartitionLag();
  const rows = data ?? [];
  return (
    <PanelCard
      title="Lag per partition"
      subtitle={data ? `${rows.length} partitions` : undefined}
      padded={false}
    >
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground-muted">
          {isPending ? "Loading…" : "No partition lag in window."}
        </div>
      ) : (
        <SimpleTable
          columns={COLUMNS}
          dataSource={rows}
          rowKey={(r) => `${r.topic}/${r.partition}/${r.consumer_group}`}
          pagination={{ pageSize: 50 }}
          scroll={{ x: 740 }}
        />
      )}
    </PanelCard>
  );
}
