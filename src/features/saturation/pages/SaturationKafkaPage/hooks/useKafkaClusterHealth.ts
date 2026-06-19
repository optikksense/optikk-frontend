import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getKafkaClusterHealth } from "@/features/saturation/api/kafkaExplorerApi";
import type { ClusterHealthRow } from "@/features/saturation/api/kafkaExplorerSchemas";

export function useKafkaClusterHealth() {
  return useTimeRangeQuery<ClusterHealthRow>("saturation-kafka.cluster-health", (_team, s, e) =>
    getKafkaClusterHealth(s, e)
  );
}
