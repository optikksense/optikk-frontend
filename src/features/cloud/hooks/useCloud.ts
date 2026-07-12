import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getCloudOverview, getCloudProvider } from "../api/cloudApi";
import type { CloudOverview, CloudProviderDetail } from "../types";

export function useCloudOverview() {
  return useTimeRangeQuery<CloudOverview>("cloud.overview", (_tenantId, start, end) =>
    getCloudOverview(start, end)
  );
}

export function useCloudProvider(provider: string | null) {
  return useTimeRangeQuery<CloudProviderDetail>(
    "cloud.provider",
    (_tenantId, start, end) => getCloudProvider(provider ?? "", start, end),
    { extraKeys: [provider ?? ""], enabled: Boolean(provider) }
  );
}
