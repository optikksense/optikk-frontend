import { Activity, Cable, Layers3, TimerReset, Waves } from "lucide-react";
import { useParams } from "@tanstack/react-router";

import {
  Badge,
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatBytes, formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { type KafkaTopicRow, saturationApi } from "../../api/saturationApi";
import { SaturationStatTile } from "../../components/SaturationStatTile";

function formatBytesPerSecond(value: number): string {
  return `${formatBytes(value)}/s`;
}

function formatSeconds(value: number): string {
  return formatDuration(value * 1000);
}

export default function KafkaGroupDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const groupId = decodeURIComponent(typeof params.groupId === "string" ? params.groupId : "");

  const overviewQuery = useTimeRangeQuery(
    "saturation-kafka-group-overview",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaGroupOverview(groupId, teamId, startTime, endTime),
    { extraKeys: [groupId] }
  );
  const topicsQuery = useTimeRangeQuery(
    "saturation-kafka-group-topics",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaGroupTopics(groupId, teamId, startTime, endTime),
    { extraKeys: [groupId] }
  );

  const topicColumns: SimpleTableColumn<KafkaTopicRow>[] = [
    {
      title: "Topic",
      key: "topic",
      width: 260,
      render: (_value, row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.topic}</span>
      ),
    },
    {
      title: "Bytes/s",
      key: "bytes_per_sec",
      align: "right",
      width: 120,
      render: (_value, row) => formatBytesPerSecond(row.bytes_per_sec),
    },
    {
      title: "Bytes Total",
      key: "bytes_total",
      align: "right",
      width: 120,
      render: (_value, row) => formatBytes(row.bytes_total),
    },
    {
      title: "Records/s",
      key: "records_per_sec",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.records_per_sec),
    },
    {
      title: "Records Total",
      key: "records_total",
      align: "right",
      width: 120,
      render: (_value, row) => formatNumber(row.records_total),
    },
    {
      title: "Lag",
      key: "lag",
      align: "right",
      width: 100,
      render: (_value, row) => formatNumber(row.lag),
    },
    {
      title: "Lead",
      key: "lead",
      align: "right",
      width: 100,
      render: (_value, row) => formatNumber(row.lead),
    },
  ];

  const overview = overviewQuery.data?.summary;

  return (
    <PageShell>
      <PageHeader
        title={groupId}
        subtitle="Consumer-group detail backed by the raw Kafka client-id stored in ClickHouse."
        icon={<Layers3 size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">Consumer group</Badge>
            <Badge variant="info">Raw Kafka client-id</Badge>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <SaturationStatTile
          label="Assigned"
          value={formatNumber(overview?.assigned_partitions ?? 0)}
          meta="Current assigned partitions"
          icon={<Layers3 size={16} />}
        />
        <SaturationStatTile
          label="Commit Rate"
          value={formatNumber(overview?.commit_rate ?? 0)}
          meta={`${formatDuration(overview?.commit_latency_avg_ms ?? 0)} avg latency`}
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Fetch Rate"
          value={formatNumber(overview?.fetch_rate ?? 0)}
          meta={`${formatDuration(overview?.fetch_latency_max_ms ?? 0)} max latency`}
          icon={<TimerReset size={16} />}
        />
        <SaturationStatTile
          label="Heartbeat"
          value={formatNumber(overview?.heartbeat_rate ?? 0)}
          meta={`${formatNumber(overview?.failed_rebalance_per_hour ?? 0)} failed rebalance/hr`}
          icon={<Waves size={16} />}
        />
        <SaturationStatTile
          label="Poll Idle"
          value={formatPercentage(overview?.poll_idle_ratio ?? 0)}
          meta={`Last poll ${formatSeconds(overview?.last_poll_seconds_ago ?? 0)}`}
          icon={<TimerReset size={16} />}
        />
        <SaturationStatTile
          label="Connections"
          value={formatNumber(overview?.connection_count ?? 0)}
          meta={`${formatNumber(overview?.topic_count ?? 0)} topics observed`}
          icon={<Cable size={16} />}
        />
      </div>

      <PageSurface padding="lg">
        <div className="mb-3">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Topics
          </div>
          <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
            Topics handled by this consumer group
          </div>
        </div>
        <SimpleTable
          dataSource={topicsQuery.data ?? []}
          columns={topicColumns}
          rowKey={(row) => row.topic}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1060 }}
        />
      </PageSurface>
    </PageShell>
  );
}
