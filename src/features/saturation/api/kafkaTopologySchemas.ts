import { z } from "zod";

import { numericValue, stringValue } from "./saturationClient";

// Mirrors query/internal/modules/saturation/kafka/topology models.

const producerNodeSchema = z.object({
  service: stringValue,
  rate_per_sec: numericValue,
  error_rate: numericValue,
  p50_ms: numericValue,
  p95_ms: numericValue,
  p99_ms: numericValue,
});

const topicNodeSchema = z.object({
  topic: stringValue,
  rate_per_sec: numericValue,
  producer_count: numericValue,
  consumer_group_count: numericValue,
});

const consumerNodeSchema = z.object({
  service: stringValue,
  group: stringValue,
  rate_per_sec: numericValue,
  error_rate: numericValue,
  p50_ms: numericValue,
  p95_ms: numericValue,
  p99_ms: numericValue,
});

const streamEdgeSchema = z.object({
  source: stringValue,
  target: stringValue,
  kind: z.enum(["produce", "consume"]),
  rate_per_sec: numericValue,
});

const pathwaySchema = z.object({
  producer: stringValue,
  topic: stringValue,
  group: stringValue,
  consumer: stringValue,
  produce_rate_per_sec: numericValue,
  consume_rate_per_sec: numericValue,
  error_rate: numericValue,
});

// Every slice is built with `make(..., 0, n)` server-side, so none are null.
export const kafkaTopologySchema = z.object({
  producers: z.array(producerNodeSchema),
  topics: z.array(topicNodeSchema),
  consumers: z.array(consumerNodeSchema),
  edges: z.array(streamEdgeSchema),
  pathways: z.array(pathwaySchema),
});

export const kafkaClientsSchema = z.array(stringValue);

export type TopicNode = z.infer<typeof topicNodeSchema>;
export type KafkaTopology = z.infer<typeof kafkaTopologySchema>;
