import { z } from "zod";

import { numericValue, stringValue } from "./saturationClient";

// Mirrors query/internal/modules/saturation/kafka/topology models.

const producerNodeSchema = z.object({
  service: stringValue,
  ratePerSec: numericValue,
  errorRate: numericValue,
  p50Ms: numericValue,
  p95Ms: numericValue,
  p99Ms: numericValue,
});

const topicNodeSchema = z.object({
  topic: stringValue,
  ratePerSec: numericValue,
  producerCount: numericValue,
  consumerGroupCount: numericValue,
});

const consumerNodeSchema = z.object({
  service: stringValue,
  group: stringValue,
  ratePerSec: numericValue,
  errorRate: numericValue,
  p50Ms: numericValue,
  p95Ms: numericValue,
  p99Ms: numericValue,
});

const streamEdgeSchema = z.object({
  source: stringValue,
  target: stringValue,
  kind: z.enum(["produce", "consume"]),
  ratePerSec: numericValue,
});

const pathwaySchema = z.object({
  producer: stringValue,
  topic: stringValue,
  group: stringValue,
  consumer: stringValue,
  produceRatePerSec: numericValue,
  consumeRatePerSec: numericValue,
  errorRate: numericValue,
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

export type KafkaTopology = z.infer<typeof kafkaTopologySchema>;
