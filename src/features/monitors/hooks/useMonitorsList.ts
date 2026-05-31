import { useStandardQuery } from "@/shared/hooks/useStandardQuery";

import {
  type ListMonitorsParams,
  type MonitorListResponse,
  listMonitors,
} from "../api/monitorsApi";

const STALE_MS = 15_000;

export function useMonitorsList(params: ListMonitorsParams) {
  return useStandardQuery<MonitorListResponse>({
    queryKey: ["monitors", "list", params],
    queryFn: () => listMonitors(params),
    staleTime: STALE_MS,
  });
}
