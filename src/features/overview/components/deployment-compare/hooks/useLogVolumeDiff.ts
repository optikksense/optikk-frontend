import { useRefreshKey, useTeamId } from "@app/store/appStore";
import { queryLogs } from "@features/log/api/logsExplorerApi";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

export interface WindowVolume {
  readonly total: number;
  readonly errors: number;
  readonly fatals: number;
  readonly warnings: number;
}

export interface LogVolumeDiff {
  readonly before: WindowVolume | null;
  readonly after: WindowVolume;
  readonly loading: boolean;
}

interface TrendBucket {
  total: number;
  errors: number;
  warnings: number;
}

function sumBuckets(buckets: TrendBucket[] | undefined): WindowVolume {
  const base: WindowVolume = { total: 0, errors: 0, fatals: 0, warnings: 0 };
  if (!buckets) return base;
  return buckets.reduce<WindowVolume>(
    (acc, b) => ({
      total: acc.total + b.total,
      errors: acc.errors + b.errors,
      fatals: acc.fatals,
      warnings: acc.warnings + b.warnings,
    }),
    base,
  );
}

function fetchTrend(serviceName: string, start: number, end: number) {
  return queryLogs({
    startTime: start,
    endTime: end,
    filters: [{ field: "service_name", op: "eq", value: serviceName }],
    limit: 0,
    include: ["trend"],
  }).then((r) => r.trend ?? []);
}

export function useLogVolumeDiff(
  serviceName: string,
  beforeStart: number | undefined,
  beforeEnd: number | undefined,
  afterStart: number,
  afterEnd: number,
): LogVolumeDiff {
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const enabled = Boolean(teamId && serviceName && afterEnd > afterStart);

  const afterQ = useStandardQuery<TrendBucket[]>({
    queryKey: [
      "deploy-compare-log-volume-after",
      teamId,
      refreshKey,
      serviceName,
      afterStart,
      afterEnd,
    ],
    queryFn: () => fetchTrend(serviceName, afterStart, afterEnd),
    enabled,
  });

  const beforeQ = useStandardQuery<TrendBucket[]>({
    queryKey: [
      "deploy-compare-log-volume-before",
      teamId,
      refreshKey,
      serviceName,
      beforeStart,
      beforeEnd,
    ],
    queryFn: () => fetchTrend(serviceName, beforeStart ?? 0, beforeEnd ?? 0),
    enabled: enabled && Boolean(beforeStart && beforeEnd),
  });

  return {
    before: beforeQ.data ? sumBuckets(beforeQ.data) : null,
    after: sumBuckets(afterQ.data),
    loading: afterQ.isLoading || beforeQ.isLoading,
  };
}
