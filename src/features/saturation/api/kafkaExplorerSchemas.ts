import { z } from "zod";

import { integerValue, numericValue, stringValue } from "./saturationClient";

export const kafkaSummarySchema = z
  .object({
    topic_count: integerValue,
    group_count: integerValue,
    bytes_per_sec: numericValue,
    assigned_partitions: numericValue,
  })
  .strict();

export const kafkaTopicRowSchema = z
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

export const kafkaGroupRowSchema = z
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

export const kafkaTopicConsumerRowSchema = z
  .object({
    consumer_group: stringValue,
    bytes_per_sec: numericValue,
    records_per_sec: numericValue,
    lag: numericValue,
    lead: numericValue,
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

export const kafkaTopicOverviewSchema = z
  .object({
    topic: stringValue,
    summary: kafkaTopicRowSchema,
    trend: z.array(kafkaTopicTrendPointSchema).default([]),
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

export const kafkaGroupOverviewSchema = z
  .object({
    consumer_group: stringValue,
    summary: kafkaGroupRowSchema,
    trend: z.array(kafkaGroupTrendPointSchema).default([]),
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

export type KafkaSummary = z.infer<typeof kafkaSummarySchema>;
export type KafkaTopicRow = z.infer<typeof kafkaTopicRowSchema>;
export type KafkaGroupRow = z.infer<typeof kafkaGroupRowSchema>;
export type KafkaTopicConsumerRow = z.infer<typeof kafkaTopicConsumerRowSchema>;
export type KafkaTopicOverview = z.infer<typeof kafkaTopicOverviewSchema>;
export type KafkaGroupOverview = z.infer<typeof kafkaGroupOverviewSchema>;
export type KafkaPartitionRow = z.infer<typeof kafkaPartitionRowSchema>;
