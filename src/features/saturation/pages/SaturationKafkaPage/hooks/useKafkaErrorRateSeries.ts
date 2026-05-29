import { useMemo } from "react";

import type { RequestTime } from "@/shared/api/service-types";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type { ErrorRatePoint } from "@/features/saturation/api/kafkaPanelsSchemas";
import { sumByTimestamp } from "@/features/saturation/series/aggregateByTimestamp";

type ErrorFetcher = (s: RequestTime, e: RequestTime) => Promise<ErrorRatePoint[]>;

/** Folds an error-rate endpoint onto a single cluster-wide errors/sec timeline. */
export function useKafkaErrorRateSeries(key: string, fetcher: ErrorFetcher) {
  const query = useTimeRangeQuery<ErrorRatePoint[]>(key, (_team, s, e) => fetcher(s, e));
  const series = useMemo(
    () => sumByTimestamp(query.data ?? [], (r) => r.timestamp, (r) => r.error_rate),
    [query.data]
  );
  return { series, isPending: query.isPending, isError: Boolean(query.error) };
}
