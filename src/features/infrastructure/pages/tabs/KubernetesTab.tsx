import { useMemo } from "react";

import { CHART_COLORS } from "@config/constants";
import { Card } from "@shared/components/primitives/ui";
import DonutChart from "@shared/components/ui/charts/micro/DonutChart";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatBytes, formatNumber } from "@shared/utils/formatters";

import { infraGet } from "../../api/infrastructureApi";
import InfraMultiSeriesChart from "../../components/InfraMultiSeriesChart";
import type { NodeAllocatable, PhaseStat } from "../../types";
import { PodRestartsTable, ReplicaSetsTable } from "./KubernetesTables";

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
            formatType="bytes"
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
        <Card padding="md" className="min-h-[280px] border-[var(--border-color)]">
          <InfraMultiSeriesChart
            queryKey="infra-k8s-volume-usage"
            endpoint="/v1/infrastructure/kubernetes/volume-usage"
            title="Volume usage"
            groupByField="volume"
            valueField="value"
            formatType="bytes"
          />
        </Card>
      </div>

      <PodRestartsTable />
      <ReplicaSetsTable />
    </div>
  );
}
