import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getProcessRateByGroup } from "@/features/saturation/api/kafkaPanelsApi";
import type { GroupRatePoint } from "@/features/saturation/api/kafkaPanelsSchemas";
import { sumByTimestamp } from "@/features/saturation/series/aggregateByTimestamp";

export function useKafkaProcessRateSeries() {
  const query = useTimeRangeQuery<GroupRatePoint[]>(
    "saturation-kafka.process-rate-by-group",
    (_team, s, e) => getProcessRateByGroup(s, e)
  );
  const series = useMemo(
    () => sumByTimestamp(query.data ?? [], (r) => r.timestamp, (r) => r.rate_per_sec),
    [query.data]
  );
  return { series, isPending: query.isPending, isError: Boolean(query.error) };
}
