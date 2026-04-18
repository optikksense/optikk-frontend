import { useMemo } from "react";

import {
  type ApdexPoint,
  serviceDetailApi,
} from "@/features/overview/api/serviceDetailApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export interface ApdexSummary {
  readonly apdex: number | null;
  readonly satisfied: number;
  readonly tolerating: number;
  readonly frustrated: number;
}

function toSummary(row: ApdexPoint | undefined): ApdexSummary | null {
  if (!row) return null;
  return {
    apdex: row.apdex ?? null,
    satisfied: row.satisfied ?? 0,
    tolerating: row.tolerating ?? 0,
    frustrated: row.frustrated ?? 0,
  };
}

export function useApdex(serviceName: string): {
  summary: ApdexSummary | null;
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery<ApdexPoint[]>(
    "service-page-apdex",
    (_teamId, start, end) => serviceDetailApi.getApdex(start, end, serviceName),
    { extraKeys: [serviceName], enabled }
  );

  // Backend filters by serviceName, so the response is either 0 or 1 row.
  const summary = useMemo(() => toSummary(query.data?.[0]), [query.data]);
  return { summary, loading: query.isLoading && !summary };
}
