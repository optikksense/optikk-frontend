import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useRefreshKey, useTimeRange } from "@app/store/appStore";

/**
 * Single app-level refresh subscriber. Mounted once in the app shell.
 *
 * Relative ranges refetch through their new bounds-based key. Absolute ranges
 * keep the same key, so only their active time-scoped queries are invalidated.
 */
export function useAppRefreshSubscriber(): void {
  const queryClient = useQueryClient();
  const refreshKey = useRefreshKey();
  const timeRange = useTimeRange();
  const prevRefreshKey = useRef(refreshKey);

  useEffect(() => {
    if (prevRefreshKey.current === refreshKey) return;
    prevRefreshKey.current = refreshKey;
    if (timeRange.kind === "absolute") {
      void queryClient.invalidateQueries({ queryKey: ["component-query"], refetchType: "active" });
    }
  }, [refreshKey, queryClient, timeRange.kind]);
}
