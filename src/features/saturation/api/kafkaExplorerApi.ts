import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import {
  kafkaGroupOverviewSchema,
  kafkaGroupRowSchema,
  kafkaPartitionRowSchema,
  kafkaSummarySchema,
  kafkaTopicConsumerRowSchema,
  kafkaTopicOverviewSchema,
  kafkaTopicRowSchema,
} from "./kafkaExplorerSchemas";
import type {
  KafkaGroupOverview,
  KafkaGroupRow,
  KafkaPartitionRow,
  KafkaSummary,
  KafkaTopicConsumerRow,
  KafkaTopicOverview,
  KafkaTopicRow,
} from "./kafkaExplorerSchemas";
import { getSaturation, rangeParams } from "./saturationClient";

function topicParams(topic: string, startTime: RequestTime, endTime: RequestTime) {
  return { ...rangeParams(startTime, endTime), topic };
}

function groupParams(group: string, startTime: RequestTime, endTime: RequestTime) {
  return { ...rangeParams(startTime, endTime), group };
}

export function getKafkaSummary(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaSummary> {
  return getSaturation("/saturation/kafka/summary", kafkaSummarySchema, rangeParams(startTime, endTime));
}

export function getKafkaTopics(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaTopicRow[]> {
  return getSaturation("/saturation/kafka/topics", z.array(kafkaTopicRowSchema), rangeParams(startTime, endTime));
}

export function getKafkaGroups(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaGroupRow[]> {
  return getSaturation("/saturation/kafka/groups", z.array(kafkaGroupRowSchema), rangeParams(startTime, endTime));
}

export function getKafkaTopicOverview(
  topic: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaTopicOverview> {
  return getSaturation(
    "/saturation/kafka/topic/overview",
    kafkaTopicOverviewSchema,
    topicParams(topic, startTime, endTime)
  );
}

export function getKafkaTopicGroups(
  topic: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaTopicConsumerRow[]> {
  return getSaturation(
    "/saturation/kafka/topic/groups",
    z.array(kafkaTopicConsumerRowSchema),
    topicParams(topic, startTime, endTime)
  );
}

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

export function getKafkaGroupOverview(
  group: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaGroupOverview> {
  return getSaturation(
    "/saturation/kafka/group/overview",
    kafkaGroupOverviewSchema,
    groupParams(group, startTime, endTime)
  );
}

export function getKafkaGroupTopics(
  group: string,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<KafkaTopicRow[]> {
  return getSaturation(
    "/saturation/kafka/group/topics",
    z.array(kafkaTopicRowSchema),
    groupParams(group, startTime, endTime)
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
