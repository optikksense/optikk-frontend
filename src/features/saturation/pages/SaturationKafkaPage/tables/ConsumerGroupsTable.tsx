import { useNavigate } from "@tanstack/react-router";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { dynamicNavigateOptions } from "@shared/utils/navigation";

import type { KafkaGroupRow } from "@/features/saturation/api/kafkaExplorerSchemas";
import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";
import { ROUTES } from "@/shared/constants/routes";

import { useKafkaConsumerGroupsTable } from "../hooks/useKafkaConsumerGroupsTable";

const COLUMNS: SimpleTableColumn<KafkaGroupRow>[] = [
  {
    title: "Consumer group",
    key: "consumer_group",
    width: 280,
    render: (_v, row) => (
      <span className="truncate font-mono text-[12px] text-[var(--text-primary)]">
        {row.consumer_group}
      </span>
    ),
  },
  {
    title: "Topics",
    key: "topic_count",
    width: 100,
    align: "right",
    sorter: (a, b) => a.topic_count - b.topic_count,
    render: (_v, row) => row.topic_count,
  },
  {
    title: "Partitions",
    key: "assigned_partitions",
    width: 110,
    align: "right",
    sorter: (a, b) => a.assigned_partitions - b.assigned_partitions,
    render: (_v, row) => fmtNum(row.assigned_partitions),
  },
  {
    title: "Commits / s",
    key: "commit_rate",
    width: 130,
    align: "right",
    sorter: (a, b) => a.commit_rate - b.commit_rate,
    defaultSortOrder: "descend",
    render: (_v, row) => <span className="font-mono">{fmtNum(row.commit_rate)}</span>,
  },
  {
    title: "Commit p95",
    key: "commit_latency_avg_ms",
    width: 120,
    align: "right",
    render: (_v, row) => <span className="font-mono">{fmtMs(row.commit_latency_max_ms)}</span>,
  },
];

export function ConsumerGroupsTable() {
  const navigate = useNavigate();
  const { data, isPending } = useKafkaConsumerGroupsTable();
  const rows = data ?? [];
  return (
    <PanelCard
      title="Consumer groups"
      subtitle={data ? `${rows.length} groups` : undefined}
      padded={false}
    >
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-[var(--text-muted)]">
          {isPending ? "Loading…" : "No consumer groups in window."}
        </div>
      ) : (
        <SimpleTable
          columns={COLUMNS}
          dataSource={rows}
          rowKey={(r) => r.consumer_group}
          pagination={{ pageSize: 50 }}
          onRow={(record) => ({
            onClick: () =>
              navigate(
                dynamicNavigateOptions(
                  ROUTES.saturationKafkaGroupDetail.replace(
                    "$groupId",
                    encodeURIComponent(record.consumer_group)
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
