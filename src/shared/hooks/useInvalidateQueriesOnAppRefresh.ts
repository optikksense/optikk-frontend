import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

   
                                                                                               
                                                                                            
                                       
   
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
