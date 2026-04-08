import { Badge, SimpleTable, Skeleton } from "@/components/ui";
import { APP_COLORS } from "@config/colorLiterals";
import type { SimpleTableColumn } from "@shared/components/primitives/ui/simple-table";
import { formatNumber } from "@shared/utils/formatters";
import type React from "react";

interface KafkaMetric {
  queue: string;
  avg_consumer_lag: number;
  avg_queue_depth: number;
  [key: string]: unknown;
}

interface KafkaSaturationTableProps {
  data: KafkaMetric[];
  loading: boolean;
}

export const KafkaSaturationTable: React.FC<KafkaSaturationTableProps> = ({ data, loading }) => {
  const columns: SimpleTableColumn<KafkaMetric>[] = [
    {
      title: "Kafka Queue",
      dataIndex: "queue",
      key: "queue",
      render: (value) => (
        <Badge
          variant="warning"
          style={{
            background: APP_COLORS.rgba_247_144_9_0p15,
            color: APP_COLORS.hex_f79009,
            border: `1px solid ${APP_COLORS.rgba_247_144_9_0p3_2}`,
          }}
        >
          {String(value ?? "unknown")}
        </Badge>
      ),
    },
    {
      title: "Consumer Lag (Avg)",
      dataIndex: "avg_consumer_lag",
      key: "avg_consumer_lag",
      render: (value) => formatNumber(typeof value === "number" ? value : Number(value ?? 0)),
      sorter: (a: KafkaMetric, b: KafkaMetric) => a.avg_consumer_lag - b.avg_consumer_lag,
      align: "right" as const,
    },
    {
      title: "Queue Depth (Avg)",
      dataIndex: "avg_queue_depth",
      key: "avg_queue_depth",
      render: (value) => formatNumber(typeof value === "number" ? value : Number(value ?? 0)),
      sorter: (a: KafkaMetric, b: KafkaMetric) => a.avg_queue_depth - b.avg_queue_depth,
      align: "right" as const,
    },
  ];

  if (loading) return <Skeleton />;
  if (data.length === 0)
    return (
      <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
        No messaging data in selected time range
      </div>
    );

  return (
    <SimpleTable
      dataSource={data.map((m, i) => ({ ...m, key: i }))}
      columns={columns}
      size="small"
      pagination={{ pageSize: 20 }}
      scroll={{ x: 800 }}
    />
  );
};
