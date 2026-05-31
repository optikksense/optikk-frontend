import { useStandardQuery } from "@/shared/hooks/useStandardQuery";

import { type MonitorEvent, getMonitorsActivity } from "../api/monitorsApi";

export function useMonitorsActivity(limit = 8) {
  return useStandardQuery<MonitorEvent[]>({
    queryKey: ["monitors", "activity", limit],
    queryFn: () => getMonitorsActivity(undefined, limit),
    staleTime: 15_000,
  });
}
