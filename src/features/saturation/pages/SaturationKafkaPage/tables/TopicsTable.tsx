import { useNavigate } from "@tanstack/react-router";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { dynamicNavigateOptions } from "@shared/utils/navigation";

import type { KafkaTopicRow } from "@/features/saturation/api/kafkaExplorerSchemas";
import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";
import { ROUTES } from "@/shared/constants/routes";

import { useKafkaTopicsTable } from "../hooks/useKafkaTopicsTable";

function bytesPerSec(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} GB/s`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)} MB/s`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)} KB/s`;
  return `${Math.round(value)} B/s`;
}

const COLUMNS: SimpleTableColumn<KafkaTopicRow>[] = [
  {
    title: "Topic",
    key: "topic",
    width: 280,
    render: (_v, row) => (
      <span className="truncate font-mono text-[12px] text-foreground">{row.topic}</span>
    ),
  },
  {
    title: "Records / s",
    key: "records_per_sec",
    width: 140,
    align: "right",
    sorter: (a, b) => a.records_per_sec - b.records_per_sec,
    defaultSortOrder: "descend",
    render: (_v, row) => <span className="font-mono">{fmtNum(row.records_per_sec)}</span>,
  },
  {
    title: "Bytes / s",
    key: "bytes_per_sec",
    width: 130,
    align: "right",
    sorter: (a, b) => a.bytes_per_sec - b.bytes_per_sec,
    render: (_v, row) => <span className="font-mono">{bytesPerSec(row.bytes_per_sec)}</span>,
  },
  {
    title: "Lag",
    key: "lag",
    width: 110,
    align: "right",
    sorter: (a, b) => a.lag - b.lag,
    render: (_v, row) => <span className="font-mono">{fmtMs(row.lag)}</span>,
  },
  {
    title: "Consumers",
    key: "consumer_group_count",
    width: 110,
    align: "right",
    render: (_v, row) => row.consumer_group_count,
  },
];

export function TopicsTable() {
  const navigate = useNavigate();
  const { data, isPending } = useKafkaTopicsTable();
  const rows = data ?? [];
  return (
    <PanelCard title="Topics" subtitle={data ? `${rows.length} topics` : undefined} padded={false}>
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground-muted">
          {isPending ? "Loading…" : "No topics in window."}
        </div>
      ) : (
        <SimpleTable
          columns={COLUMNS}
          dataSource={rows}
          rowKey={(r) => r.topic}
          pagination={{ pageSize: 50 }}
          onRow={(record) => ({
            onClick: () =>
              navigate(
                dynamicNavigateOptions(
                  ROUTES.saturationKafkaTopicDetail.replace(
                    "$topic",
                    encodeURIComponent(record.topic)
                  )
                )
              ),
            style: { cursor: "pointer" },
          })}
        />
      )}
    </PanelCard>
  );
}
