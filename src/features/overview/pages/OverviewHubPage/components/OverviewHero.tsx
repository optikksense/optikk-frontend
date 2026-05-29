import { Activity, AlertOctagon, Gauge, Smile } from "lucide-react";

import type { RedSummary } from "@/features/overview/api/overviewHubApi";
import StatCard from "@shared/components/ui/cards/StatCard";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { num } from "../hooks/mappers";

interface Props {
  readonly summary: RedSummary | undefined;
  readonly apdex: number | null | undefined;
  readonly loading: boolean;
}

function colorForErrorPct(pct: number): string {
  if (pct > 5) return "var(--color-error)";
  if (pct > 1) return "var(--color-warning)";
  return "var(--text-muted)";
}

// Apdex bands: ≥0.94 excellent, ≥0.85 good, ≥0.7 fair, else poor.
function colorForApdex(score: number): string {
  if (score >= 0.94) return "var(--color-healthy)";
  if (score >= 0.7) return "var(--color-warning)";
  return "var(--color-error)";
}

export default function OverviewHero({ summary, apdex, loading }: Props) {
  const totalReq = num(summary?.total_span_count);
  const errPct = num(summary?.avg_error_pct);
  const errCount = num(summary?.total_errors);
  const hasApdex = apdex !== null && apdex !== undefined;

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
          title: "Latency p99",
          value: loading ? "—" : formatDuration(summary?.avg_p99_ms),
          description: loading ? undefined : "tail latency",
        }}
        visuals={{ loading, icon: <Gauge size={18} />, iconColor: "var(--text-muted)" }}
      />
      <StatCard
        metric={{
          title: "Apdex",
          value: loading || !hasApdex ? "—" : apdex.toFixed(2),
          description: loading ? undefined : "satisfaction (300ms / 1.2s)",
        }}
        visuals={{
          loading,
          icon: <Smile size={18} />,
          iconColor: hasApdex ? colorForApdex(apdex) : "var(--text-muted)",
        }}
      />
    </div>
  );
}
