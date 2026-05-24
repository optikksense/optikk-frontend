import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import {
  groupCommitsSchema,
  groupFetchesSchema,
  groupHealthSchema,
  groupPartitionsSchema,
  groupTopicSchema,
  kafkaPartitionRowSchema,
  topicConsumersSchema,
  topicGroupLagSchema,
  topicGroupThroughputSchema,
  topicLagSchema,
  topicThroughputSchema,
} from "./kafkaExplorerSchemas";
import type {
  GroupCommitsRow,
  GroupFetchesRow,
  GroupHealthRow,
  GroupPartitionsRow,
  GroupTopicRow,
  KafkaPartitionRow,
  KafkaSummary,
  KafkaTopicRow,
  KafkaGroupRow,
  KafkaTopicOverview,
  KafkaGroupOverview,
  TopicConsumersRow,
  TopicGroupLagRow,
  TopicGroupThroughputRow,
  TopicLagRow,
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

  let bytes_per_sec = 0;
  for (const t of throughput) {
    bytes_per_sec += t.bytes_per_sec ?? 0;
  }

  let assigned_partitions = 0;
  for (const g of partitions) {
    assigned_partitions += g.assigned_partitions ?? 0;
  }

  return {
    topic_count,
    group_count,
    bytes_per_sec,
    assigned_partitions,
  };
}

// ----------------- TOPIC DOMAINS -----------------

