import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { ROUTES } from "@/shared/constants/routes";

import { getFleetPods } from "../../../api/nodesApi";
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
        <div className="flex w-[320px] items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 focus-within:border-primary">
          <Search size={14} className="text-foreground-muted" />
          <input
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
            placeholder="Filter by name, host, service…"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-muted"
          />
        </div>
      </div>

      <div className="min-w-0">
        {filtered.length === 0 ? (
          <div className="grid h-[200px] place-items-center rounded-md border border-border bg-card text-[12px] text-foreground-muted">
            {query.isPending ? "Loading containers…" : "No containers match the current filter."}
          </div>
        ) : (
          <InfraPodsTable
            pods={filtered}
            onOpenContainer={onOpenContainer}
            onOpenHost={onOpenHost}
          />
        )}
      </div>
    </div>
  );
}
