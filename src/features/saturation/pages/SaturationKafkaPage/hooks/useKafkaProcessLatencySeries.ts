import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getProcessLatencyByGroup } from "@/features/saturation/api/kafkaPanelsApi";
import type { GroupLatencyPoint } from "@/features/saturation/api/kafkaPanelsSchemas";
import { maxLatencyByTimestamp } from "@/features/saturation/series/aggregateLatencyByTimestamp";

export function useKafkaProcessLatencySeries() {
  const query = useTimeRangeQuery<GroupLatencyPoint[]>(
    "saturation-kafka.process-latency-by-group",
    (_team, s, e) => getProcessLatencyByGroup(s, e)
  );
  const series = useMemo(
    () =>
      maxLatencyByTimestamp(
        query.data ?? [],
        (r) => r.timestamp,
        (r) => ({ p50: r.p50_ms, p95: r.p95_ms, p99: r.p99_ms })
      ),
    [query.data]
  );
  return { series, isPending: query.isPending, isError: Boolean(query.error) };
}
