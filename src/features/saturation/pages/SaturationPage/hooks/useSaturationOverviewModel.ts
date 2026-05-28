import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type {
  DatastoreSummary,
  DatastoreSystemRow,
  KafkaSummary,
  KafkaTopicRow,
} from "../../../api/saturationApi";
import { saturationApi } from "../../../api/saturationApi";

import { type Tone, computeSystemSaturation, toneFromScore } from "../view-models/saturationScore";
import {
  type SubsystemCardSpec,
  buildDatabaseCardSpec,
  buildKafkaCardSpec,
  buildOverviewSummary,
  buildRedisCardSpec,
} from "../view-models/subsystemSpecs";

const WORST_LIMIT = 10;
const TOPIC_LIMIT = 8;

export type WorstSystemRow = DatastoreSystemRow & {
  saturation: number;
  tone: Tone;
};

export type SaturationOverviewModel = {
  isPending: boolean;
  error: Error | null;
  cards: SubsystemCardSpec[];
  worstSystems: WorstSystemRow[];
  topTopics: KafkaTopicRow[];
  summary: ReturnType<typeof buildOverviewSummary>;
  counts: { database: number; redis: number; topics: number };
};

function firstError(...errors: Array<Error | null>): Error | null {
  return errors.find((e): e is Error => e instanceof Error) ?? null;
}

function rankSystems(rows: DatastoreSystemRow[]): WorstSystemRow[] {
  return rows
    .map((row) => {
      const saturation = computeSystemSaturation(row);
      return { ...row, saturation, tone: toneFromScore(saturation) };
    })
    .sort((a, b) => b.saturation - a.saturation)
    .slice(0, WORST_LIMIT);
}

function rankTopics(topics: KafkaTopicRow[]): KafkaTopicRow[] {
  return [...topics]
    .sort((a, b) => (b.bytes_per_sec ?? 0) - (a.bytes_per_sec ?? 0))
    .slice(0, TOPIC_LIMIT);
}

function buildCards(
  kafka: KafkaSummary | undefined,
  systems: DatastoreSystemRow[]
): SubsystemCardSpec[] {
  return [buildKafkaCardSpec(kafka), buildDatabaseCardSpec(systems), buildRedisCardSpec(systems)];
}

export function useSaturationOverviewModel(): SaturationOverviewModel {
  const datastoreSummary = useTimeRangeQuery<DatastoreSummary>(
    "saturation-overview-datastores-summary",
    (teamId, s, e) => saturationApi.getDatastoreSummary(teamId, s, e)
  );
  const datastoreSystems = useTimeRangeQuery<DatastoreSystemRow[]>(
    "saturation-overview-datastores-systems",
    (teamId, s, e) => saturationApi.getDatastoreSystems(teamId, s, e)
  );
  const kafkaSummary = useTimeRangeQuery<KafkaSummary>(
    "saturation-overview-kafka-summary",
    (teamId, s, e) => saturationApi.getKafkaSummary(teamId, s, e)
  );
  const kafkaTopics = useTimeRangeQuery<KafkaTopicRow[]>(
    "saturation-overview-kafka-topics",
    (teamId, s, e) => saturationApi.getKafkaTopics(teamId, s, e)
  );

  const systems = datastoreSystems.data ?? [];
  const topics = kafkaTopics.data ?? [];

  const cards = useMemo(() => buildCards(kafkaSummary.data, systems), [kafkaSummary.data, systems]);
  const worstSystems = useMemo(() => rankSystems(systems), [systems]);
  const topTopics = useMemo(() => rankTopics(topics), [topics]);
  const summary = useMemo(
    () => buildOverviewSummary(datastoreSummary.data, kafkaSummary.data),
    [datastoreSummary.data, kafkaSummary.data]
  );
  const counts = useMemo(
    () => ({
      database: systems.filter((row) => row.category === "database").length,
      redis: systems.filter((row) => row.category === "redis").length,
      topics: topics.length,
    }),
    [systems, topics]
  );

  const isPending =
    datastoreSummary.isPending ||
    datastoreSystems.isPending ||
    kafkaSummary.isPending ||
    kafkaTopics.isPending;

  return {
    isPending,
    error: firstError(
      datastoreSummary.error,
      datastoreSystems.error,
      kafkaSummary.error,
      kafkaTopics.error
    ),
    cards,
    worstSystems,
    topTopics,
    summary,
    counts,
  };
}
