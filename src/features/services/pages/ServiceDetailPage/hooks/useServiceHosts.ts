import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type HostForService, getHostsForService } from "@/features/services/api/serviceHostsApi";

export function useServiceHosts(serviceName: string) {
  return useTimeRangeQuery<HostForService[]>(
    "service-detail.hosts",
    (_team, start, end) => getHostsForService(start, end, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
