import { useMemo } from "react";

import type { FleetRedMetrics } from "@/features/overview/api/overviewHubApi";
import { APP_COLORS } from "@config/colorLiterals";
import StatCard from "@shared/components/ui/cards/StatCard";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { num } from "../hooks/mappers";
import type { PerformanceSeries } from "../hooks/useOverviewModel";

interface Props {
  readonly summary: FleetRedMetrics | undefined;
  readonly performance: PerformanceSeries;
  readonly loading: boolean;
}

export default function OverviewHero({ summary, performance, loading }: Props) {
  const totalReq = num(summary?.total_span_count);
  const errPct = num(summary?.avg_error_pct);
  const errCount = num(summary?.total_errors);

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
          value: loading ? "—" : formatPercentage(errPct),
          description: loading ? undefined : "of total requests",
        }}
        visuals={{
          loading,
        }}
      />
      <StatCard
        metric={{
          title: "Latency p50",
          value: loading ? "—" : formatDuration(summary?.avg_p50_ms),
          description: loading ? undefined : "median latency",
        }}
        visuals={{ loading }}
      />
      <StatCard
        metric={{
          title: "Latency p95",
          value: loading ? "—" : formatDuration(summary?.avg_p95_ms),
          description: loading ? undefined : "upper latency",
        }}
        visuals={{ loading }}
      />
      <StatCard
        metric={{
          title: "Latency p99",
          value: loading ? "—" : formatDuration(summary?.avg_p99_ms),
          description: loading ? undefined : "tail latency",
        }}
        visuals={{ loading }}
      />
    </div>
  );
}
