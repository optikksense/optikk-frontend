import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type TopologyResponse, getTopology } from "@/features/services/api/serviceCatalogApi";

// Fetches the runtime topology scoped to a focus service. The server owns all
// neighborhood pruning (1-hop upstream + downstream) — the focus name is sent
// as a query param and is part of the cache key so changing focus refetches.
export function useServiceTopology(serviceName: string) {
  return useTimeRangeQuery<TopologyResponse>(
    "service-detail.topology",
    (_team, start, end) => getTopology(start, end, serviceName),
    { enabled: Boolean(serviceName), extraKeys: [serviceName] }
  );
}
