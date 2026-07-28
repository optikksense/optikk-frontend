import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { API_CONFIG } from "@config/apiConfig";
import { KpiCard } from "@shared/components/ui/cards/StatCard";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

import { ROUTES } from "@/shared/constants/routes";

import { infraGet } from "../../../api/infrastructureApi";
import { getNodes, getNodesSummary } from "../../../api/nodesApi";
import { InfraHostsFilterBar } from "../../../components/InfraHostsFilterBar";
import { InfraHostsTable } from "../../../components/InfraHostsTable";
import type { InfrastructureNode, InfrastructureNodeSummary, MetricValue } from "../../../types";

export default function HostsTab() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const query = useTimeRangeQuery<readonly InfrastructureNode[]>(
    "infrastructure.hosts.list",
    (_tenant, s, e) => getNodes(s, e)
  );

  const summaryQ = useTimeRangeQuery<InfrastructureNodeSummary>(
    "infrastructure.nodes-summary",
    (_tenant, s, e) => getNodesSummary(s, e)
  );

  const avgCpuQ = useTimeRangeQuery<MetricValue>(
    "infrastructure.kpi.cpu-avg",
    async (tenantId, start, end) => {
      if (!tenantId) return { value: 0 };
      return infraGet<MetricValue>(`${V1}/infrastructure/cpu/avg`, Number(start), Number(end));
    }
  );

  const avgMemQ = useTimeRangeQuery<MetricValue>(
    "infrastructure.kpi.memory-avg",
    async (tenantId, start, end) => {
      if (!tenantId) return { value: 0 };
      return infraGet<MetricValue>(`${V1}/infrastructure/memory/avg`, Number(start), Number(end));
    }
  );

  const nodes = query.data ?? [];
  const summary = summaryQ.data;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return nodes;

    if (needle.includes(":")) {
      const [key, val] = needle.split(":");
      const tagVal = val.trim();
      if (key === "role") {
        return nodes.filter((n) => n.services.some((s) => s.toLowerCase().includes(tagVal)));
      }
      if (key === "status") {
        return nodes.filter((n) => {
          const rate = n.errorRate;
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
    navigate({ to: ROUTES.hostDetail.replace("$host", encodeURIComponent(host as string & {})) });
  };

  const hostsCount = nodes.length;
  const totalPods = summary?.totalPods ?? 0;

  const totalHostsSummary = summary
    ? summary.healthyNodes + summary.degradedNodes + summary.unhealthyNodes
    : 0;
  const hostsUpVal = summary ? summary.healthyNodes + summary.degradedNodes : 0;

  const avgCpuVal = avgCpuQ.data
    ? `${(avgCpuQ.data.value <= 1 ? avgCpuQ.data.value * 100 : avgCpuQ.data.value).toFixed(0)}%`
    : "—";
  const avgMemVal = avgMemQ.data
    ? `${(avgMemQ.data.value <= 1 ? avgMemQ.data.value * 100 : avgMemQ.data.value).toFixed(0)}%`
    : "—";

  return (
    <div className="flex flex-col gap-4">
      {}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Hosts up"
          value={String(hostsCount || hostsUpVal)}
          subtext={totalHostsSummary > 0 ? `of ${totalHostsSummary}` : "fleet"}
        />
        <KpiCard label="Pods" value={String(totalPods)} subtext="k8s cluster" />
        <KpiCard label="Avg CPU" value={avgCpuVal} subtext="fleet" />
        <KpiCard label="Avg Mem" value={avgMemVal} subtext="fleet" />
      </div>

      {}
      <InfraHostsFilterBar hosts={nodes} value={q} onChange={setQ} />

      {}
      <div className="min-w-0">
        {filtered.length === 0 ? (
          <div className="grid h-[200px] place-items-center rounded-md border border-border bg-card text-[12px] text-foreground-muted">
            {query.isPending ? "Loading hosts…" : "No hosts match the current filter."}
          </div>
        ) : (
          <InfraHostsTable nodes={filtered} onOpenNode={onOpenNode} />
        )}
      </div>
    </div>
  );
}
