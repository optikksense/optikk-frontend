import { useMemo } from "react";

import type { RequestTime } from "@/shared/api/service-types";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type { TopicLatencyPoint } from "@/features/saturation/api/kafkaPanelsSchemas";
import { maxLatencyByTimestamp } from "@/features/saturation/series/aggregateLatencyByTimestamp";

type LatencyFetcher = (s: RequestTime, e: RequestTime) => Promise<TopicLatencyPoint[]>;

/** Folds a per-topic latency endpoint onto a single worst-case percentile timeline. */
export function useKafkaTopicLatencySeries(key: string, fetcher: LatencyFetcher) {
  const query = useTimeRangeQuery<TopicLatencyPoint[]>(key, (_team, s, e) => fetcher(s, e));
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
