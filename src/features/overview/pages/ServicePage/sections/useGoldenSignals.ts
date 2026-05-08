import { useMemo } from "react";

import {
  getErrorRateTimeseries,
  getP95LatencyTimeseries,
  getRequestRateTimeseries,
} from "@/features/overview/api/serviceMetricsApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

interface SeriesPoint {
  readonly timestamp: number;
  readonly value: number;
}

function toSeconds(isoTimestamp: string): number {
  const ms = new Date(isoTimestamp).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
}

function pairSeries<T extends { timestamp: string }>(
  rows: readonly T[],
  valueOf: (row: T) => number
): SeriesPoint[] {
  return rows
    .map((row) => ({ timestamp: toSeconds(row.timestamp), value: valueOf(row) }))
    .filter((point) => point.timestamp > 0)
    .sort((left, right) => left.timestamp - right.timestamp);
}

export function useGoldenSignals(serviceName: string) {
  const enabled = Boolean(serviceName);

  const requestQ = useTimeRangeQuery(
    "service-page-request-rate",
    (_teamId, start, end) => getRequestRateTimeseries(start, end, serviceName),
    { extraKeys: [serviceName], enabled }
  );

  const errorQ = useTimeRangeQuery(
    "service-page-error-rate",
    (_teamId, start, end) => getErrorRateTimeseries(start, end, serviceName),
    { extraKeys: [serviceName], enabled }
  );

  const latencyQ = useTimeRangeQuery(
    "service-page-p95",
    (_teamId, start, end) => getP95LatencyTimeseries(start, end, serviceName),
    { extraKeys: [serviceName], enabled }
  );

  const requests = useMemo(
    () => pairSeries(requestQ.data ?? [], (row) => row.requestCount),
    [requestQ.data]
  );
  const errorRate = useMemo(
    () => pairSeries(errorQ.data ?? [], (row) => row.errorRate * 100),
    [errorQ.data]
  );
  const latency = useMemo(
    () => pairSeries(latencyQ.data ?? [], (row) => row.p95),
    [latencyQ.data]
  );

  return {
    requests,
    errorRate,
    latency,
    loading: requestQ.isLoading || errorQ.isLoading || latencyQ.isLoading,
  };
}
