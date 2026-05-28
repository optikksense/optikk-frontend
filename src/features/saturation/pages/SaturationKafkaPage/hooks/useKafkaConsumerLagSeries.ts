import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getConsumerLagByGroup } from "@/features/saturation/api/kafkaPanelsApi";
import type { LagPoint } from "@/features/saturation/api/kafkaPanelsSchemas";

export interface ConsumerLagSeries {
  readonly timestamps: number[];
  readonly totalLag: number[];
}

function sumLagByTimestamp(rows: LagPoint[]): ConsumerLagSeries {
  const map = new Map<number, number>();
  for (const r of rows) {
    const ts = Math.floor(new Date(r.timestamp).getTime() / 1000);
    if (!Number.isFinite(ts)) continue;
    map.set(ts, (map.get(ts) ?? 0) + r.lag);
  }
  const timestamps = Array.from(map.keys()).sort((a, b) => a - b);
  return { timestamps, totalLag: timestamps.map((t) => map.get(t) ?? 0) };
}

export function useKafkaConsumerLagSeries() {
  const query = useTimeRangeQuery<LagPoint[]>("saturation-kafka.consumer-lag", (_team, s, e) =>
    getConsumerLagByGroup(s, e)
  );
  const series = useMemo(() => sumLagByTimestamp(query.data ?? []), [query.data]);
  return { series, isPending: query.isPending, isError: Boolean(query.error) };
}
