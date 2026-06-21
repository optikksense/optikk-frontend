import { z } from "zod";

import { numericValue, stringValue } from "./saturationClient";

// Mirrors query/internal/modules/saturation/kafka/topology models.

export const producerNodeSchema = z
  .object({
    service: stringValue,
    rate_per_sec: numericValue,
    error_rate: numericValue,
    p95_ms: numericValue,
  })
  .strict();

export const topicNodeSchema = z
  .object({
    topic: stringValue,
    rate_per_sec: numericValue,
    producer_count: numericValue,
    consumer_group_count: numericValue,
  })
  .strict();

export const consumerNodeSchema = z
  .object({
    service: stringValue,
    group: stringValue,
    rate_per_sec: numericValue,
    error_rate: numericValue,
    p95_ms: numericValue,
  })
  .strict();

export const streamEdgeSchema = z
  .object({
    source: stringValue,
    target: stringValue,
    kind: z.enum(["produce", "consume"]),
    rate_per_sec: numericValue,
  })
  .strict();

export const pathwaySchema = z
  .object({
    producer: stringValue,
    topic: stringValue,
    group: stringValue,
    consumer: stringValue,
    produce_rate_per_sec: numericValue,
    consume_rate_per_sec: numericValue,
    error_rate: numericValue,
  })
  .strict();

export const kafkaTopologySchema = z
  .object({
    producers: z.array(producerNodeSchema).default([]),
    topics: z.array(topicNodeSchema).default([]),
    consumers: z.array(consumerNodeSchema).default([]),
    edges: z.array(streamEdgeSchema).default([]),
    pathways: z.array(pathwaySchema).default([]),
  })
  .strict();

export type ProducerNode = z.infer<typeof producerNodeSchema>;
export type TopicNode = z.infer<typeof topicNodeSchema>;
export type ConsumerNode = z.infer<typeof consumerNodeSchema>;
export type StreamEdge = z.infer<typeof streamEdgeSchema>;
export type Pathway = z.infer<typeof pathwaySchema>;
export type KafkaTopology = z.infer<typeof kafkaTopologySchema>;
