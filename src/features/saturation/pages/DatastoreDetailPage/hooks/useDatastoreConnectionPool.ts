import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type ConnectionLimits,
  type ConnectionUtilPoint,
  type PendingRequestsPoint,
  type PoolLatencyPoint,
  getConnectionCreateTime,
  getConnectionLimits,
  getConnectionUseTime,
  getConnectionUtilization,
  getConnectionWaitTime,
  getPendingRequests,
} from "@/features/saturation/api/databaseConnectionsApi";
import type { DatabaseFilters } from "@/features/saturation/api/databaseSlowQueriesApi";
import { maxLatencyByTimestamp } from "@/features/saturation/series/aggregateLatencyByTimestamp";
import {
  type GroupedSeriesResult,
  groupSeriesByLabel,
} from "@/features/saturation/series/groupSeriesByLabel";

function usePoolLatency(
  key: string,
  system: string,
  fetcher: (
    s: string | number,
    e: string | number,
    f?: DatabaseFilters
  ) => Promise<PoolLatencyPoint[]>
) {
  const filters: DatabaseFilters = { db_system: system };
  const query = useTimeRangeQuery<PoolLatencyPoint[]>(
    key,
    (_t, s, e) => fetcher(s, e, filters),
    { extraKeys: [system] }
  );
  return useMemo(
    () =>
      maxLatencyByTimestamp(
        query.data ?? [],
        (r) => r.time_bucket,
        (r) => ({ p50: r.p50_ms, p95: r.p95_ms, p99: r.p99_ms })
      ),
    [query.data]
  );
}

export interface ConnectionPoolData {
  readonly utilization: GroupedSeriesResult;
  readonly pending: GroupedSeriesResult;
  readonly waitTime: ReturnType<typeof maxLatencyByTimestamp>;
  readonly createTime: ReturnType<typeof maxLatencyByTimestamp>;
  readonly useTime: ReturnType<typeof maxLatencyByTimestamp>;
  readonly limits: ConnectionLimits[];
}

export function useDatastoreConnectionPool(system: string): ConnectionPoolData {
  const filters: DatabaseFilters = { db_system: system };

  const utilQ = useTimeRangeQuery<ConnectionUtilPoint[]>(
    "saturation-datastore.conn-utilization",
    (_t, s, e) => getConnectionUtilization(s, e, filters),
    { extraKeys: [system] }
  );
  const pendingQ = useTimeRangeQuery<PendingRequestsPoint[]>(
    "saturation-datastore.conn-pending",
    (_t, s, e) => getPendingRequests(s, e, filters),
    { extraKeys: [system] }
  );
  const limitsQ = useTimeRangeQuery<ConnectionLimits[]>(
    "saturation-datastore.conn-limits",
    (_t, s, e) => getConnectionLimits(s, e, filters),
    { extraKeys: [system] }
  );

  const utilization = useMemo(
    () =>
      groupSeriesByLabel(
        (utilQ.data ?? []).map((r) => ({
          timeBucket: r.time_bucket,
          label: r.pool_name,
          value: r.util_pct,
        }))
      ),
    [utilQ.data]
  );
  const pending = useMemo(
    () =>
      groupSeriesByLabel(
        (pendingQ.data ?? []).map((r) => ({
          timeBucket: r.time_bucket,
          label: r.pool_name,
          value: r.count,
        }))
      ),
    [pendingQ.data]
  );

  const waitTime = usePoolLatency(
    "saturation-datastore.conn-wait-time",
    system,
    getConnectionWaitTime
  );
  const createTime = usePoolLatency(
    "saturation-datastore.conn-create-time",
    system,
    getConnectionCreateTime
  );
  const useTime = usePoolLatency("saturation-datastore.conn-use-time", system, getConnectionUseTime);

  return {
    utilization,
    pending,
    waitTime,
    createTime,
    useTime,
    limits: limitsQ.data ?? [],
  };
}
