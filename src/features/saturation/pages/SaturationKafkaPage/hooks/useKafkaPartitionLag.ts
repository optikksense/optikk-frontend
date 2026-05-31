import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getLagPerPartition } from "@/features/saturation/api/kafkaPanelsApi";
import type { PartitionLag } from "@/features/saturation/api/kafkaPanelsSchemas";

export function useKafkaPartitionLag() {
  return useTimeRangeQuery<PartitionLag[]>("saturation-kafka.lag-per-partition", (_team, s, e) =>
    getLagPerPartition(s, e)
  );
}
