import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type TopologyResponse, getTopology } from "@shared/api/red/redApi";

                                                                              
                                                                              
                                                                             
export function useServiceTopology(serviceName: string) {
  return useTimeRangeQuery<TopologyResponse>(
    "service-detail.topology",
    (_tenant, start, end) => getTopology(start, end, serviceName),
    { enabled: Boolean(serviceName), extraKeys: [serviceName] }
  );
}
