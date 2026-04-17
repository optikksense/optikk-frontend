import { Badge } from "@shared/components/primitives/ui";
import type { SimpleTableColumn } from "@shared/components/primitives/ui";
import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
} from "@shared/utils/formatters";

import type { DatastoreSystemRow, KafkaGroupRow, KafkaTopicRow } from "../../api/saturationApi";

import { formatBytesPerSecond, formatSeconds } from "./formatUtils";
import { categoryBadgeVariant } from "./pillStyles";

export const DATASTORE_COLUMNS: SimpleTableColumn<DatastoreSystemRow>[] = [
  {
    title: "System",
    key: "system",
    width: 280,
    sticky: "left",
    render: (_value, row) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[13px] text-[var(--text-primary)]">{row.system}</span>
          <Badge variant={categoryBadgeVariant(row.category)}>{row.category}</Badge>
        </div>
        <span className="text-[11px] text-[var(--text-muted)]">
          {row.server_hint
            ? `Primary endpoint ${row.server_hint}`
            : "Telemetry-backed datastore surface"}
        </span>
      </div>
    ),
  },
  {
    title: "Queries",
    key: "query_count",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.query_count),
  },
  {
    title: "p95",
    key: "p95_latency_ms",
    align: "right",
    width: 110,
    render: (_value, row) => formatDuration(row.p95_latency_ms),
  },
  {
    title: "Err %",
    key: "error_rate",
    align: "right",
    width: 110,
    render: (_value, row) => formatPercentage(row.error_rate),
  },
  {
    title: "Connections",
    key: "active_connections",
    align: "right",
    width: 120,
    render: (_value, row) => formatNumber(row.active_connections),
  },
  {
    title: "Last Seen",
    key: "last_seen",
    width: 120,
    render: (_value, row) => formatRelativeTime(row.last_seen),
  },
];

export const KAFKA_TOPIC_COLUMNS: SimpleTableColumn<KafkaTopicRow>[] = [
  {
    title: "Topic",
    key: "topic",
    width: 280,
    sticky: "left",
    render: (_value, row) => (
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[13px] text-[var(--text-primary)]">{row.topic}</span>
        <span className="text-[11px] text-[var(--text-muted)]">
          {row.consumer_group_count} consumer groups tracking this topic
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
  {
    title: "Consumer Groups",
    key: "consumer_group_count",
    align: "right",
    width: 140,
    render: (_value, row) => formatNumber(row.consumer_group_count),
  },
];

export const KAFKA_GROUP_COLUMNS: SimpleTableColumn<KafkaGroupRow>[] = [
  {
    title: "Consumer Group",
    key: "consumer_group",
    width: 320,
    sticky: "left",
    render: (_value, row) => (
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[13px] text-[var(--text-primary)]">
          {row.consumer_group}
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">
          Raw Kafka client-id surfaced as consumer group
        </span>
      </div>
    ),
  },
  {
    title: "Assigned",
    key: "assigned_partitions",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.assigned_partitions),
  },
  {
    title: "Commit Rate",
    key: "commit_rate",
    align: "right",
    width: 120,
    render: (_value, row) => formatNumber(row.commit_rate),
  },
  {
    title: "Commit Avg",
    key: "commit_latency_avg_ms",
    align: "right",
    width: 120,
    render: (_value, row) => formatDuration(row.commit_latency_avg_ms),
  },
  {
    title: "Commit Max",
    key: "commit_latency_max_ms",
    align: "right",
    width: 120,
    render: (_value, row) => formatDuration(row.commit_latency_max_ms),
  },
  {
    title: "Fetch Rate",
    key: "fetch_rate",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.fetch_rate),
  },
  {
    title: "Fetch Avg",
    key: "fetch_latency_avg_ms",
    align: "right",
    width: 110,
    render: (_value, row) => formatDuration(row.fetch_latency_avg_ms),
  },
  {
    title: "Fetch Max",
    key: "fetch_latency_max_ms",
    align: "right",
    width: 110,
    render: (_value, row) => formatDuration(row.fetch_latency_max_ms),
  },
  {
    title: "Heartbeat",
    key: "heartbeat_rate",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.heartbeat_rate),
  },
  {
    title: "Failed Rebalance/hr",
    key: "failed_rebalance_per_hour",
    align: "right",
    width: 150,
    render: (_value, row) => formatNumber(row.failed_rebalance_per_hour),
  },
  {
    title: "Poll Idle",
    key: "poll_idle_ratio",
    align: "right",
    width: 110,
    render: (_value, row) => formatPercentage(row.poll_idle_ratio),
  },
  {
    title: "Last Poll",
    key: "last_poll_seconds_ago",
    align: "right",
    width: 110,
    render: (_value, row) => formatSeconds(row.last_poll_seconds_ago),
  },
  {
    title: "Connections",
    key: "connection_count",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.connection_count),
  },
];
