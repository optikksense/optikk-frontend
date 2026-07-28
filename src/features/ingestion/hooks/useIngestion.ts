import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { useTenantId } from "@app/store/appStore";

import { getIngestionOverview } from "../api/ingestionApi";

                                                                             
                                                               
function monthToDateRange(): { startTime: number; endTime: number; monthKey: string } {
  const now = new Date();
  const startTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const monthKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
  return { startTime, endTime: now.getTime(), monthKey };
}

export function useIngestionOverview() {
  const tenantId = useTenantId();
  const { startTime, endTime, monthKey } = monthToDateRange();
  return useStandardQuery({
    queryKey: ["ingestion.overview", tenantId, monthKey],
    queryFn: ({ signal }) => getIngestionOverview(startTime, endTime, signal),
    enabled: Boolean(tenantId),
    staleTime: 60_000,
  });
}
