import { Activity, AlertOctagon, Gauge, Timer } from "lucide-react";

import type { RedSummary } from "@/features/overview/api/overviewHubApi";
import StatCard from "@shared/components/ui/cards/StatCard";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { num } from "../hooks/mappers";

interface Props {
  readonly summary: RedSummary | undefined;
  readonly loading: boolean;
}

function colorForErrorPct(pct: number): string {
  if (pct > 5) return "var(--color-error)";
  if (pct > 1) return "var(--color-warning)";
  return "var(--text-muted)";
}

export default function OverviewHero({ summary, loading }: Props) {
  const totalReq = num(summary?.total_span_count);
  const errPct = num(summary?.avg_error_pct);
  const errCount = num(summary?.total_errors);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        metric={{
          title: "Requests",
          value: loading ? "—" : formatNumber(totalReq),
          description: loading ? undefined : `${formatNumber(errCount)} errors`,
        }}
        visuals={{
          loading,
          icon: <Activity size={18} />,
          iconColor: "var(--color-primary)",
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
          icon: <AlertOctagon size={18} />,
          iconColor: colorForErrorPct(errPct),
        }}
      />
      <StatCard
        metric={{
          title: "Latency p95",
          value: loading ? "—" : formatDuration(summary?.avg_p95_ms),
          description: loading ? undefined : "across services",
        }}
        visuals={{ loading, icon: <Timer size={18} />, iconColor: "var(--text-muted)" }}
      />
      <StatCard
        metric={{
          title: "Latency p99",
          value: loading ? "—" : formatDuration(summary?.avg_p99_ms),
          description: loading ? undefined : "tail latency",
        }}
        visuals={{ loading, icon: <Gauge size={18} />, iconColor: "var(--text-muted)" }}
      />
    </div>
  );
}
