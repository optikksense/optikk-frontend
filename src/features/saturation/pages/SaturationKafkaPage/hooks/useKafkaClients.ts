import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getKafkaClients } from "@/features/saturation/api/kafkaTopologyApi";

                                                                           
export function useKafkaClients() {
  return useTimeRangeQuery<string[]>("saturation-kafka.clients", (_tenant, s, e) =>
    getKafkaClients(s, e)
  );
}
