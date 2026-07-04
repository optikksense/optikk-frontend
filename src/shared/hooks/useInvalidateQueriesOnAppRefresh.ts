import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

/**
 * When `refreshKey` bumps (manual/auto refresh), invalidates queries under `[scope, tenantId]`
 * so they refetch without putting `refreshKey` in each query key — avoids a new cache entry
 * and loading flash on every interval.
 */
export function useInvalidateQueriesOnAppRefresh(
  refreshKey: number,
  scope: "component-query" | "datasource",
  selectedTenantId: number | null
): void {
  const queryClient = useQueryClient();
  const prevRefreshKey = useRef<number | null>(null);

  useEffect(() => {
    if (prevRefreshKey.current === null) {
      prevRefreshKey.current = refreshKey;
      return;
    }
    if (prevRefreshKey.current === refreshKey) {
      return;
    }
    prevRefreshKey.current = refreshKey;
    if (!selectedTenantId) return;
    void queryClient.invalidateQueries({
      queryKey: [scope, selectedTenantId],
    });
  }, [refreshKey, queryClient, scope, selectedTenantId]);
}
