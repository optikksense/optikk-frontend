import { Cpu, MemoryStick } from "lucide-react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getTopHosts } from "../api/infrastructureApi";
import type { InfraTopHost } from "../types";
import { InfraTopConsumersPanel } from "./InfraTopConsumersPanel";

const TOP_LIMIT = 6;

interface InfraTopConsumersSidebarProps {
  readonly onOpenHost: (host: string) => void;
}

function useTopHosts(queryKey: string, endpoint: string) {
  return useTimeRangeQuery<readonly InfraTopHost[]>(queryKey, async (teamId, start, end) => {
    if (!teamId) return [];
    return getTopHosts(endpoint, teamId, Number(start), Number(end), TOP_LIMIT);
  });
}

/**
 * Pair of ranked side cards for the Hosts tab — top CPU and top memory
 * consumers — backed by the cpu/top and memory/top endpoints. Owns its own
 * time-range queries so the Hosts tab stays a thin layout composer.
 */
export function InfraTopConsumersSidebar({ onOpenHost }: InfraTopConsumersSidebarProps) {
  const cpu = useTopHosts("infrastructure.hosts.top-cpu", "/v1/infrastructure/cpu/top");
  const memory = useTopHosts("infrastructure.hosts.top-memory", "/v1/infrastructure/memory/top");

  return (
    <div className="flex flex-col gap-3">
      <InfraTopConsumersPanel
        title="Top CPU consumers"
        icon={Cpu}
        hosts={cpu.data ?? []}
        isPending={cpu.isPending}
        onOpenHost={onOpenHost}
      />
      <InfraTopConsumersPanel
        title="Top memory consumers"
        icon={MemoryStick}
        hosts={memory.data ?? []}
        isPending={memory.isPending}
        onOpenHost={onOpenHost}
      />
    </div>
  );
}
