import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type Host, getHosts } from "@/features/infrastructure/api/hostsApi";

export function useServiceHosts(serviceName: string) {
  return useTimeRangeQuery<Host[]>(
    "service-detail.hosts",
    (_tenant, start, end) => getHosts(start, end, serviceName),
    { extraKeys: [serviceName], enabled: Boolean(serviceName) }
  );
}
