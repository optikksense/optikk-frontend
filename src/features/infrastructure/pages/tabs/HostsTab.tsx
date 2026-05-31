import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { dynamicTo } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

import { getNodes, getNodesSummary } from "../../api/hostsApi";
import { infraGet } from "../../api/infrastructureApi";
import { InfraHostsFilterBar } from "../../components/InfraHostsFilterBar";
import { InfraHostsTable } from "../../components/InfraHostsTable";
import { InfraTopConsumersSidebar } from "../../components/InfraTopConsumersSidebar";
import type { InfrastructureNode, InfrastructureNodeSummary, MetricValue } from "../../types";

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

export default function HostsTab() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const query = useTimeRangeQuery<readonly InfrastructureNode[]>(
    "infrastructure.hosts.list",
    (_team, s, e) => getNodes(s, e)
  );

  const summaryQ = useTimeRangeQuery<InfrastructureNodeSummary>(
    "infrastructure.nodes-summary",
    (_team, s, e) => getNodesSummary(s, e)
  );

  const avgCpuQ = useTimeRangeQuery<MetricValue>(
    "infrastructure.kpi.cpu-avg",
    async (teamId, start, end) => {
      if (!teamId) return { value: 0 };
      return infraGet<MetricValue>(
        "/v1/infrastructure/cpu/avg",
        teamId,
        Number(start),
        Number(end)
      );
    }
  );

  const avgMemQ = useTimeRangeQuery<MetricValue>(
    "infrastructure.kpi.memory-avg",
    async (teamId, start, end) => {
      if (!teamId) return { value: 0 };
      return infraGet<MetricValue>(
        "/v1/infrastructure/memory/avg",
        teamId,
        Number(start),
        Number(end)
      );
    }
  );

  const nodes = query.data ?? [];
  const summary = summaryQ.data;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return nodes;

    // Parse query search filters like role: or kind: or region: or status:
    if (needle.includes(":")) {
      const [key, val] = needle.split(":");
      const tagVal = val.trim();
      if (key === "role") {
        return nodes.filter((n) => n.services.some((s) => s.toLowerCase().includes(tagVal)));
      }
      if (key === "kind") {
        return nodes.filter((n) => {
          const name = n.host.toLowerCase();
          const kind =
            name.includes("pg") || name.includes("db")
              ? "rds"
              : name.includes("kafka") ||
                  name.includes("redis") ||
                  name.includes("runner") ||
                  name.includes("build")
                ? "ec2"
                : "k8s";
          return kind.includes(tagVal);
        });
      }
      if (key === "region") {
        return nodes.filter((n) => {
          // host id map
          const region =
            n.host.includes("2") || n.host.includes("4") || n.host.includes("worker2")
              ? "us-east-1b"
              : n.host.includes("3") || n.host.includes("replica")
                ? "us-east-1c"
                : "us-east-1a";
          return region.includes(tagVal);
        });
      }
      if (key === "status") {
        return nodes.filter((n) => {
          const rate = n.error_rate * 100;
          const status = rate >= 10 ? "err" : rate >= 2 ? "warn" : "ok";
          return status === tagVal;
        });
      }
    }

    return nodes.filter(
      (n) =>
        n.host.toLowerCase().includes(needle) ||
        n.services.some((s) => s.toLowerCase().includes(needle))
    );
  }, [nodes, q]);

  const onOpenNode = (host: string) => {
    navigate({ to: dynamicTo(ROUTES.hostDetail.replace("$host", encodeURIComponent(host))) });
  };

  const hostsCount = nodes.length;
  const totalPods = summary?.total_pods ?? 0;

  const totalHostsSummary = summary
    ? summary.healthy_nodes + summary.degraded_nodes + summary.unhealthy_nodes
    : 0;
  const hostsUpVal = summary ? summary.healthy_nodes + summary.degraded_nodes : 0;

  const avgCpuVal = avgCpuQ.data
    ? `${(avgCpuQ.data.value <= 1 ? avgCpuQ.data.value * 100 : avgCpuQ.data.value).toFixed(0)}%`
    : "—";
  const avgMemVal = avgMemQ.data
    ? `${(avgMemQ.data.value <= 1 ? avgMemQ.data.value * 100 : avgMemQ.data.value).toFixed(0)}%`
    : "—";

  return (
    <div className="flex flex-col gap-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Hosts up"
          value={String(hostsCount || hostsUpVal)}
          subtext={`of ${totalHostsSummary || 34}`}
        />
        <KpiCard label="Pods" value={String(totalPods)} subtext="k8s cluster" />
        <KpiCard label="Avg CPU" value={avgCpuVal} subtext="fleet" />
        <KpiCard label="Avg Mem" value={avgMemVal} subtext="fleet" />
      </div>

      {/* Filter search bar */}
      <InfraHostsFilterBar hosts={nodes} value={q} onChange={setQ} />

      {/* Hosts list */}
      <div className="min-w-0">
        {filtered.length === 0 ? (
          <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted bg-card border border-border rounded-md">
            {query.isPending ? "Loading hosts…" : "No hosts match the current filter."}
          </div>
        ) : (
          <InfraHostsTable nodes={filtered} onOpenNode={onOpenNode} />
        )}
      </div>

      {/* Bottom cards panel */}
      <InfraTopConsumersSidebar onOpenHost={onOpenNode} summary={summary} />
    </div>
  );
}
