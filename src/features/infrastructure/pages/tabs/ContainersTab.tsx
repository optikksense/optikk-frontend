import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useTimeRange, useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { dynamicTo } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

import { getFleetPods } from "../../api/hostsApi";
import InfraPodsTable from "../../components/InfraPodsTable";
import type { FleetPod } from "../../types";
import { getPodDetails } from "../../components/InfraPodsTable";

function KpiCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  color?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3.5 shadow-sm">
      <div className="text-[12.5px] text-foreground-muted leading-none">{label}</div>
      <div
        className="mt-1 font-bold text-[22px] leading-tight"
        style={{ color: color || "var(--fg-0)" }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11.5px] text-foreground-muted">{subtext}</div>
    </div>
  );
}

export default function ContainersTab() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const query = useTimeRangeQuery<FleetPod[]>("infrastructure.containers.list", (_team, s, e) =>
    getFleetPods(s, e)
  );

  const pods = query.data ?? [];

  const processedPods = useMemo(() => {
    return pods.map((p) => {
      const details = getPodDetails(p.pod_name, p.host, p.error_rate);
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
        p.pod_name.toLowerCase().includes(needle) ||
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

  // Bottom top CPU / Memory lists
  const topCpuContainers = useMemo(() => {
    return [...processedPods].sort((a, b) => b.cpu - a.cpu).slice(0, 6);
  }, [processedPods]);

  const topMemContainers = useMemo(() => {
    return [...processedPods].sort((a, b) => b.mem - a.mem).slice(0, 6);
  }, [processedPods]);

  const onOpenHost = (host: string) => {
    navigate({ to: dynamicTo(ROUTES.hostDetail.replace("$host", encodeURIComponent(host))) });
  };

  const onOpenContainer = (container: string) => {
    navigate({
      to: dynamicTo(ROUTES.containerDetail.replace("$container", encodeURIComponent(container))),
    });
  };

  const STATUS_COLOR = {
    running: "var(--ok)",
    pending: "var(--warn)",
    terminating: "var(--fg-mute)",
    crashloop: "var(--err)",
    oomkilled: "var(--err)",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Running"
          value={String(kpiStats.running)}
          subtext={`of ${processedPods.length}`}
        />
        <KpiCard
          label="Pending"
          value={String(kpiStats.pending)}
          subtext="scheduling"
          color="var(--warn-fg)"
        />
        <KpiCard
          label="CrashLoop / OOM"
          value={String(kpiStats.crashLoop)}
          subtext="needs attention"
          color="var(--err)"
        />
        <KpiCard
          label="Restarts (1h)"
          value={String(kpiStats.restarts)}
          subtext="across cluster"
          color="var(--warn-fg)"
        />
        <KpiCard
          label="CPU used"
          value={processedPods.length > 0 ? "62%" : "0%"}
          subtext="of 88 cores"
        />
        <KpiCard
          label="Mem used"
          value={processedPods.length > 0 ? "54%" : "0%"}
          subtext="of 176 GB"
        />
      </div>

      {/* Filter search bar */}
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

      {/* Containers table */}
      <div className="min-w-0">
        {filtered.length === 0 ? (
          <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted bg-card border border-border rounded-md">
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

      {/* Bottom cards grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mt-4">
        {/* Top CPU Containers */}
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-[13px] font-bold text-foreground leading-tight">
            Top CPU containers
          </div>
          <div className="text-[11.5px] text-foreground-muted mt-0.5">last 1 hour</div>
          <div className="mt-3 flex flex-col gap-1.5">
            {topCpuContainers.map((c) => (
              <button
                key={c.pod_name}
                type="button"
                onClick={() => onOpenContainer(c.pod_name)}
                className="flex items-center justify-between rounded-md p-1.5 hover:bg-muted text-left transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: STATUS_COLOR[c.status],
                      flexShrink: 0,
                    }}
                  />
                  <span className="font-mono text-[12.5px] font-medium text-foreground truncate">
                    {c.pod_name}
                  </span>
                </div>
                <span
                  className="font-mono text-[12.5px] font-semibold"
                  style={{ color: c.cpu >= 90 ? "var(--err)" : "var(--warn-fg)" }}
                >
                  {c.cpu}%
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Memory Containers */}
        <div className="rounded-md border border-border bg-card p-4">
          <div className="text-[13px] font-bold text-foreground leading-tight">
            Top memory containers
          </div>
          <div className="text-[11.5px] text-foreground-muted mt-0.5">last 1 hour</div>
          <div className="mt-3 flex flex-col gap-1.5">
            {topMemContainers.map((c) => (
              <button
                key={c.pod_name}
                type="button"
                onClick={() => onOpenContainer(c.pod_name)}
                className="flex items-center justify-between rounded-md p-1.5 hover:bg-muted text-left transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: STATUS_COLOR[c.status],
                      flexShrink: 0,
                    }}
                  />
                  <span className="font-mono text-[12.5px] font-medium text-foreground truncate">
                    {c.pod_name}
                  </span>
                </div>
                <span
                  className="font-mono text-[12.5px] font-semibold"
                  style={{ color: c.mem >= 90 ? "var(--err)" : "var(--warn-fg)" }}
                >
                  {c.mem}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
