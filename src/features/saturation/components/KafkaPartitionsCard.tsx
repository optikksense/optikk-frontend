import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { PageSurface } from "@shared/components/ui";
import { formatNumber } from "@shared/utils/formatters";

import type { KafkaPartitionRow } from "@/features/saturation/api/kafkaExplorerSchemas";

interface KafkaPartitionsCardProps {
  readonly rows: KafkaPartitionRow[];
  /** When "topic", the leading identity column is the consumer group (topic is fixed) and vice-versa. */
  readonly scope: "topic" | "group";
}

function buildColumns(scope: "topic" | "group"): SimpleTableColumn<KafkaPartitionRow>[] {
  const identity: SimpleTableColumn<KafkaPartitionRow> =
    scope === "topic"
      ? {
          title: "Consumer group",
          key: "consumer_group",
          width: 300,
          render: (_v, row) => (
            <span className="font-mono text-[12px] text-foreground">{row.consumer_group}</span>
          ),
        }
      : {
          title: "Topic",
          key: "topic",
          width: 300,
          render: (_v, row) => (
            <span className="font-mono text-[12px] text-foreground">{row.topic}</span>
          ),
        };
  return [
    identity,
    {
      title: "Partition",
      key: "partition",
      align: "right",
      width: 110,
      sorter: (a, b) => a.partition - b.partition,
      render: (_v, row) => row.partition,
    },
    {
      title: "Lag",
      key: "lag",
      align: "right",
      width: 120,
      sorter: (a, b) => a.lag - b.lag,
      defaultSortOrder: "descend",
      render: (_v, row) => <span className="font-mono">{formatNumber(row.lag)}</span>,
    },
  ];
}

export function KafkaPartitionsCard({ rows, scope }: KafkaPartitionsCardProps) {
  return (
    <PageSurface padding="lg">
      <div className="mb-3">
        <div className="text-[11px] text-foreground-muted uppercase tracking-[0.08em]">
          Partitions
        </div>
        <div className="mt-2 font-semibold text-[18px] text-foreground">Partition-level lag</div>
      </div>
      <SimpleTable
        dataSource={rows}
        columns={buildColumns(scope)}
        rowKey={(row) => `${row.topic}/${row.partition}/${row.consumer_group}`}
        pagination={{ pageSize: 12 }}
        scroll={{ x: 560 }}
      />
    </PageSurface>
  );
}
