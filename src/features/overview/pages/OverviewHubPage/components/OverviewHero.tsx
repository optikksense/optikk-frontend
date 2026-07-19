import type { FleetRedMetrics } from "@/features/overview/api/overviewHubApi";
import StatCard from "@shared/components/ui/cards/StatCard";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { num } from "../hooks/mappers";

interface Props {
  readonly summary: FleetRedMetrics | undefined;
  readonly loading: boolean;
}

export default function OverviewHero({ summary, loading }: Props) {
  const totalReq = num(summary?.totalSpanCount);
  const errRate = num(summary?.avgErrorRate);
  const errCount = num(summary?.totalErrors);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        metric={{
          title: "Requests",
          value: loading ? "—" : formatNumber(totalReq),
          description: loading ? undefined : `${formatNumber(errCount)} errors`,
        }}
        visuals={{
          loading,
        }}
      />
      <StatCard
        metric={{
          title: "Error rate",
          value: loading ? "—" : formatPercentage(errRate),
          description: loading ? undefined : "of total requests",
        }}
        visuals={{
          loading,
        }}
      />
      <StatCard
        metric={{
          title: "Latency p50",
          value: loading ? "—" : formatDuration(summary?.avgP50Ms),
          description: loading ? undefined : "median latency",
        }}
        visuals={{ loading }}
      />
      <StatCard
        metric={{
          title: "Latency p95",
          value: loading ? "—" : formatDuration(summary?.avgP95Ms),
          description: loading ? undefined : "upper latency",
        }}
        visuals={{ loading }}
      />
      <StatCard
        metric={{
          title: "Latency p99",
          value: loading ? "—" : formatDuration(summary?.avgP99Ms),
          description: loading ? undefined : "tail latency",
        }}
        visuals={{ loading }}
      />
    </div>
  );
}
