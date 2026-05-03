import { useParams } from "@tanstack/react-router";
import { Target } from "lucide-react";

import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getBurnDown, getBurnRate, getSloStats } from "../../api/sloApi";

function pct(v: number | undefined): string {
  return v == null ? "—" : `${v.toFixed(2)}%`;
}

function fmtMs(v: number | undefined): string {
  if (v == null) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className="mt-1 font-semibold text-[20px] tabular-nums text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}

function BurnRatePanel({
  fast,
  slow,
  fastWindow,
  slowWindow,
  budget,
}: {
  fast?: number;
  slow?: number;
  fastWindow?: string;
  slowWindow?: string;
  budget?: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatTile label={`Fast burn (${fastWindow ?? "5m"})`} value={fast?.toFixed(3) ?? "—"} />
      <StatTile label={`Slow burn (${slowWindow ?? "1h"})`} value={slow?.toFixed(3) ?? "—"} />
      <StatTile label="Budget remaining" value={pct(budget)} />
    </div>
  );
}

export default function SloDetailPage(): JSX.Element {
  const params = useParams({ strict: false });
  const sloId = typeof params.sloId === "string" ? params.sloId : "global";
  const serviceName = sloId === "global" ? undefined : decodeURIComponent(sloId);

  const statsQ = useTimeRangeQuery(`slo-stats-${sloId}`, (_t, s, e) =>
    getSloStats(Number(s), Number(e), serviceName ? { serviceName } : undefined)
  );
  const burnDownQ = useTimeRangeQuery(`slo-burn-down-${sloId}`, (_t, s, e) =>
    getBurnDown(Number(s), Number(e), serviceName ? { serviceName } : undefined)
  );
  const burnRateQ = useTimeRangeQuery(`slo-burn-rate-${sloId}`, (_t, s, e) =>
    getBurnRate(Number(s), Number(e), serviceName ? { serviceName } : undefined)
  );

  const stats = statsQ.data;
  const burnRate = burnRateQ.data;

  return (
    <PageShell>
      <PageHeader
        title={serviceName ?? "Global SLO"}
        subtitle={
          serviceName
            ? `Service Level Objective tracking for ${serviceName}`
            : "Aggregate SLO across all services"
        }
        icon={<Target size={24} />}
      />

      <PageSurface elevation={1} padding="md">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatTile label="Availability" value={pct(stats?.status.availability_percent)} />
          <StatTile
            label="Error budget"
            value={pct(stats?.status.error_budget_remaining_percent)}
          />
          <StatTile label="p95 latency" value={fmtMs(stats?.status.p95_latency_ms)} />
          <StatTile label="Avg latency" value={fmtMs(stats?.summary.avg_latency_ms)} />
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        <div className="mb-2 text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          Burn rate
        </div>
        <BurnRatePanel
          fast={burnRate?.fast_burn_rate}
          slow={burnRate?.slow_burn_rate}
          fastWindow={burnRate?.fast_window}
          slowWindow={burnRate?.slow_window}
          budget={burnRate?.budget_remaining_pct}
        />
      </PageSurface>

      <PageSurface padding="lg">
        <div className="mb-2 text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          Burn down
        </div>
        {burnDownQ.isPending ? (
          <div className="text-[12px] text-[var(--text-muted)]">Loading…</div>
        ) : (burnDownQ.data ?? []).length === 0 ? (
          <div className="text-[12px] text-[var(--text-muted)]">No burn-down data.</div>
        ) : (
          <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap text-[11px] text-[var(--text-secondary)]">
            {JSON.stringify(burnDownQ.data?.slice(-10), null, 2)}
          </pre>
        )}
        <div className="mt-2 text-[11px] text-[var(--text-muted)]">
          Phase 2 will replace this raw view with a UPlotChart of error_budget_remaining_pct over
          time. Data is live; only the visualization is pending.
        </div>
      </PageSurface>
    </PageShell>
  );
}
