import { z } from "zod";

import { integerValue, numericValue, stringValue } from "./saturationClient";

export const topicThroughputSchema = z
  .object({
    topic: stringValue,
    bytes_per_sec: numericValue,
    bytes_total: numericValue,
    records_per_sec: numericValue,
    records_total: numericValue,
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

export const kafkaSummarySchema = z
  .object({
    topic_count: integerValue,
    group_count: integerValue,
    messages_per_sec: numericValue,
    assigned_partitions: numericValue,
  })
  .strict();

export type TopicThroughputRow = z.infer<typeof topicThroughputSchema>;
export type GroupPartitionsRow = z.infer<typeof groupPartitionsSchema>;
export type KafkaSummary = z.infer<typeof kafkaSummarySchema>;
