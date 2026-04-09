import { useNavigate } from "@tanstack/react-router";
import { Activity, Cable, Database, Gauge, Search, TimerReset, Waves } from "lucide-react";
import { useEffect, useMemo } from "react";

import {
  Badge,
  Input,
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { readDashboardDrawerState } from "@shared/components/ui/dashboard/utils/dashboardDrawerState";
import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
} from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";
import {
  type DatastoreSystemRow,
  type KafkaGroupRow,
  type KafkaTopicRow,
  saturationApi,
} from "../../api/saturationApi";
import { SaturationStatTile } from "../../components/SaturationStatTile";
import { resolveLegacySaturationPath } from "../../components/navigation";

const SECTION_DATASTORES = "datastores";
const SECTION_KAFKA = "kafka";
const KAFKA_TOPICS = "topics";
const KAFKA_GROUPS = "groups";

function formatBytesPerSecond(value: number): string {
  return `${formatBytes(value)}/s`;
}

function formatSeconds(value: number): string {
  return formatDuration(value * 1000);
}

function pillClass(active: boolean): string {
  return active
    ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]";
}

function categoryBadgeVariant(category: string): "info" | "warning" {
  return category === "redis" ? "warning" : "info";
}

export default function SaturationPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const legacyTab = searchParams.get("tab");
  const activeSection =
    searchParams.get("section") === SECTION_KAFKA || legacyTab === "queue"
      ? SECTION_KAFKA
      : SECTION_DATASTORES;
  const kafkaView = searchParams.get("kafkaView") === KAFKA_GROUPS ? KAFKA_GROUPS : KAFKA_TOPICS;
  const storeType = searchParams.get("storeType") ?? "all";
  const queryText = searchParams.get("q") ?? "";

  const drawerState = useMemo(() => readDashboardDrawerState(searchParams), [searchParams]);

  useEffect(() => {
    const legacyTarget = resolveLegacySaturationPath(drawerState.entity, drawerState.id);
    if (!legacyTarget) return;
    navigate({
      to: legacyTarget.to as any,
      search: legacyTarget.search as any,
      replace: true,
    });
  }, [drawerState.entity, drawerState.id, navigate]);

  const datastoreSummaryQuery = useTimeRangeQuery(
    "saturation-datastores-summary",
    (teamId, startTime, endTime) => saturationApi.getDatastoreSummary(teamId, startTime, endTime)
  );
  const datastoreSystemsQuery = useTimeRangeQuery(
    "saturation-datastores-systems",
    (teamId, startTime, endTime) => saturationApi.getDatastoreSystems(teamId, startTime, endTime)
  );
  const kafkaSummaryQuery = useTimeRangeQuery(
    "saturation-kafka-summary",
    (teamId, startTime, endTime) => saturationApi.getKafkaSummary(teamId, startTime, endTime)
  );
  const kafkaTopicsQuery = useTimeRangeQuery(
    "saturation-kafka-topics",
    (teamId, startTime, endTime) => saturationApi.getKafkaTopics(teamId, startTime, endTime)
  );
  const kafkaGroupsQuery = useTimeRangeQuery(
    "saturation-kafka-groups",
    (teamId, startTime, endTime) => saturationApi.getKafkaGroups(teamId, startTime, endTime)
  );

  const setSearchValue = (key: string, value: string | null): void => {
    const next = new URLSearchParams(searchParams);
    if (value?.trim()) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const datastoreRows = useMemo(() => {
    const needle = queryText.trim().toLowerCase();
    return (datastoreSystemsQuery.data ?? []).filter((row) => {
      if (storeType !== "all" && row.category !== storeType) return false;
      if (!needle) return true;
      return (
        row.system.toLowerCase().includes(needle) ||
        row.server_hint.toLowerCase().includes(needle) ||
        row.category.toLowerCase().includes(needle)
      );
    });
  }, [datastoreSystemsQuery.data, queryText, storeType]);

  const kafkaTopicRows = useMemo(() => {
    const needle = queryText.trim().toLowerCase();
    return (kafkaTopicsQuery.data ?? []).filter(
      (row) => !needle || row.topic.toLowerCase().includes(needle)
    );
  }, [kafkaTopicsQuery.data, queryText]);

  const kafkaGroupRows = useMemo(() => {
    const needle = queryText.trim().toLowerCase();
    return (kafkaGroupsQuery.data ?? []).filter(
      (row) => !needle || row.consumer_group.toLowerCase().includes(needle)
    );
  }, [kafkaGroupsQuery.data, queryText]);

  const datastoreColumns: SimpleTableColumn<DatastoreSystemRow>[] = [
    {
      title: "System",
      key: "system",
      width: 280,
      sticky: "left",
      render: (_value, row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[13px] text-[var(--text-primary)]">
              {row.system}
            </span>
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

  const kafkaTopicColumns: SimpleTableColumn<KafkaTopicRow>[] = [
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

  const kafkaGroupColumns: SimpleTableColumn<KafkaGroupRow>[] = [
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

  const datastoreSummary = datastoreSummaryQuery.data;
  const kafkaSummary = kafkaSummaryQuery.data;

  return (
    <PageShell>
      <PageHeader
        title="Saturation"
        subtitle="Observe queue backlogs, consumer pressure, query latency, and datastore contention from a dense, route-driven explorer."
        icon={<Gauge size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">
              {activeSection === SECTION_DATASTORES ? "Data Stores" : "Kafka"}
            </Badge>
            <Badge variant="warning">Frontend explorer</Badge>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {activeSection === SECTION_DATASTORES ? (
          <>
            <SaturationStatTile
              label="Systems"
              value={formatNumber(datastoreSummary?.total_systems ?? 0)}
              meta={`${formatNumber(datastoreSummary?.database_systems ?? 0)} databases • ${formatNumber(datastoreSummary?.redis_systems ?? 0)} redis`}
              icon={<Database size={16} />}
            />
            <SaturationStatTile
              label="Queries"
              value={formatNumber(datastoreSummary?.query_count ?? 0)}
              meta="Telemetry-backed DB and Redis operations in range"
              icon={<Activity size={16} />}
            />
            <SaturationStatTile
              label="P95 Latency"
              value={formatDuration(datastoreSummary?.p95_latency_ms ?? 0)}
              meta={`${formatPercentage(datastoreSummary?.error_rate ?? 0)} error rate`}
              icon={<TimerReset size={16} />}
            />
            <SaturationStatTile
              label="Active Conns"
              value={formatNumber(datastoreSummary?.active_connections ?? 0)}
              meta="Connection pools currently observed"
              icon={<Cable size={16} />}
            />
          </>
        ) : (
          <>
            <SaturationStatTile
              label="Topics"
              value={formatNumber(kafkaSummary?.topic_count ?? 0)}
              meta={`${formatNumber(kafkaSummary?.group_count ?? 0)} consumer groups observed`}
              icon={<Waves size={16} />}
            />
            <SaturationStatTile
              label="Consumer Groups"
              value={formatNumber(kafkaSummary?.group_count ?? 0)}
              meta="Raw Kafka client-id values surfaced as consumer groups"
              icon={<Activity size={16} />}
            />
            <SaturationStatTile
              label="Bytes/s"
              value={formatBytesPerSecond(kafkaSummary?.bytes_per_sec ?? 0)}
              meta="Topic traffic from Kafka consumer metrics"
              icon={<Gauge size={16} />}
            />
            <SaturationStatTile
              label="Assigned Partitions"
              value={formatNumber(kafkaSummary?.assigned_partitions ?? 0)}
              meta="Current partition ownership across observed consumer groups"
              icon={<TimerReset size={16} />}
            />
          </>
        )}
      </div>

      <PageSurface padding="sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
              <button
                type="button"
                onClick={() => setSearchValue("section", SECTION_DATASTORES)}
                className={`inline-flex items-center gap-2 rounded-[calc(var(--card-radius)+1px)] px-4 py-2 font-medium text-[12px] transition-colors ${pillClass(activeSection === SECTION_DATASTORES)}`}
              >
                <Database size={14} />
                Data Stores
              </button>
              <button
                type="button"
                onClick={() => setSearchValue("section", SECTION_KAFKA)}
                className={`inline-flex items-center gap-2 rounded-[calc(var(--card-radius)+1px)] px-4 py-2 font-medium text-[12px] transition-colors ${pillClass(activeSection === SECTION_KAFKA)}`}
              >
                <Waves size={14} />
                Kafka
              </button>
            </div>

            {activeSection === SECTION_DATASTORES ? (
              <div className="inline-flex rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "database", label: "Databases" },
                  { key: "redis", label: "Redis" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setSearchValue("storeType", item.key === "all" ? null : item.key)
                    }
                    className={`rounded-[calc(var(--card-radius)+1px)] px-3 py-2 font-medium text-[12px] transition-colors ${pillClass(storeType === item.key || (storeType === "all" && item.key === "all"))}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="inline-flex rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
                {[
                  { key: KAFKA_TOPICS, label: "Topics" },
                  { key: KAFKA_GROUPS, label: "Consumer Groups" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setSearchValue("kafkaView", item.key === KAFKA_TOPICS ? null : item.key)
                    }
                    className={`rounded-[calc(var(--card-radius)+1px)] px-3 py-2 font-medium text-[12px] transition-colors ${pillClass(kafkaView === item.key)}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative w-full max-w-md">
            <Search
              size={14}
              className="-translate-y-1/2 absolute top-1/2 left-3 text-[var(--text-muted)]"
            />
            <Input
              value={queryText}
              onChange={(event) => setSearchValue("q", event.target.value || null)}
              placeholder={
                activeSection === SECTION_DATASTORES
                  ? "Search systems, categories, or endpoints"
                  : kafkaView === KAFKA_TOPICS
                    ? "Search Kafka topics"
                    : "Search consumer groups"
              }
              className="pl-9"
            />
          </div>
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        {activeSection === SECTION_DATASTORES ? (
          <SimpleTable
            dataSource={datastoreRows}
            columns={datastoreColumns}
            rowKey={(row) => row.system}
            pagination={{ pageSize: 12 }}
            scroll={{ x: 960 }}
            onRow={(row) => ({
              onClick: () =>
                navigate({
                  to: ROUTES.saturationDatastoreDetail.replace(
                    "$system",
                    encodeURIComponent(row.system)
                  ) as any,
                }),
              className: "cursor-pointer",
            })}
          />
        ) : kafkaView === KAFKA_TOPICS ? (
          <SimpleTable
            dataSource={kafkaTopicRows}
            columns={kafkaTopicColumns}
            rowKey={(row) => row.topic}
            pagination={{ pageSize: 12 }}
            scroll={{ x: 1100 }}
            onRow={(row) => ({
              onClick: () =>
                navigate({
                  to: ROUTES.saturationKafkaTopicDetail.replace(
                    "$topic",
                    encodeURIComponent(row.topic)
                  ) as any,
                }),
              className: "cursor-pointer",
            })}
          />
        ) : (
          <SimpleTable
            dataSource={kafkaGroupRows}
            columns={kafkaGroupColumns}
            rowKey={(row) => row.consumer_group}
            pagination={{ pageSize: 12 }}
            scroll={{ x: 1760 }}
            onRow={(row) => ({
              onClick: () =>
                navigate({
                  to: ROUTES.saturationKafkaGroupDetail.replace(
                    "$groupId",
                    encodeURIComponent(row.consumer_group)
                  ) as any,
                }),
              className: "cursor-pointer",
            })}
          />
        )}
      </PageSurface>
    </PageShell>
  );
}
