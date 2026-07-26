import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { ROUTES } from "@/shared/constants/routes";

import { getFleetPods } from "../../../api/nodesApi";
import InfraPodsTable from "../../../components/InfraPodsTable";
import { getPodDetails } from "../../../components/InfraPodsTable";
import type { FleetPod } from "../../../types";
import { ContainersKpiGrid } from "./ContainersKpiGrid";
import { TopContainersList } from "./TopContainersList";

export default function ContainersTab() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const query = useTimeRangeQuery<FleetPod[]>("infrastructure.containers.list", (_tenant, s, e) =>
    getFleetPods(s, e)
  );

  const pods = query.data ?? [];

  const processedPods = useMemo(() => {
    return pods.map((p) => {
      const details = getPodDetails(p.podName, p.errorRate);
      return {
        ...p,
        ...details,
      };
    });
  }, [pods]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return processedPods;
    return processedPods.filter(
      (p) =>
        p.podName.toLowerCase().includes(needle) ||
        p.host.toLowerCase().includes(needle) ||
        p.img.toLowerCase().includes(needle) ||
        p.ns.toLowerCase().includes(needle)
    );
  }, [processedPods, q]);

  // Compute KPI stats dynamically
  const kpiStats = useMemo(() => {
    let running = 0;
    let pending = 0;
    let crashLoop = 0;
    let restarts = 0;

    processedPods.forEach((p) => {
      if (p.status === "running") running++;
      else if (p.status === "pending") pending++;
      else if (p.status === "crashloop" || p.status === "oomkilled") crashLoop++;
      restarts += p.restarts;
    });

    return { running, pending, crashLoop, restarts };
  }, [processedPods]);

  const topCpuContainers = useMemo(() => {
    return [...processedPods].sort((a, b) => b.cpu - a.cpu).slice(0, 6);
  }, [processedPods]);

  const topMemContainers = useMemo(() => {
    return [...processedPods].sort((a, b) => b.mem - a.mem).slice(0, 6);
  }, [processedPods]);

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
      <ContainersKpiGrid kpiStats={kpiStats} totalPods={processedPods.length} />
      {}
      <div className="rounded-md border border-border bg-card p-3.5 shadow-sm">
        <div className="flex w-[320px] items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 focus-within:border-primary">
          <Search size={14} className="text-foreground-muted" />
          <input
            value={q}
            onChange={(ev) => setQ(ev.target.value)}
            placeholder="Filter by name, image, namespace…"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-muted"
          />
        </div>
      </div>

      {}
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

      {}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopContainersList
          title="Top CPU containers"
          metricType="cpu"
          containers={topCpuContainers}
          onOpenContainer={onOpenContainer}
        />

        <TopContainersList
          title="Top memory containers"
          metricType="mem"
          containers={topMemContainers}
          onOpenContainer={onOpenContainer}
        />
      </div>
    </div>
  );
}
