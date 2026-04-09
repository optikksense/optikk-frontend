import { z } from "zod";

import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { validateResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const numericValue = z.coerce.number().default(0);
const integerValue = z.coerce.number().int().default(0);
const stringValue = z.string().default("");

const datastoreSummarySchema = z
  .object({
    total_systems: integerValue,
    database_systems: integerValue,
    redis_systems: integerValue,
    query_count: numericValue,
    p95_latency_ms: numericValue,
    error_rate: numericValue,
    active_connections: numericValue,
  })
  .strict();

const datastoreSystemRowSchema = z
  .object({
    system: stringValue,
    category: stringValue,
    query_count: numericValue,
    avg_latency_ms: numericValue,
    p95_latency_ms: numericValue,
    error_rate: numericValue,
    active_connections: numericValue,
    server_hint: stringValue,
    last_seen: stringValue,
  })
  .strict();

const datastoreCollectionSpotlightSchema = z
  .object({
    collection_name: stringValue,
    p99_ms: numericValue,
    ops_per_sec: numericValue,
  })
  .strict();

const datastoreOverviewSchema = z
  .object({
    system: stringValue,
    category: stringValue,
    query_count: numericValue,
    error_rate: numericValue,
    avg_latency_ms: numericValue,
    p95_latency_ms: numericValue,
    p99_latency_ms: numericValue,
    active_connections: numericValue,
    cache_hit_rate: numericValue.optional(),
    top_server: stringValue,
    namespace_count: integerValue,
    collection_count: integerValue,
    read_ops_per_sec: numericValue,
    write_ops_per_sec: numericValue,
    top_collections: z.array(datastoreCollectionSpotlightSchema).default([]),
  })
  .strict();

const datastoreServerRowSchema = z
  .object({
    server: stringValue,
    p50_ms: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
  })
  .strict();

const datastoreNamespaceRowSchema = z
  .object({
    namespace: stringValue,
    span_count: numericValue,
  })
  .strict();

const datastoreOperationRowSchema = z
  .object({
    operation: stringValue,
    ops_per_sec: numericValue,
    p50_ms: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
    errors_per_sec: numericValue,
  })
  .strict();

const datastoreErrorRowSchema = z
  .object({
    error_type: stringValue,
    errors_per_sec: numericValue,
  })
  .strict();

const datastoreConnectionRowSchema = z
  .object({
    pool_name: stringValue,
    used_connections: numericValue,
    util_pct: numericValue,
    pending_requests: numericValue,
    timeout_rate: numericValue,
    p95_wait_ms: numericValue,
    max_connections: numericValue,
    idle_max: numericValue,
    idle_min: numericValue,
  })
  .strict();

const slowQueryPatternSchema = z
  .object({
    query_text: stringValue,
    collection_name: stringValue,
    p50_ms: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
    call_count: numericValue,
    error_count: numericValue,
  })
  .strict();

const kafkaSummarySchema = z
  .object({
    topic_count: integerValue,
    group_count: integerValue,
    bytes_per_sec: numericValue,
    assigned_partitions: numericValue,
  })
  .strict();

const kafkaTopicRowSchema = z
  .object({
    topic: stringValue,
    bytes_per_sec: numericValue,
    bytes_total: numericValue,
    records_per_sec: numericValue,
    records_total: numericValue,
    lag: numericValue,
    lead: numericValue,
    consumer_group_count: integerValue,
  })
  .strict();

const kafkaGroupRowSchema = z
  .object({
    consumer_group: stringValue,
    assigned_partitions: numericValue,
    commit_rate: numericValue,
    commit_latency_avg_ms: numericValue,
    commit_latency_max_ms: numericValue,
    fetch_rate: numericValue,
    fetch_latency_avg_ms: numericValue,
    fetch_latency_max_ms: numericValue,
    heartbeat_rate: numericValue,
    failed_rebalance_per_hour: numericValue,
    poll_idle_ratio: numericValue,
    last_poll_seconds_ago: numericValue,
    connection_count: numericValue,
    topic_count: integerValue,
  })
  .strict();

const kafkaTopicConsumerRowSchema = z
  .object({
    consumer_group: stringValue,
    bytes_per_sec: numericValue,
    records_per_sec: numericValue,
    lag: numericValue,
    lead: numericValue,
  })
  .strict();

const kafkaTopicTrendPointSchema = z
  .object({
    timestamp: stringValue,
    bytes_per_sec: numericValue,
    records_per_sec: numericValue,
    lag: numericValue,
    lead: numericValue,
  })
  .strict();

const kafkaTopicOverviewSchema = z
  .object({
    topic: stringValue,
    summary: kafkaTopicRowSchema,
    trend: z.array(kafkaTopicTrendPointSchema).default([]),
  })
  .strict();

const kafkaGroupTrendPointSchema = z
  .object({
    timestamp: stringValue,
    assigned_partitions: numericValue,
    commit_rate: numericValue,
    fetch_rate: numericValue,
    heartbeat_rate: numericValue,
    failed_rebalance_per_hour: numericValue,
    connection_count: numericValue,
    poll_idle_ratio: numericValue,
    last_poll_seconds_ago: numericValue,
  })
  .strict();

const kafkaGroupOverviewSchema = z
  .object({
    consumer_group: stringValue,
    summary: kafkaGroupRowSchema,
    trend: z.array(kafkaGroupTrendPointSchema).default([]),
  })
  .strict();

const kafkaPartitionRowSchema = z
  .object({
    topic: stringValue,
    partition: integerValue,
    consumer_group: stringValue,
    lag: numericValue,
  })
  .strict();

export type DatastoreSummary = z.infer<typeof datastoreSummarySchema>;
export type DatastoreSystemRow = z.infer<typeof datastoreSystemRowSchema>;
export type DatastoreCollectionSpotlight = z.infer<typeof datastoreCollectionSpotlightSchema>;
export type DatastoreOverview = z.infer<typeof datastoreOverviewSchema>;
export type DatastoreServerRow = z.infer<typeof datastoreServerRowSchema>;
export type DatastoreNamespaceRow = z.infer<typeof datastoreNamespaceRowSchema>;
export type DatastoreOperationRow = z.infer<typeof datastoreOperationRowSchema>;
export type DatastoreErrorRow = z.infer<typeof datastoreErrorRowSchema>;
export type DatastoreConnectionRow = z.infer<typeof datastoreConnectionRowSchema>;
export type SlowQueryPattern = z.infer<typeof slowQueryPatternSchema>;
export type KafkaSummary = z.infer<typeof kafkaSummarySchema>;
export type KafkaTopicRow = z.infer<typeof kafkaTopicRowSchema>;
export type KafkaGroupRow = z.infer<typeof kafkaGroupRowSchema>;
export type KafkaTopicConsumerRow = z.infer<typeof kafkaTopicConsumerRowSchema>;
export type KafkaTopicOverview = z.infer<typeof kafkaTopicOverviewSchema>;
export type KafkaGroupOverview = z.infer<typeof kafkaGroupOverviewSchema>;
export type KafkaPartitionRow = z.infer<typeof kafkaPartitionRowSchema>;

function rangeParams(startTime: RequestTime, endTime: RequestTime) {
  return { startTime, endTime };
}

export const saturationApi = {
  async getDatastoreSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DatastoreSummary> {
    const data = await api.get(`${BASE}/saturation/datastores/summary`, {
      params: rangeParams(startTime, endTime),
    });
    return validateResponse(datastoreSummarySchema, data);
  },

  async getDatastoreSystems(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DatastoreSystemRow[]> {
    const data = await api.get(`${BASE}/saturation/datastores/systems`, {
      params: rangeParams(startTime, endTime),
    });
    return validateResponse(z.array(datastoreSystemRowSchema), data);
  },

  async getDatastoreOverview(
    system: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DatastoreOverview> {
    const data = await api.get(`${BASE}/saturation/datastores/system/overview`, {
      params: { ...rangeParams(startTime, endTime), system },
    });
    return validateResponse(datastoreOverviewSchema, data);
  },

  async getDatastoreServers(
    system: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DatastoreServerRow[]> {
    const data = await api.get(`${BASE}/saturation/datastores/system/servers`, {
      params: { ...rangeParams(startTime, endTime), system },
    });
    return validateResponse(z.array(datastoreServerRowSchema), data);
  },

  async getDatastoreNamespaces(
    system: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DatastoreNamespaceRow[]> {
    const data = await api.get(`${BASE}/saturation/datastores/system/namespaces`, {
      params: { ...rangeParams(startTime, endTime), system },
    });
    return validateResponse(z.array(datastoreNamespaceRowSchema), data);
  },

  async getDatastoreOperations(
    system: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DatastoreOperationRow[]> {
    const data = await api.get(`${BASE}/saturation/datastores/system/operations`, {
      params: { ...rangeParams(startTime, endTime), system },
    });
    return validateResponse(z.array(datastoreOperationRowSchema), data);
  },

  async getDatastoreErrors(
    system: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DatastoreErrorRow[]> {
    const data = await api.get(`${BASE}/saturation/datastores/system/errors`, {
      params: { ...rangeParams(startTime, endTime), system },
    });
    return validateResponse(z.array(datastoreErrorRowSchema), data);
  },

  async getDatastoreConnections(
    system: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DatastoreConnectionRow[]> {
    const data = await api.get(`${BASE}/saturation/datastores/system/connections`, {
      params: { ...rangeParams(startTime, endTime), system },
    });
    return validateResponse(z.array(datastoreConnectionRowSchema), data);
  },

  async getDatastoreSlowQueries(
    system: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<SlowQueryPattern[]> {
    const data = await api.get(`${BASE}/saturation/datastores/system/slow-queries`, {
      params: { ...rangeParams(startTime, endTime), system },
    });
    return validateResponse(z.array(slowQueryPatternSchema), data);
  },

  async getKafkaSummary(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<KafkaSummary> {
    const data = await api.get(`${BASE}/saturation/kafka/summary`, {
      params: rangeParams(startTime, endTime),
    });
    return validateResponse(kafkaSummarySchema, data);
  },

  async getKafkaTopics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<KafkaTopicRow[]> {
    const data = await api.get(`${BASE}/saturation/kafka/topics`, {
      params: rangeParams(startTime, endTime),
    });
    return validateResponse(z.array(kafkaTopicRowSchema), data);
  },

  async getKafkaGroups(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<KafkaGroupRow[]> {
    const data = await api.get(`${BASE}/saturation/kafka/groups`, {
      params: rangeParams(startTime, endTime),
    });
    return validateResponse(z.array(kafkaGroupRowSchema), data);
  },

  async getKafkaTopicOverview(
    topic: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<KafkaTopicOverview> {
    const data = await api.get(`${BASE}/saturation/kafka/topic/overview`, {
      params: { ...rangeParams(startTime, endTime), topic },
    });
    return validateResponse(kafkaTopicOverviewSchema, data);
  },

  async getKafkaTopicGroups(
    topic: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<KafkaTopicConsumerRow[]> {
    const data = await api.get(`${BASE}/saturation/kafka/topic/groups`, {
      params: { ...rangeParams(startTime, endTime), topic },
    });
    return validateResponse(z.array(kafkaTopicConsumerRowSchema), data);
  },

  async getKafkaTopicPartitions(
    topic: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<KafkaPartitionRow[]> {
    const data = await api.get(`${BASE}/saturation/kafka/topic/partitions`, {
      params: { ...rangeParams(startTime, endTime), topic },
    });
    return validateResponse(z.array(kafkaPartitionRowSchema), data);
  },

  async getKafkaGroupOverview(
    group: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<KafkaGroupOverview> {
    const data = await api.get(`${BASE}/saturation/kafka/group/overview`, {
      params: { ...rangeParams(startTime, endTime), group },
    });
    return validateResponse(kafkaGroupOverviewSchema, data);
  },

  async getKafkaGroupTopics(
    group: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<KafkaTopicRow[]> {
    const data = await api.get(`${BASE}/saturation/kafka/group/topics`, {
      params: { ...rangeParams(startTime, endTime), group },
    });
    return validateResponse(z.array(kafkaTopicRowSchema), data);
  },

  async getKafkaGroupPartitions(
    group: string,
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<KafkaPartitionRow[]> {
    const data = await api.get(`${BASE}/saturation/kafka/group/partitions`, {
      params: { ...rangeParams(startTime, endTime), group },
    });
    return validateResponse(z.array(kafkaPartitionRowSchema), data);
  },
};
