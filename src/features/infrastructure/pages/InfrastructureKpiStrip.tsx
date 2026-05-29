import { KpiCard, type KpiTone } from "@shared/components/ui/dashboard/KpiCard";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { infraGet } from "../api/infrastructureApi";
import type { InfrastructureNodeSummary, MetricValue } from "../types";

interface InfrastructureKpiStripProps {
  readonly summary: InfrastructureNodeSummary | undefined;
}

function totalNodes(summary: InfrastructureNodeSummary): number {
  return summary.healthy_nodes + summary.degraded_nodes + summary.unhealthy_nodes;
}

function usageTone(value: number): KpiTone {
  if (value >= 90) return "err";
  if (value >= 75) return "warn";
  return "ok";
}

function alertTone(count: number): KpiTone {
  if (count >= 5) return "err";
  if (count > 0) return "warn";
  return "ok";
}

function normalizePercent(raw: number | undefined): number | null {
  if (raw == null || !Number.isFinite(raw)) return null;
  return raw <= 1 ? raw * 100 : raw;
}

function useAvgMetricPercent(queryKey: string, endpoint: string): number | null {
  const query = useTimeRangeQuery<MetricValue>(queryKey, async (teamId, start, end) => {
    if (!teamId) return { value: 0 };
    return infraGet<MetricValue>(endpoint, teamId, Number(start), Number(end));
  });
  return normalizePercent(query.data?.value);
}

function MetricKpi({ label, value }: { label: string; value: number | null }) {
  return (
    <KpiCard
      label={label}
      value={value != null ? `${value.toFixed(0)}%` : "—"}
      tone={value != null ? usageTone(value) : "neutral"}
      subtext="fleet"
    />
  );
}

export function InfrastructureKpiStrip({ summary }: InfrastructureKpiStripProps) {
  const avgCpu = useAvgMetricPercent("infrastructure.kpi.cpu-avg", "/v1/infrastructure/cpu/avg");
  const avgMemory = useAvgMetricPercent(
    "infrastructure.kpi.memory-avg",
    "/v1/infrastructure/memory/avg"
  );
  const avgDisk = useAvgMetricPercent("infrastructure.kpi.disk-avg", "/v1/infrastructure/disk/avg");
  const total = summary ? totalNodes(summary) : 0;
  const hostsUp = summary ? summary.healthy_nodes + summary.degraded_nodes : 0;
  const inAlert = summary?.unhealthy_nodes ?? 0;
  const pods = summary?.total_pods ?? 0;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        label="Hosts up"
        value={String(hostsUp)}
        secondary={`of ${total}`}
        subtext="healthy + degraded"
      />
      <KpiCard
        label="In alert"
        value={String(inAlert)}
        tone={alertTone(inAlert)}
        subtext="unhealthy nodes"
      />
      <KpiCard label="Pods" value={String(pods)} subtext="k8s + spans" />
      <MetricKpi label="Avg CPU" value={avgCpu} />
      <MetricKpi label="Avg Memory" value={avgMemory} />
      <MetricKpi label="Avg Disk" value={avgDisk} />
    </div>
  );
}
