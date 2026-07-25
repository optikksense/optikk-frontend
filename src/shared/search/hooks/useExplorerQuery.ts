import { useRefreshKey, useTenantId, useTimeRange } from "@app/store/appStore";
import { useSearchParamsCompat } from "@shared/hooks/useSearchParamsCompat";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useMemo } from "react";

import { resolveTimeBounds } from "@shared/utils/timeBounds";
import type { ExplorerFilter } from "../types/filters";
import type { ExplorerIncludeFlag, ExplorerQueryRequest } from "../types/queries";

interface UseExplorerQueryArgs<TResponse> {
  readonly scope: "logs" | "traces";
  readonly filters: readonly ExplorerFilter[];
  readonly cursor: string | null;
  readonly limit: number;
  readonly include: readonly ExplorerIncludeFlag[];
  readonly enabled?: boolean;
  readonly fetcher: (body: ExplorerQueryRequest) => Promise<TResponse>;
}

export function useExplorerQuery<TResponse>(args: UseExplorerQueryArgs<TResponse>) {
  const tenantId = useTenantId();
  const refreshKey = useRefreshKey();
  const timeRange = useTimeRange();
  const [params] = useSearchParamsCompat();

  const urlFrom = params.get("from") ? Number(params.get("from")) : undefined;
  const urlTo = params.get("to") ? Number(params.get("to")) : undefined;
  const hasUrlBounds =
    urlFrom !== undefined &&
    urlTo !== undefined &&
    Number.isFinite(urlFrom) &&
    Number.isFinite(urlTo) &&
    urlFrom > 0 &&
    urlTo > urlFrom;

  const { startTime, endTime } = (() => {
    if (hasUrlBounds) {
      return { startTime: urlFrom!, endTime: urlTo! };
    }
    return resolveTimeBounds(timeRange);
  })();

  const timeRangeKey = useMemo(
    () => (hasUrlBounds ? `${urlFrom}-${urlTo}` : JSON.stringify(timeRange)),
    [hasUrlBounds, urlFrom, urlTo, timeRange]
  );

  const query = useStandardQuery<TResponse>({
    queryKey: [
      args.scope,
      "explorer",
      "query",
      tenantId ?? "none",
      refreshKey,
      timeRangeKey,
      JSON.stringify(args.filters),
      args.cursor,
      args.limit,
      args.include.join(","),
    ],
    queryFn: () => {
      return args.fetcher({
        startTime,
        endTime,
        filters: args.filters,
        cursor: args.cursor ?? undefined,
        limit: args.limit,
        include: args.include,
      });
    },
    enabled: args.enabled ?? true,
  });

  return { ...query, startTime, endTime, tenantId, refreshKey };
}

export interface UseExplorerSubQueryArgs<TResponse> {
  readonly scope: "logs" | "traces";
  readonly subKey: string;
  readonly filters: readonly ExplorerFilter[];
  readonly enabled?: boolean;
  readonly fetcher: (req: {
    startTime: number;
    endTime: number;
    filters: readonly ExplorerFilter[];
  }) => Promise<TResponse>;
}

export function useExplorerSubQuery<TResponse>(args: UseExplorerSubQueryArgs<TResponse>) {
  const tenantId = useTenantId();
  const refreshKey = useRefreshKey();
  const timeRange = useTimeRange();
  const [params] = useSearchParamsCompat();

  const urlFrom = params.get("from") ? Number(params.get("from")) : undefined;
  const urlTo = params.get("to") ? Number(params.get("to")) : undefined;
  const hasUrlBounds =
    urlFrom !== undefined &&
    urlTo !== undefined &&
    Number.isFinite(urlFrom) &&
    Number.isFinite(urlTo) &&
    urlFrom > 0 &&
    urlTo > urlFrom;

  const { startTime, endTime } = (() => {
    if (hasUrlBounds) {
      return { startTime: urlFrom!, endTime: urlTo! };
    }
    return resolveTimeBounds(timeRange);
  })();

  const timeRangeKey = useMemo(
    () => (hasUrlBounds ? `${urlFrom}-${urlTo}` : JSON.stringify(timeRange)),
    [hasUrlBounds, urlFrom, urlTo, timeRange]
  );
  const filtersKey = useMemo(() => JSON.stringify(args.filters), [args.filters]);

  return useStandardQuery<TResponse>({
    queryKey: [
      args.scope,
      "explorer",
      args.subKey,
      tenantId ?? "none",
      refreshKey,
      timeRangeKey,
      filtersKey,
    ],
    queryFn: () => {
      return args.fetcher({
        startTime,
        endTime,
        filters: args.filters,
      });
    },
    enabled: args.enabled ?? true,
  });
}
