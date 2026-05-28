import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getKafkaGroups } from "@/features/saturation/api/kafkaExplorerApi";
import type { KafkaGroupRow } from "@/features/saturation/api/kafkaExplorerSchemas";

export function useKafkaConsumerGroupsTable() {
  return useTimeRangeQuery<KafkaGroupRow[]>("saturation-kafka.groups-table", (_team, s, e) =>
    getKafkaGroups(s, e)
  );
}
