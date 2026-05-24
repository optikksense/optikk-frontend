import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getKafkaTopics } from "@/features/saturation/api/kafkaExplorerApi";
import type { KafkaTopicRow } from "@/features/saturation/api/kafkaExplorerSchemas";

export function useKafkaTopicsTable() {
  return useTimeRangeQuery<KafkaTopicRow[]>("saturation-kafka.topics-table", (_team, s, e) =>
    getKafkaTopics(s, e)
  );
}
