import { z } from "zod";

import { numericValue, stringValue } from "./saturationClient";

export const kafkaSummaryStatsSchema = z
  .object({
    publish_rate_per_sec: numericValue,
    receive_rate_per_sec: numericValue,
    max_lag: numericValue,
    publish_p95_ms: numericValue,
    receive_p95_ms: numericValue,
  })
  .strict();

export const topicRatePointSchema = z
  .object({
    timestamp: stringValue,
    topic: stringValue,
    rate_per_sec: numericValue,
  })
  .strict();

export const topicLatencyPointSchema = z
  .object({
    timestamp: stringValue,
    topic: stringValue,
    p50_ms: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
  })
  .strict();

export const groupRatePointSchema = z
  .object({
    timestamp: stringValue,
    consumer_group: stringValue,
    rate_per_sec: numericValue,
  })
  .strict();

export const groupLatencyPointSchema = z
  .object({
    timestamp: stringValue,
    consumer_group: stringValue,
    p50_ms: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
  })
  .strict();

export const lagPointSchema = z
  .object({
    timestamp: stringValue,
    consumer_group: stringValue,
    topic: stringValue,
    lag: numericValue,
  })
  .strict();

export const partitionLagSchema = z
  .object({
    topic: stringValue,
    partition: numericValue,
    consumer_group: stringValue,
    lag: numericValue,
  })
  .strict();

export const rebalancePointSchema = z
  .object({
    timestamp: stringValue,
    consumer_group: stringValue,
    rebalance_rate: numericValue,
    join_rate: numericValue,
    sync_rate: numericValue,
    heartbeat_rate: numericValue,
    failed_heartbeat_rate: numericValue,
    assigned_partitions: numericValue,
  })
  .strict();

export const e2eLatencyPointSchema = z
  .object({
    timestamp: stringValue,
    topic: stringValue,
    publish_p95_ms: numericValue,
    receive_p95_ms: numericValue,
    process_p95_ms: numericValue,
  })
  .strict();

export const errorRatePointSchema = z
  .object({
    timestamp: stringValue,
    topic: stringValue.optional(),
    consumer_group: stringValue.optional(),
    operation_name: stringValue.optional(),
    error_type: stringValue,
    error_rate: numericValue,
  })
  .passthrough();

export const brokerConnectionPointSchema = z
  .object({
    timestamp: stringValue,
    broker: stringValue,
    connections: numericValue,
  })
  .strict();

export const clientOpDurationPointSchema = z
  .object({
    timestamp: stringValue,
    operation_name: stringValue,
    p50_ms: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
  })
  .strict();

export type KafkaSummaryStats = z.infer<typeof kafkaSummaryStatsSchema>;
export type TopicRatePoint = z.infer<typeof topicRatePointSchema>;
export type TopicLatencyPoint = z.infer<typeof topicLatencyPointSchema>;
export type GroupRatePoint = z.infer<typeof groupRatePointSchema>;
export type GroupLatencyPoint = z.infer<typeof groupLatencyPointSchema>;
export type LagPoint = z.infer<typeof lagPointSchema>;
export type PartitionLag = z.infer<typeof partitionLagSchema>;
export type RebalancePoint = z.infer<typeof rebalancePointSchema>;
export type E2ELatencyPoint = z.infer<typeof e2eLatencyPointSchema>;
export type ErrorRatePoint = z.infer<typeof errorRatePointSchema>;
export type BrokerConnectionPoint = z.infer<typeof brokerConnectionPointSchema>;
export type ClientOpDurationPoint = z.infer<typeof clientOpDurationPointSchema>;
