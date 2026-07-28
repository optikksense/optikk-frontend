import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useRefreshKey } from "@app/store/appStore";

/**
 * Single app-level refresh subscriber. Mounted once in the app shell.
 *
 * On every refresh (manual click or auto-refresh tick) the store bumps
 * refreshKey and re-resolves the shared time bounds. This effect then
 * invalidates all queries: relative ranges refetch under their new
 * bounds-based keys, absolute ranges refetch in place.
 */
export function useAppRefreshSubscriber(): void {
  const queryClient = useQueryClient();
  const refreshKey = useRefreshKey();
  const prevRefreshKey = useRef(refreshKey);

  useEffect(() => {
    if (prevRefreshKey.current === refreshKey) return;
    prevRefreshKey.current = refreshKey;
    void queryClient.invalidateQueries();
  }, [refreshKey, queryClient]);
}
