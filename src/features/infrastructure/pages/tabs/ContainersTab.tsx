import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useTimeRange, useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { buildLogsHubHref, podEqualsFilter } from "@shared/observability/deepLinks";

import { getFleetPods } from "../../api/hostsApi";
import InfraPodsTable from "../../components/InfraPodsTable";
import type { FleetPod } from "../../types";

function filterPods(pods: readonly FleetPod[], search: string): readonly FleetPod[] {
  const needle = search.trim().toLowerCase();
  if (!needle) return pods;
  return pods.filter(
    (p) => p.pod_name.toLowerCase().includes(needle) || p.host.toLowerCase().includes(needle)
  );
}

function PodSearch({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5">
      <Search size={14} className="text-foreground-muted" />
      <input
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder="Filter containers by pod name or host…"
        className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none"
      />
    </div>
  );
}

export default function ContainersTab() {
  const navigate = useNavigate();
  const { getTimeRange } = useTimeRange();
  const query = useTimeRangeQuery<FleetPod[]>("infrastructure.containers.list", (_team, s, e) =>
    getFleetPods(s, e)
  );
  const [search, setSearch] = useState("");
  const pods = query.data ?? [];
  const filtered = useMemo(() => filterPods(pods, search), [pods, search]);

  const onOpenPodLogs = (podName: string): void => {
    const { startTime, endTime } = getTimeRange();
    navigate({
      to: buildLogsHubHref({
        filters: [podEqualsFilter(podName)],
        fromMs: Number(startTime),
        toMs: Number(endTime),
      }) as never,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <PodSearch value={search} onChange={setSearch} />
      {filtered.length === 0 ? (
        <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted">
          {query.isPending ? "Loading containers…" : "No containers match the current filter."}
        </div>
      ) : (
        <InfraPodsTable pods={filtered} onOpenPodLogs={onOpenPodLogs} />
      )}
    </div>
  );
}
