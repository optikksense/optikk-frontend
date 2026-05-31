import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getHosts } from "@/features/infrastructure/api/hostsApi";
import type { Host as HostSaturationRow } from "@/features/infrastructure/api/hostsApi";

export function useKafkaBrokers() {
  const query = useTimeRangeQuery<HostSaturationRow[]>("saturation-kafka.brokers", (_team, s, e) =>
    getHosts(s, e)
  );
  const brokers = useMemo(
    () => (query.data ?? []).filter((h) => h.subsystem === "kafka"),
    [query.data]
  );
  return { brokers, isPending: query.isPending };
}
