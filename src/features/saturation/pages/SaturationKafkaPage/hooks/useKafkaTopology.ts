import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getKafkaTopology } from "@/features/saturation/api/kafkaTopologyApi";
import type { KafkaTopology } from "@/features/saturation/api/kafkaTopologySchemas";

export function useKafkaTopology() {
  return useTimeRangeQuery<KafkaTopology>("saturation-kafka.topology", (_tenant, s, e) =>
    getKafkaTopology(s, e)
  );
}
