import { z } from "zod";

import { integerValue, numericValue, stringValue } from "./saturationClient";

export const topicThroughputSchema = z.object({
  topic: stringValue,
  bytesPerSec: numericValue,
  bytesTotal: numericValue,
  recordsPerSec: numericValue,
  recordsTotal: numericValue,
});

export const groupPartitionsSchema = z.object({
  consumerGroup: stringValue,
  assignedPartitions: numericValue,
  topicCount: integerValue,
  members: numericValue,
});

const kafkaSummarySchema = z.object({
  topicCount: integerValue,
  groupCount: integerValue,
  messagesPerSec: numericValue,
  assignedPartitions: numericValue,
});

export type TopicThroughputRow = z.infer<typeof topicThroughputSchema>;
export type GroupPartitionsRow = z.infer<typeof groupPartitionsSchema>;
export type KafkaSummary = z.infer<typeof kafkaSummarySchema>;
