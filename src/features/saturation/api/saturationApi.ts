/**
 * Saturation API barrel.
 *
 * Preserves the legacy `saturationApi.<method>(teamId, ...args)` call surface
 * while delegating to the per-BE-module split files. The leading `teamId`
 * argument is now unused — auth flows through the api client interceptor —
 * but keeping it lets us avoid touching every call site in this PR.
 */
import type { RequestTime } from "@/shared/api/service-types";

import {
  getDatastoreConnections,
  getDatastoreErrors,
  getDatastoreNamespaces,
  getDatastoreOperations,
  getDatastoreOverview,
  getDatastoreServers,
  getDatastoreSlowQueries,
  getDatastoreSummary,
  getDatastoreSystems,
} from "./datastoresExplorerApi";
import {
  getKafkaGroupOverview,
  getKafkaGroupPartitions,
  getKafkaGroupTopics,
  getKafkaGroups,
  getKafkaSummary,
  getKafkaTopicGroups,
  getKafkaTopicOverview,
  getKafkaTopicPartitions,
  getKafkaTopics,
} from "./kafkaExplorerApi";

export type {
  DatastoreCollectionSpotlight,
  DatastoreConnectionRow,
  DatastoreErrorRow,
  DatastoreNamespaceRow,
  DatastoreOperationRow,
  DatastoreOverview,
  DatastoreServerRow,
  DatastoreSummary,
  DatastoreSystemRow,
  SlowQueryPattern,
} from "./datastoresExplorerSchemas";
export type {
  KafkaGroupOverview,
  KafkaGroupRow,
  KafkaPartitionRow,
  KafkaSummary,
  KafkaTopicConsumerRow,
  KafkaTopicOverview,
  KafkaTopicRow,
} from "./kafkaExplorerSchemas";

type R = RequestTime;
type T = number | null;

export const saturationApi = {
  getDatastoreSummary: (_t: T, s: R, e: R) => getDatastoreSummary(s, e),
  getDatastoreSystems: (_t: T, s: R, e: R) => getDatastoreSystems(s, e),
  getDatastoreOverview: (system: string, _t: T, s: R, e: R) => getDatastoreOverview(system, s, e),
  getDatastoreServers: (system: string, _t: T, s: R, e: R) => getDatastoreServers(system, s, e),
  getDatastoreNamespaces: (system: string, _t: T, s: R, e: R) => getDatastoreNamespaces(system, s, e),
  getDatastoreOperations: (system: string, _t: T, s: R, e: R) => getDatastoreOperations(system, s, e),
  getDatastoreErrors: (system: string, _t: T, s: R, e: R) => getDatastoreErrors(system, s, e),
  getDatastoreConnections: (system: string, _t: T, s: R, e: R) => getDatastoreConnections(system, s, e),
  getDatastoreSlowQueries: (system: string, _t: T, s: R, e: R) => getDatastoreSlowQueries(system, s, e),

  getKafkaSummary: (_t: T, s: R, e: R) => getKafkaSummary(s, e),
  getKafkaTopics: (_t: T, s: R, e: R) => getKafkaTopics(s, e),
  getKafkaGroups: (_t: T, s: R, e: R) => getKafkaGroups(s, e),
  getKafkaTopicOverview: (topic: string, _t: T, s: R, e: R) => getKafkaTopicOverview(topic, s, e),
  getKafkaTopicGroups: (topic: string, _t: T, s: R, e: R) => getKafkaTopicGroups(topic, s, e),
  getKafkaTopicPartitions: (topic: string, _t: T, s: R, e: R) => getKafkaTopicPartitions(topic, s, e),
  getKafkaGroupOverview: (group: string, _t: T, s: R, e: R) => getKafkaGroupOverview(group, s, e),
  getKafkaGroupTopics: (group: string, _t: T, s: R, e: R) => getKafkaGroupTopics(group, s, e),
  getKafkaGroupPartitions: (group: string, _t: T, s: R, e: R) => getKafkaGroupPartitions(group, s, e),
};