export function getTopicThroughput(
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

export function getTopicLag(
  startTime: RequestTime,
  endTime: RequestTime,
  topic?: string
): Promise<TopicLagRow[]> {
  return getSaturation(
    "/saturation/kafka/topics/lag",
    z.array(topicLagSchema),
    topic ? topicParams(topic, startTime, endTime) : rangeParams(startTime, endTime)
  );
}

export function getTopicConsumers(
  startTime: RequestTime,
  endTime: RequestTime,
  topic?: string
): Promise<TopicConsumersRow[]> {
  return getSaturation(
    "/saturation/kafka/topics/consumers",
    z.array(topicConsumersSchema),
    topic ? topicParams(topic, startTime, endTime) : rangeParams(startTime, endTime)
  );
}

// ----------------- GROUP DOMAINS -----------------

export function getGroupPartitions(
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

export function getGroupCommits(
  startTime: RequestTime,
  endTime: RequestTime,
  group?: string
): Promise<GroupCommitsRow[]> {
  return getSaturation(
    "/saturation/kafka/groups/commits",
    z.array(groupCommitsSchema),
    group ? groupParams(group, startTime, endTime) : rangeParams(startTime, endTime)
  );
}

export function getGroupFetches(
  startTime: RequestTime,
  endTime: RequestTime,
  group?: string
): Promise<GroupFetchesRow[]> {
  return getSaturation(
    "/saturation/kafka/groups/fetches",
    z.array(groupFetchesSchema),
    group ? groupParams(group, startTime, endTime) : rangeParams(startTime, endTime)
  );
}

export function getGroupHealth(
  startTime: RequestTime,
  endTime: RequestTime,
  group?: string
): Promise<GroupHealthRow[]> {
  return getSaturation(
    "/saturation/kafka/groups/health",
    z.array(groupHealthSchema),
    group ? groupParams(group, startTime, endTime) : rangeParams(startTime, endTime)
  );
}

// ----------------- DETAIL INTERSECTIONS -----------------

export function getTopicGroupThroughput(
  topic: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<TopicGroupThroughputRow[]> {
  return getSaturation(
    "/saturation/kafka/topic/groups/throughput",
    z.array(topicGroupThroughputSchema),
    topicParams(topic, startTime, endTime)
  );
}

export function getTopicGroupLag(
  topic: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<TopicGroupLagRow[]> {
  return getSaturation(
    "/saturation/kafka/topic/groups/lag",
    z.array(topicGroupLagSchema),
    topicParams(topic, startTime, endTime)
  );
}

export async function getKafkaTopics(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaTopicRow[]> {
  const [throughput, lag, consumers] = await Promise.all([
    getTopicThroughput(startTime, endTime),
    getTopicLag(startTime, endTime),
    getTopicConsumers(startTime, endTime),
  ]);

  const map = new Map<string, Partial<KafkaTopicRow>>();

  for (const t of throughput) {
    map.set(t.topic, { ...map.get(t.topic), ...t });
  }
  for (const l of lag) {
    map.set(l.topic, { ...map.get(l.topic), ...l });
  }
  for (const c of consumers) {
    map.set(c.topic, { ...map.get(c.topic), ...c });
  }

  return Array.from(map.values()) as KafkaTopicRow[];
}

export async function getKafkaGroups(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaGroupRow[]> {
  const [partitions, commits, fetches, health] = await Promise.all([
    getGroupPartitions(startTime, endTime),
    getGroupCommits(startTime, endTime),
    getGroupFetches(startTime, endTime),
    getGroupHealth(startTime, endTime),
  ]);

  const map = new Map<string, Partial<KafkaGroupRow>>();

  for (const p of partitions) {
    map.set(p.consumer_group, { ...map.get(p.consumer_group), ...p });
  }
  for (const c of commits) {
    map.set(c.consumer_group, { ...map.get(c.consumer_group), ...c });
  }
  for (const f of fetches) {
    map.set(f.consumer_group, { ...map.get(f.consumer_group), ...f });
  }
  for (const h of health) {
    map.set(h.consumer_group, { ...map.get(h.consumer_group), ...h });
  }

  return Array.from(map.values()).map((row) => ({
    ...row,
    topic_count: 0, // Fallback since it's not trivially available in the split domains
  })) as KafkaGroupRow[];
}

export async function getKafkaTopicOverview(
  topic: string,
  startTime: RequestTime,
  endTime: RequestTime
) {
  const [throughput, lag, consumers] = await Promise.all([
    getTopicThroughput(startTime, endTime, topic),
    getTopicLag(startTime, endTime, topic),
    getTopicConsumers(startTime, endTime, topic),
  ]);

  const summary = {
    ...throughput[0],
    ...lag[0],
    ...consumers[0],
    topic,
  } as KafkaTopicRow;

  return { topic, summary, trend: [] };
}

export async function getKafkaGroupOverview(
  group: string,
  startTime: RequestTime,
  endTime: RequestTime
) {
  const [partitions, commits, fetches, health] = await Promise.all([
    getGroupPartitions(startTime, endTime, group),
    getGroupCommits(startTime, endTime, group),
    getGroupFetches(startTime, endTime, group),
    getGroupHealth(startTime, endTime, group),
  ]);

  const summary = {
    ...partitions[0],
    ...commits[0],
    ...fetches[0],
    ...health[0],
    consumer_group: group,
    topic_count: 0,
  } as KafkaGroupRow;

  return { consumer_group: group, summary, trend: [] };
}

export async function getKafkaTopicGroups(
  topic: string,
  startTime: RequestTime,
  endTime: RequestTime
) {
  const [throughput, lag] = await Promise.all([
    getTopicGroupThroughput(topic, startTime, endTime),
    getTopicGroupLag(topic, startTime, endTime),
  ]);

  const map = new Map<string, any>();

  for (const t of throughput) {
    map.set(t.consumer_group, { ...map.get(t.consumer_group), ...t });
  }
  for (const l of lag) {
    map.set(l.consumer_group, { ...map.get(l.consumer_group), ...l });
  }

  return Array.from(map.values());
}

export function getKafkaGroupTopics(
  group: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<GroupTopicRow[]> {
  return getSaturation(
    "/saturation/kafka/group/topics",
    z.array(groupTopicSchema),
    groupParams(group, startTime, endTime)
  );
}

// Keep partition legacy endpoint since we didn't rewrite it in the backend yet
export function getKafkaTopicPartitions(

  topic: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaPartitionRow[]> {
  return getSaturation(
    "/saturation/kafka/topic/partitions",
    z.array(kafkaPartitionRowSchema),
    topicParams(topic, startTime, endTime)
  );
}

export function getKafkaGroupPartitions(
  group: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaPartitionRow[]> {
  return getSaturation(
    "/saturation/kafka/group/partitions",
    z.array(kafkaPartitionRowSchema),
    groupParams(group, startTime, endTime)
  );
}
