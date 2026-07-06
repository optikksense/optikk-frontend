import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { useTenantId } from "@store/appStore";

import {
  getIngestionServices,
  getIngestionSummary,
  getIngestionTimeseries,
} from "../api/ingestionApi";

// Ingestion is a billing-period view, so it ignores the global time selector
// and always reports the current calendar month to date (UTC).
function monthToDateRange(): { startTime: number; endTime: number; monthKey: string } {
  const now = new Date();
  const startTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const monthKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
  return { startTime, endTime: now.getTime(), monthKey };
}

export function useIngestionSummary() {
  const tenantId = useTenantId();
  const { startTime, endTime, monthKey } = monthToDateRange();
  return useStandardQuery({
    queryKey: ["ingestion.summary", tenantId, monthKey],
    queryFn: () => getIngestionSummary(startTime, endTime),
    enabled: Boolean(tenantId),
    staleTime: 60_000,
  });
}

export function useIngestionTimeseries(groupBy: "type" | "service") {
  const tenantId = useTenantId();
  const { startTime, endTime, monthKey } = monthToDateRange();
  return useStandardQuery({
    queryKey: ["ingestion.timeseries", tenantId, monthKey, groupBy],
    queryFn: () => getIngestionTimeseries(startTime, endTime, groupBy),
    enabled: Boolean(tenantId),
    staleTime: 60_000,
  });
}

export function useIngestionServices() {
  const tenantId = useTenantId();
  const { startTime, endTime, monthKey } = monthToDateRange();
  return useStandardQuery({
    queryKey: ["ingestion.services", tenantId, monthKey],
    queryFn: () => getIngestionServices(startTime, endTime),
    enabled: Boolean(tenantId),
    staleTime: 60_000,
  });
}
