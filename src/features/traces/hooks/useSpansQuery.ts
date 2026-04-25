import { useMemo } from "react";

import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { resolveTimeBounds } from "@/features/explorer/utils/timeRange";
import type { ExplorerFilter } from "@/features/explorer/types";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { spansExplorerApi } from "../api/spansExplorerApi";
import type { SpansQueryResponse } from "../types/span";

interface Args {
  readonly filters: readonly ExplorerFilter[];
  readonly limit?: number;
  readonly enabled?: boolean;
}

/** Spans-scope list fetch for the "Spans" view toggle (A6). */
export function useSpansQuery(args: Args) {
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);
  const body = useMemo(
    () => ({ startTime, endTime, filters: args.filters, limit: args.limit ?? 50 }),
    [startTime, endTime, args.filters, args.limit],
  );
  return useStandardQuery<SpansQueryResponse>({
    queryKey: ["traces", "spans-query", teamId ?? "none", refreshKey, startTime, endTime, JSON.stringify(args.filters), args.limit ?? 50],
    queryFn: () => spansExplorerApi.query(body),
    enabled: args.enabled ?? true,
  });
}
