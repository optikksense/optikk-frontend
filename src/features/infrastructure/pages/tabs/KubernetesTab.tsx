import { useMemo } from "react";

import { CHART_COLORS } from "@config/constants";
import { Card } from "@shared/components/primitives/ui";
import DonutChart from "@shared/components/ui/charts/micro/DonutChart";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatBytes, formatNumber } from "@shared/utils/formatters";

import { infraGet } from "../../api/infrastructureApi";
import InfraMultiSeriesChart from "../../components/InfraMultiSeriesChart";
import type { K8sPodRestartRow, NodeAllocatable, PhaseStat, ReplicaStat } from "../../types";

export default function KubernetesTab() {
  const allocQuery = useTimeRangeQuery<NodeAllocatable>(
    "infra-k8s-alloc",
    async (teamId, start, end) => {
      if (!teamId) return { cpu_cores: 0, memory_bytes: 0 };
      return infraGet<NodeAllocatable>(
        "/v1/infrastructure/kubernetes/node-allocatable",
        teamId,
        Number(start),
        Number(end)
      );
    }
  );

  const phasesQuery = useTimeRangeQuery<PhaseStat[]>(
    "infra-k8s-phases",
    async (teamId, start, end) => {
      if (!teamId) return [];
      const data = await infraGet<PhaseStat[]>(
        "/v1/infrastructure/kubernetes/pod-phases",
        teamId,
        Number(start),
        Number(end)
      );
      return Array.isArray(data) ? data : [];
    }
  );

  const replicaQuery = useTimeRangeQuery<ReplicaStat[]>(
    "infra-k8s-replica",
    async (teamId, start, end) => {
      if (!teamId) return [];
      const data = await infraGet<ReplicaStat[]>(
        "/v1/infrastructure/kubernetes/replica-status",
        teamId,
        Number(start),
        Number(end)
      );
      return Array.isArray(data) ? data : [];
    }
  );

  const restartsQuery = useTimeRangeQuery<K8sPodRestartRow[]>(
    "infra-k8s-restarts-table",
    async (teamId, start, end) => {
      if (!teamId) return [];
      const data = await infraGet<K8sPodRestartRow[]>(
        "/v1/infrastructure/kubernetes/pod-restarts",
        teamId,
        Number(start),
        Number(end)
      );
      return Array.isArray(data) ? data : [];
    }
  );

  const donutSegments = useMemo(() => {
    const rows = phasesQuery.data ?? [];
    return rows.map((r, i) => ({
      label: r.phase || "unknown",
      value: Number(r.count) || 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [phasesQuery.data]);

  const alloc = allocQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Allocatable CPU (cores)
          </div>
          <div className="mt-1 font-semibold text-[26px] text-[var(--text-primary)]">
            {formatNumber(alloc?.cpu_cores ?? 0)}
          </div>
        </Card>
        <Card padding="md" className="border-[var(--border-color)]">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Allocatable memory
          </div>
          <div className="mt-1 font-semibold text-[26px] text-[var(--text-primary)]">
            {formatBytes(alloc?.memory_bytes ?? 0)}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card padding="md" className="flex flex-col items-center border-[var(--border-color)]">
          <div className="mb-2 font-medium text-[13px] text-[var(--text-primary)]">Pod phases</div>
          <DonutChart segments={donutSegments} size={200} centerLabel="Pods" />
        </Card>
        <Card padding="md" className="min-h-[300px] border-[var(--border-color)] lg:col-span-2">
          <InfraMultiSeriesChart
            queryKey="infra-k8s-container-cpu"
            endpoint="/v1/infrastructure/kubernetes/container-cpu"
            title="Container CPU"
            groupByField="container"
            valueField="value"
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-k8s-throttle"
            endpoint="/v1/infrastructure/kubernetes/cpu-throttling"
            title="CPU throttling"
            groupByField="container"
            valueField="value"
          />
        </Card>
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-k8s-cont-mem"
            endpoint="/v1/infrastructure/kubernetes/container-memory"
            title="Container memory"
            groupByField="container"
            valueField="value"
          />
        </Card>
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-k8s-oom"
            endpoint="/v1/infrastructure/kubernetes/oom-kills"
            title="OOM kills"
            groupByField="container"
            valueField="value"
          />
        </Card>
      </div>

      <Card padding="md" className="border-[var(--border-color)]">
        <div className="mb-3 font-medium text-[13px] text-[var(--text-primary)]">
          Pod restarts (top)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-[var(--border-color)] border-b text-[var(--text-muted)]">
                <th className="py-2 pr-4">Namespace</th>
                <th className="py-2 pr-4">Pod</th>
                <th className="py-2">Restarts</th>
              </tr>
            </thead>
            <tbody>
              {(restartsQuery.data ?? []).map((r) => (
                <tr
                  key={`${r.namespace}/${r.pod_name}`}
                  className="border-[var(--border-color)] border-b"
                >
                  <td className="py-2 pr-4 font-mono text-[var(--text-secondary)]">
                    {r.namespace}
                  </td>
                  <td className="py-2 pr-4 font-mono text-[var(--text-primary)]">{r.pod_name}</td>
                  <td className="py-2">{formatNumber(r.restarts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {restartsQuery.data?.length === 0 ? (
            <div className="py-6 text-center text-[var(--text-muted)]">No restart data</div>
          ) : null}
        </div>
      </Card>

      <Card padding="md" className="border-[var(--border-color)]">
        <div className="mb-3 font-medium text-[13px] text-[var(--text-primary)]">Replica sets</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-[var(--border-color)] border-b text-[var(--text-muted)]">
                <th className="py-2 pr-4">Replica set</th>
                <th className="py-2 pr-4">Desired</th>
                <th className="py-2">Available</th>
              </tr>
            </thead>
            <tbody>
              {(replicaQuery.data ?? []).map((r) => (
                <tr key={r.replica_set} className="border-[var(--border-color)] border-b">
                  <td className="py-2 pr-4 font-mono text-[var(--text-primary)]">
                    {r.replica_set}
                  </td>
                  <td className="py-2 pr-4">{formatNumber(r.desired)}</td>
                  <td className="py-2">{formatNumber(r.available)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {replicaQuery.data?.length === 0 ? (
            <div className="py-6 text-center text-[var(--text-muted)]">No replica data</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
