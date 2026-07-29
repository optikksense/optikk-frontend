import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { ROUTES } from "@/shared/constants/routes";

import { getFleetPods } from "../../../api/nodesApi";
import { InfraFilterInput } from "../../../components/InfraFilterInput";
import InfraPodsTable from "../../../components/InfraPodsTable";
import type { FleetPod } from "../../../types";

export default function ContainersTab() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const query = useTimeRangeQuery<FleetPod[]>("infrastructure.containers.list", (_tenant, s, e) =>
    getFleetPods(s, e)
  );

  const pods = query.data ?? [];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return pods;
    return pods.filter(
      (p) =>
        p.podName.toLowerCase().includes(needle) ||
        p.host.toLowerCase().includes(needle) ||
        p.services.some((s) => s.toLowerCase().includes(needle))
    );
  }, [pods, q]);

  const onOpenHost = (host: string) => {
    navigate({ to: ROUTES.hostDetail.replace("$host", encodeURIComponent(host as string & {})) });
  };

  const onOpenContainer = (container: string) => {
    navigate({
      to: ROUTES.containerDetail.replace(
        "$container",
        encodeURIComponent(container as string & {})
      ),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-border bg-card p-3.5 shadow-sm">
        <InfraFilterInput value={q} onChange={setQ} placeholder="Filter by name, host, service…" />
      </div>

      <div className="min-w-0">
        <InfraPodsTable
          pods={filtered}
          onOpenContainer={onOpenContainer}
          onOpenHost={onOpenHost}
          isPending={query.isPending}
          emptyText="No containers match the current filter."
        />
      </div>
    </div>
  );
}
