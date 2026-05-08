import { z } from "zod";

import type { RequestTime } from "@/shared/api/service-types";

import {
  brokerConnectionPointSchema,
  clientOpDurationPointSchema,
  e2eLatencyPointSchema,
  errorRatePointSchema,
  groupLatencyPointSchema,
  groupRatePointSchema,
  kafkaSummaryStatsSchema,
  lagPointSchema,
  partitionLagSchema,
  rebalancePointSchema,
  topicLatencyPointSchema,
  topicRatePointSchema,
} from "./kafkaPanelsSchemas";
import type {
  BrokerConnectionPoint,
  ClientOpDurationPoint,
  E2ELatencyPoint,
  ErrorRatePoint,
  GroupLatencyPoint,
  GroupRatePoint,
  KafkaSummaryStats,
  LagPoint,
  PartitionLag,
  RebalancePoint,
  TopicLatencyPoint,
  TopicRatePoint,
} from "./kafkaPanelsSchemas";
import { getSaturation, rangeParams } from "./saturationClient";

type KafkaFilter = {
  readonly topic?: string;
  readonly consumer_group?: string;
};

function withFilter(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return { ...rangeParams(s, e), ...f };
}

export function getKafkaSummaryStats(s: RequestTime, e: RequestTime): Promise<KafkaSummaryStats> {
  return getSaturation("/saturation/kafka/summary-stats", kafkaSummaryStatsSchema, rangeParams(s, e));
}

export function getProduceRateByTopic(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<TopicRatePoint[]>(
    "/saturation/kafka/produce-rate-by-topic",
    z.array(topicRatePointSchema),
    withFilter(s, e, f)
  );
}

export function getPublishLatencyByTopic(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<TopicLatencyPoint[]>(
    "/saturation/kafka/publish-latency-by-topic",
    z.array(topicLatencyPointSchema),
    withFilter(s, e, f)
  );
}

export function getConsumeRateByTopic(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<TopicRatePoint[]>(
    "/saturation/kafka/consume-rate-by-topic",
    z.array(topicRatePointSchema),
    withFilter(s, e, f)
  );
}

export function getReceiveLatencyByTopic(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<TopicLatencyPoint[]>(
    "/saturation/kafka/receive-latency-by-topic",
    z.array(topicLatencyPointSchema),
    withFilter(s, e, f)
  );
}

export function getConsumeRateByGroup(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<GroupRatePoint[]>(
    "/saturation/kafka/consume-rate-by-group",
    z.array(groupRatePointSchema),
    withFilter(s, e, f)
  );
}

export function getProcessRateByGroup(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<GroupRatePoint[]>(
    "/saturation/kafka/process-rate-by-group",
    z.array(groupRatePointSchema),
    withFilter(s, e, f)
  );
}

export function getProcessLatencyByGroup(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<GroupLatencyPoint[]>(
    "/saturation/kafka/process-latency-by-group",
    z.array(groupLatencyPointSchema),
    withFilter(s, e, f)
  );
}

export function getConsumerLagByGroup(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<LagPoint[]>(
    "/saturation/kafka/consumer-lag-by-group",
    z.array(lagPointSchema),
    withFilter(s, e, f)
  );
}

export function getLagPerPartition(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<PartitionLag[]>(
    "/saturation/kafka/lag-per-partition",
    z.array(partitionLagSchema),
    withFilter(s, e, f)
  );
}

export function getRebalanceSignals(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<RebalancePoint[]>(
    "/saturation/kafka/rebalance-signals",
    z.array(rebalancePointSchema),
    withFilter(s, e, f)
  );
}

export function getKafkaE2ELatency(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<E2ELatencyPoint[]>(
    "/saturation/kafka/e2e-latency",
    z.array(e2eLatencyPointSchema),
    withFilter(s, e, f)
  );
}

export function getPublishErrors(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<ErrorRatePoint[]>(
    "/saturation/kafka/publish-errors",
    z.array(errorRatePointSchema),
    withFilter(s, e, f)
  );
}

export function getConsumeErrors(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<ErrorRatePoint[]>(
    "/saturation/kafka/consume-errors",
    z.array(errorRatePointSchema),
    withFilter(s, e, f)
  );
}

export function getProcessErrors(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<ErrorRatePoint[]>(
    "/saturation/kafka/process-errors",
    z.array(errorRatePointSchema),
    withFilter(s, e, f)
  );
}

export function getClientOpErrors(s: RequestTime, e: RequestTime, f?: KafkaFilter) {
  return getSaturation<ErrorRatePoint[]>(
    "/saturation/kafka/client-op-errors",
    z.array(errorRatePointSchema),
    withFilter(s, e, f)
  );
}

export function getBrokerConnections(s: RequestTime, e: RequestTime) {
  return getSaturation<BrokerConnectionPoint[]>(
    "/saturation/kafka/broker-connections",
    z.array(brokerConnectionPointSchema),
    rangeParams(s, e)
  );
}

export function getClientOperationDuration(s: RequestTime, e: RequestTime) {
  return getSaturation<ClientOpDurationPoint[]>(
    "/saturation/kafka/client-op-duration",
    z.array(clientOpDurationPointSchema),
    rangeParams(s, e)
  );
}
