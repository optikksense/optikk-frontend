import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getKafkaTopology } from "@/features/saturation/api/kafkaTopologyApi";
import type { KafkaTopology } from "@/features/saturation/api/kafkaTopologySchemas";

/** Topology for the selected services; the server scopes the query to them. */
export function useKafkaTopology(services: string[]) {
  const key = services.join(",");
  return useTimeRangeQuery<KafkaTopology>(
    "saturation-kafka.topology",
    (_tenant, s, e) => getKafkaTopology(s, e, services),
    { extraKeys: [key], enabled: services.length > 0 }
  );
}
