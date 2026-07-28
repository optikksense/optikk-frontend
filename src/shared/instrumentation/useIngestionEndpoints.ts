import { useQuery } from "@tanstack/react-query";

import { useTenantId } from "@app/store/appStore";
import {
  type IngestionEndpoints,
  LOCAL_INGESTION_ENDPOINTS,
  getIngestionEndpoints,
} from "@shared/api/ingestionEndpoints";

const HOUR_MS = 60 * 60 * 1000;

/**
 * Fetches and caches the tenant's OTLP connection info. Returns undefined
 * while loading; falls back to the local-dev endpoints if the backend
 * cannot be reached.
 */
export function useIngestionEndpoints(): IngestionEndpoints | undefined {
  const tenantId = useTenantId();
  const { data, isError } = useQuery({
    queryKey: ["tenant", "ingestion-endpoints", tenantId],
    queryFn: () => getIngestionEndpoints(),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: HOUR_MS,
  });
  if (data != null) {
    return data;
  }
  return isError ? LOCAL_INGESTION_ENDPOINTS : undefined;
}
