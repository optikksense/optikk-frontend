import { useCallback, useMemo } from "react";

import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { saturationApi } from "../../../api/saturationApi";

import { KAFKA_GROUPS, KAFKA_TOPICS, SECTION_DATASTORES, SECTION_KAFKA } from "../constants";

export function useSaturationExplorerModel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const legacyTab = searchParams.get("tab");
  const activeSection =
    searchParams.get("section") === SECTION_KAFKA || legacyTab === "queue"
      ? SECTION_KAFKA
      : SECTION_DATASTORES;
  const kafkaView = searchParams.get("kafkaView") === KAFKA_GROUPS ? KAFKA_GROUPS : KAFKA_TOPICS;
  const storeType = searchParams.get("storeType") ?? "all";
  const queryText = searchParams.get("q") ?? "";

  const setSearchValue = useCallback(
    (key: string, value: string | null): void => {
      const next = new URLSearchParams(searchParams);
      if (value?.trim()) next.set(key, value);
      else next.delete(key);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const datastoreSummaryQuery = useTimeRangeQuery(
    "saturation-datastores-summary",
    (teamId, startTime, endTime) => saturationApi.getDatastoreSummary(teamId, startTime, endTime)
  );
  const datastoreSystemsQuery = useTimeRangeQuery(
    "saturation-datastores-systems",
    (teamId, startTime, endTime) => saturationApi.getDatastoreSystems(teamId, startTime, endTime)
  );
  const kafkaSummaryQuery = useTimeRangeQuery(
    "saturation-kafka-summary",
    (teamId, startTime, endTime) => saturationApi.getKafkaSummary(teamId, startTime, endTime)
  );
  const kafkaTopicsQuery = useTimeRangeQuery(
    "saturation-kafka-topics",
    (teamId, startTime, endTime) => saturationApi.getKafkaTopics(teamId, startTime, endTime)
  );
  const kafkaGroupsQuery = useTimeRangeQuery(
    "saturation-kafka-groups",
    (teamId, startTime, endTime) => saturationApi.getKafkaGroups(teamId, startTime, endTime)
  );

  const datastoreRows = useMemo(() => {
    const needle = queryText.trim().toLowerCase();
    return (datastoreSystemsQuery.data ?? []).filter((row) => {
      if (storeType !== "all" && row.category !== storeType) return false;
      if (!needle) return true;
      return (
        row.system.toLowerCase().includes(needle) ||
        row.server_hint.toLowerCase().includes(needle) ||
        row.category.toLowerCase().includes(needle)
      );
    });
  }, [datastoreSystemsQuery.data, queryText, storeType]);

  const kafkaTopicRows = useMemo(() => {
    const needle = queryText.trim().toLowerCase();
    return (kafkaTopicsQuery.data ?? []).filter(
      (row) => !needle || row.topic.toLowerCase().includes(needle)
    );
  }, [kafkaTopicsQuery.data, queryText]);

  const kafkaGroupRows = useMemo(() => {
    const needle = queryText.trim().toLowerCase();
    return (kafkaGroupsQuery.data ?? []).filter(
      (row) => !needle || row.consumer_group.toLowerCase().includes(needle)
    );
  }, [kafkaGroupsQuery.data, queryText]);

  return {
    searchParams,
    activeSection,
    kafkaView,
    storeType,
    queryText,
    setSearchValue,
    datastoreSummaryQuery,
    datastoreSystemsQuery,
    kafkaSummaryQuery,
    kafkaTopicsQuery,
    kafkaGroupsQuery,
    datastoreRows,
    kafkaTopicRows,
    kafkaGroupRows,
  };
}
