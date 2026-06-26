import { z } from "zod";

import { integerValue, numericValue, stringValue } from "./saturationClient";

// ----------------- TOPIC DOMAINS -----------------

export const topicThroughputSchema = z
  .object({
    topic: stringValue,
    bytes_per_sec: numericValue,
    bytes_total: numericValue,
    records_per_sec: numericValue,
    records_total: numericValue,
  })
  .strict();

export const topicLagSchema = z
  .object({
    topic: stringValue,
    lag: numericValue,
    lead: numericValue,
  })
  .strict();

export const topicConsumersSchema = z
  .object({
    topic: stringValue,
    consumer_group_count: integerValue,
  })
  .strict();

export const topicBacklogSchema = z
  .object({
    topic: stringValue,
    partition_count: numericValue,
    backlog: numericValue,
  })
  .strict();

export const groupPartitionsSchema = z
  .object({
    consumer_group: stringValue,
    assigned_partitions: numericValue,
    topic_count: integerValue,
    members: numericValue,
  })
  .strict();

export const groupCommitsSchema = z
  .object({
    consumer_group: stringValue,
    commit_rate: numericValue,
    commit_latency_avg_ms: numericValue,
    commit_latency_max_ms: numericValue,
  })
  .strict();

export const groupFetchesSchema = z
  .object({
    consumer_group: stringValue,
    fetch_rate: numericValue,
    fetch_latency_avg_ms: numericValue,
    fetch_latency_max_ms: numericValue,
  })
  .strict();

export const groupHealthSchema = z
  .object({
    consumer_group: stringValue,
    heartbeat_rate: numericValue,
    failed_rebalance_per_hour: numericValue,
    poll_idle_ratio: numericValue,
    last_poll_seconds_ago: numericValue,
    connection_count: numericValue,
  })
  .strict();

export const topicGroupThroughputSchema = z
  .object({
    consumer_group: stringValue,
    bytes_per_sec: numericValue,
    records_per_sec: numericValue,
  })
  .strict();

export const topicGroupLagSchema = z
  .object({
    consumer_group: stringValue,
    lag: numericValue,
    lead: numericValue,
  })
  .strict();

export const groupTopicSchema = z
  .object({
    topic: stringValue,
    bytes_per_sec: numericValue,
    bytes_total: numericValue,
    records_per_sec: numericValue,
    records_total: numericValue,
    lag: numericValue,
    lead: numericValue,
  })
  .strict();

export const kafkaPartitionRowSchema = z
  .object({
    topic: stringValue,
    partition: integerValue,
    consumer_group: stringValue,
    lag: numericValue,
  })
  .strict();

export const clusterHealthSchema = z
  .object({
    broker_count: numericValue,
    active_controllers: numericValue,
    under_replicated_partitions: integerValue,
  })
  .strict();

export const kafkaSummarySchema = z
  .object({
    topic_count: integerValue,
    group_count: integerValue,
    messages_per_sec: numericValue,
    assigned_partitions: numericValue,
  })
  .strict();

export const kafkaTopicTrendPointSchema = z
  .object({
    timestamp: stringValue,
    bytes_per_sec: numericValue,
    records_per_sec: numericValue,
    lag: numericValue,
    lead: numericValue,
  })
  .strict();

export const kafkaGroupTrendPointSchema = z
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

export type TopicThroughputRow = z.infer<typeof topicThroughputSchema>;
export type TopicLagRow = z.infer<typeof topicLagSchema>;
export type TopicConsumersRow = z.infer<typeof topicConsumersSchema>;
export type TopicBacklogRow = z.infer<typeof topicBacklogSchema>;

export type GroupPartitionsRow = z.infer<typeof groupPartitionsSchema>;
export type GroupCommitsRow = z.infer<typeof groupCommitsSchema>;
export type GroupFetchesRow = z.infer<typeof groupFetchesSchema>;
export type GroupHealthRow = z.infer<typeof groupHealthSchema>;

export type TopicGroupThroughputRow = z.infer<typeof topicGroupThroughputSchema>;
export type TopicGroupLagRow = z.infer<typeof topicGroupLagSchema>;
export type GroupTopicRow = z.infer<typeof groupTopicSchema>;

export type KafkaPartitionRow = z.infer<typeof kafkaPartitionRowSchema>;
export type KafkaSummary = z.infer<typeof kafkaSummarySchema>;
export type ClusterHealthRow = z.infer<typeof clusterHealthSchema>;

export type KafkaTopicRow = TopicThroughputRow & TopicLagRow & TopicConsumersRow & TopicBacklogRow;

export type KafkaGroupRow = GroupPartitionsRow &
  GroupCommitsRow &
  GroupFetchesRow &
  GroupHealthRow & {
    topic_count: number;
  };

export type KafkaTopicConsumerRow = TopicGroupThroughputRow & TopicGroupLagRow;

export type KafkaTopicOverview = {
  topic: string;
  summary: KafkaTopicRow;
  trend: any[];
};

export type KafkaGroupOverview = {
  consumer_group: string;
  summary: KafkaGroupRow;
  trend: any[];
};
