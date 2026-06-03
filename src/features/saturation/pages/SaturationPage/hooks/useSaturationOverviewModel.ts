import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type {
  DatastoreSummary,
  DatastoreSystemRow,
  HostSaturationRow,
  KafkaSummary,
} from "../../../api/saturationApi";
import { saturationApi } from "../../../api/saturationApi";

import {
  type SubsystemCardSpec,
  buildDatabaseCardSpec,
  buildKafkaCardSpec,
  buildOverviewSummary,
} from "../view-models/subsystemSpecs";

const HOSTS_LIMIT = 10;

export type SaturationOverviewModel = {
  isPending: boolean;
  error: Error | null;
  cards: SubsystemCardSpec[];
  hosts: HostSaturationRow[];
  topHosts: HostSaturationRow[];
  summary: ReturnType<typeof buildOverviewSummary>;
  counts: { database: number; topics: number };
};

function firstError(...errors: Array<Error | null>): Error | null {
  return errors.find((e): e is Error => e instanceof Error) ?? null;
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
  const hostSaturation = useTimeRangeQuery<HostSaturationRow[]>(
    "saturation-overview-hosts",
    (teamId, s, e) => saturationApi.getHostSaturation(teamId, s, e)
  );

  const systems = datastoreSystems.data ?? [];
  const hosts = hostSaturation.data ?? [];

  const cards = useMemo(
    () => [buildKafkaCardSpec(kafkaSummary.data), buildDatabaseCardSpec(systems)],
    [kafkaSummary.data, systems]
  );
  const topHosts = useMemo(() => hosts.slice(0, HOSTS_LIMIT), [hosts]);
  const summary = useMemo(
    () => buildOverviewSummary(datastoreSummary.data, kafkaSummary.data),
    [datastoreSummary.data, kafkaSummary.data]
  );
  const counts = useMemo(
    () => ({
      database: systems.filter((row) => row.category === "database").length,
      topics: kafkaSummary.data?.topic_count ?? 0,
    }),
    [systems, kafkaSummary.data]
  );

  const isPending =
    datastoreSummary.isPending ||
    datastoreSystems.isPending ||
    kafkaSummary.isPending ||
    hostSaturation.isPending;

  return {
    isPending,
    error: firstError(
      datastoreSummary.error,
      datastoreSystems.error,
      kafkaSummary.error,
      hostSaturation.error
    ),
    cards,
    hosts,
    topHosts,
    summary,
    counts,
  };
}
