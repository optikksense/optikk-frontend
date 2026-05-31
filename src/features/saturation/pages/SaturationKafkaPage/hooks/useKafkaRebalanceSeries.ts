import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getRebalanceSignals } from "@/features/saturation/api/kafkaPanelsApi";
import type { RebalancePoint } from "@/features/saturation/api/kafkaPanelsSchemas";
import { sumByTimestamp } from "@/features/saturation/series/aggregateByTimestamp";

export interface RebalanceSeries {
  readonly timestamps: number[];
  readonly rebalanceRate: number[];
  readonly joinRate: number[];
  readonly syncRate: number[];
  readonly failedHeartbeatRate: number[];
}

function buildSeries(rows: RebalancePoint[]): RebalanceSeries {
  const rebalance = sumByTimestamp(
    rows,
    (r) => r.timestamp,
    (r) => r.rebalance_rate
  );
  const join = sumByTimestamp(
    rows,
    (r) => r.timestamp,
    (r) => r.join_rate
  );
  const sync = sumByTimestamp(
    rows,
    (r) => r.timestamp,
    (r) => r.sync_rate
  );
  const failed = sumByTimestamp(
    rows,
    (r) => r.timestamp,
    (r) => r.failed_heartbeat_rate
  );
  const byTs = (s: typeof rebalance) => new Map(s.timestamps.map((t, i) => [t, s.values[i]]));
  const joinByTs = byTs(join);
  const syncByTs = byTs(sync);
  const failedByTs = byTs(failed);
  return {
    timestamps: rebalance.timestamps,
    rebalanceRate: rebalance.values,
    joinRate: rebalance.timestamps.map((t) => joinByTs.get(t) ?? 0),
    syncRate: rebalance.timestamps.map((t) => syncByTs.get(t) ?? 0),
    failedHeartbeatRate: rebalance.timestamps.map((t) => failedByTs.get(t) ?? 0),
  };
}

export function useKafkaRebalanceSeries() {
  const query = useTimeRangeQuery<RebalancePoint[]>(
    "saturation-kafka.rebalance-signals",
    (_team, s, e) => getRebalanceSignals(s, e)
  );
  const series = useMemo(() => buildSeries(query.data ?? []), [query.data]);
  return { series, isPending: query.isPending, isError: Boolean(query.error) };
}
