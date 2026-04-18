import { useMemo } from "react";

import {
  type FingerprintTrendPoint,
  serviceDetailApi,
} from "@/features/overview/api/serviceDetailApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

interface TrendInput {
  readonly serviceName: string;
  readonly operationName: string;
  readonly exceptionType?: string;
  readonly statusMessage?: string;
}

interface TrendPoint {
  readonly timestamp: number;
  readonly count: number;
}

function toSeconds(iso: string | undefined): number {
  if (!iso) return 0;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
}

function normalize(points: readonly FingerprintTrendPoint[]): TrendPoint[] {
  return points
    .map((point) => ({ timestamp: toSeconds(point.timestamp), count: point.count ?? 0 }))
    .filter((point) => point.timestamp > 0)
    .sort((left, right) => left.timestamp - right.timestamp);
}

export function useFingerprintTrend(input: TrendInput | null): {
  points: TrendPoint[];
  loading: boolean;
} {
  const enabled = Boolean(input?.serviceName && input?.operationName);
  const query = useTimeRangeQuery<FingerprintTrendPoint[]>(
    "service-page-fingerprint-trend",
    (_teamId, start, end) =>
      serviceDetailApi.getFingerprintTrends(
        start,
        end,
        input?.serviceName ?? "",
        input?.operationName ?? "",
        input?.exceptionType,
        input?.statusMessage
      ),
    {
      extraKeys: [
        input?.serviceName ?? "",
        input?.operationName ?? "",
        input?.exceptionType ?? "",
        input?.statusMessage ?? "",
      ],
      enabled,
    }
  );

  const points = useMemo(() => normalize(query.data ?? []), [query.data]);
  return { points, loading: query.isLoading && points.length === 0 };
}
