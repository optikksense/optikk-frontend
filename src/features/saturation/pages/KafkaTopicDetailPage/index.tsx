import { Layers3, TrendingUp, Waves } from "lucide-react";
import { useParams } from "@tanstack/react-router";

import {
  Badge,
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatBytes, formatNumber } from "@shared/utils/formatters";

import {
  type KafkaTopicConsumerRow,
  saturationApi,
} from "../../api/saturationApi";
import { SaturationStatTile } from "../../components/SaturationStatTile";

function formatBytesPerSecond(value: number): string {
  return `${formatBytes(value)}/s`;
}

export default function KafkaTopicDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const topic = decodeURIComponent(typeof params.topic === "string" ? params.topic : "");

  const overviewQuery = useTimeRangeQuery(
    "saturation-kafka-topic-overview",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaTopicOverview(topic, teamId, startTime, endTime),
    { extraKeys: [topic] }
  );
  const groupsQuery = useTimeRangeQuery(
    "saturation-kafka-topic-groups",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaTopicGroups(topic, teamId, startTime, endTime),
    { extraKeys: [topic] }
  );

  const groupColumns: SimpleTableColumn<KafkaTopicConsumerRow>[] = [
    {
      title: "Consumer Group",
      key: "consumer_group",
      width: 320,
      render: (_value, row) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-[var(--text-primary)]">{row.consumer_group}</span>
          <span className="text-[11px] text-[var(--text-muted)]">
            Raw Kafka client-id surfaced as consumer group
          </span>
        </div>
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
      title: "Records/s",
      key: "records_per_sec",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.records_per_sec),
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
        title={topic}
        subtitle="Topic detail derived from the Kafka consumer metrics currently stored in ClickHouse."
        icon={<Waves size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">Kafka topic</Badge>
            <Badge variant="warning">Consumer-group labels use raw client-id values</Badge>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <SaturationStatTile
          label="Bytes/s"
          value={formatBytesPerSecond(overview?.bytes_per_sec ?? 0)}
          meta="Current topic traffic"
          icon={<TrendingUp size={16} />}
        />
        <SaturationStatTile
          label="Bytes Total"
          value={formatBytes(overview?.bytes_total ?? 0)}
          meta="Latest total bytes consumed in range"
          icon={<TrendingUp size={16} />}
        />
        <SaturationStatTile
          label="Records/s"
          value={formatNumber(overview?.records_per_sec ?? 0)}
          meta="Current record throughput"
          icon={<TrendingUp size={16} />}
        />
        <SaturationStatTile
          label="Records Total"
          value={formatNumber(overview?.records_total ?? 0)}
          meta="Latest total records consumed in range"
          icon={<TrendingUp size={16} />}
        />
        <SaturationStatTile
          label="Lag"
          value={formatNumber(overview?.lag ?? 0)}
          meta={`Lead ${formatNumber(overview?.lead ?? 0)}`}
          icon={<Waves size={16} />}
        />
        <SaturationStatTile
          label="Consumer Groups"
          value={formatNumber(overview?.consumer_group_count ?? 0)}
          meta="Distinct raw client-id values attached to this topic"
          icon={<Layers3 size={16} />}
        />
      </div>

      <PageSurface padding="lg">
        <div className="mb-3">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Consumer Groups
          </div>
          <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
            Groups consuming this topic
          </div>
        </div>
        <SimpleTable
          dataSource={groupsQuery.data ?? []}
          columns={groupColumns}
          rowKey={(row) => row.consumer_group}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 920 }}
        />
      </PageSurface>
    </PageShell>
  );
}
