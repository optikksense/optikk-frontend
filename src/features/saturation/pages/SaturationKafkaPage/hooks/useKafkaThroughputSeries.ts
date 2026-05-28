import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  getConsumeRateByTopic,
  getProduceRateByTopic,
} from "@/features/saturation/api/kafkaPanelsApi";
import type { TopicRatePoint } from "@/features/saturation/api/kafkaPanelsSchemas";

export interface ThroughputSeries {
  readonly timestamps: number[];
  readonly produce: number[];
  readonly consume: number[];
}

function sumByTimestamp(points: TopicRatePoint[]): Map<number, number> {
  const out = new Map<number, number>();
  for (const p of points) {
    const ts = Math.floor(new Date(p.timestamp).getTime() / 1000);
    if (!Number.isFinite(ts)) continue;
    out.set(ts, (out.get(ts) ?? 0) + p.rate_per_sec);
  }
  return out;
}

function mergeSeries(produce: TopicRatePoint[], consume: TopicRatePoint[]): ThroughputSeries {
  const produceByTs = sumByTimestamp(produce);
  const consumeByTs = sumByTimestamp(consume);
  const allTs = new Set<number>([...produceByTs.keys(), ...consumeByTs.keys()]);
  const timestamps = Array.from(allTs).sort((a, b) => a - b);
  return {
    timestamps,
    produce: timestamps.map((t) => produceByTs.get(t) ?? 0),
    consume: timestamps.map((t) => consumeByTs.get(t) ?? 0),
  };
}

export function useKafkaThroughputSeries() {
  const produceQ = useTimeRangeQuery<TopicRatePoint[]>(
    "saturation-kafka.produce-rate",
    (_team, s, e) => getProduceRateByTopic(s, e)
  );
  const consumeQ = useTimeRangeQuery<TopicRatePoint[]>(
    "saturation-kafka.consume-rate",
    (_team, s, e) => getConsumeRateByTopic(s, e)
  );
  const series = useMemo(
    () => mergeSeries(produceQ.data ?? [], consumeQ.data ?? []),
    [produceQ.data, consumeQ.data]
  );
  return {
    series,
    isPending: produceQ.isPending || consumeQ.isPending,
    isError: Boolean(produceQ.error || consumeQ.error),
  };
}
