import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import {
  groupPartitionsSchema,
  topicThroughputSchema,
} from "./kafkaExplorerSchemas";
import type {
  GroupPartitionsRow,
  KafkaSummary,
  TopicThroughputRow,
} from "./kafkaExplorerSchemas";
import { getSaturation, rangeParams } from "./saturationClient";

function topicParams(topic: string, startTime: RequestTime, endTime: RequestTime) {
  return { ...rangeParams(startTime, endTime), topic };
}

function groupParams(group: string, startTime: RequestTime, endTime: RequestTime) {
  return { ...rangeParams(startTime, endTime), group };
}

export async function getKafkaSummary(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaSummary> {
  const [throughput, partitions] = await Promise.all([
    getTopicThroughput(startTime, endTime),
    getGroupPartitions(startTime, endTime),
  ]);

  const topic_count = throughput.length;
  const group_count = partitions.length;

  let messages_per_sec = 0;
  for (const t of throughput) {
    messages_per_sec += t.records_per_sec ?? 0;
  }

  let assigned_partitions = 0;
  for (const g of partitions) {
    assigned_partitions += g.assigned_partitions ?? 0;
  }

  return {
    topic_count,
    group_count,
    messages_per_sec,
    assigned_partitions,
  };
}

function getTopicThroughput(
  startTime: RequestTime,
  endTime: RequestTime,
  topic?: string
): Promise<TopicThroughputRow[]> {
  return getSaturation(
    "/saturation/kafka/topics/throughput",
    z.array(topicThroughputSchema),
    topic ? topicParams(topic, startTime, endTime) : rangeParams(startTime, endTime)
  );
}

function getGroupPartitions(
  startTime: RequestTime,
  endTime: RequestTime,
  group?: string
): Promise<GroupPartitionsRow[]> {
  return getSaturation(
    "/saturation/kafka/groups/partitions",
    z.array(groupPartitionsSchema),
    group ? groupParams(group, startTime, endTime) : rangeParams(startTime, endTime)
  );
}
