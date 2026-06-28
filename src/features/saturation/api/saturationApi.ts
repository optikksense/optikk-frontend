/**
 * Saturation API barrel.
 *
 * Preserves the legacy `saturationApi.<method>(teamId, ...args)` call surface
 * while delegating to the per-BE-module split files. The leading `teamId`
 * argument is now unused — auth flows through the api client interceptor —
 * but keeping it lets us avoid touching every call site in this PR.
 */
import type { RequestTime } from "@/shared/api/service-types";

import { getHosts } from "@/features/infrastructure/api/hostsApi";

import { getDatastoreSummary, getDatastoreSystems } from "./datastoresExplorerApi";
import { getKafkaGroups, getKafkaSummary, getKafkaTopics } from "./kafkaExplorerApi";

export type {
  DatastoreSummary,
  DatastoreSystemRow,
} from "./datastoresExplorerSchemas";
export type { Host as HostSaturationRow } from "@/features/infrastructure/api/hostsApi";
export type {
  KafkaGroupRow,
  KafkaSummary,
  KafkaTopicRow,
} from "./kafkaExplorerSchemas";

type R = RequestTime;
type T = number | null;

export const saturationApi = {
  getHostSaturation: (_t: T, s: R, e: R) => getHosts(s, e),

  getDatastoreSummary: (_t: T, s: R, e: R) => getDatastoreSummary(s, e),
  getDatastoreSystems: (_t: T, s: R, e: R) => getDatastoreSystems(s, e),

  getKafkaSummary: (_t: T, s: R, e: R) => getKafkaSummary(s, e),
  getKafkaTopics: (_t: T, s: R, e: R) => getKafkaTopics(s, e),
  getKafkaGroups: (_t: T, s: R, e: R) => getKafkaGroups(s, e),
};
