import { useNavigate } from "@tanstack/react-router";
import { Target } from "lucide-react";

import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getSlo } from "../../api/sloApi";

function pct(v: number): string {
  return `${v.toFixed(2)}%`;
}

function StatusBadge({ compliant }: { compliant: boolean }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
        compliant
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-red-500/15 text-red-300"
      }`}
    >
      {compliant ? "ON TRACK" : "BURNING"}
    </span>
  );
}

export default function SloListPage(): JSX.Element {
  const navigate = useNavigate();
  const sloQ = useTimeRangeQuery("slo-overview", (_t, s, e) => getSlo(Number(s), Number(e)));

  const data = sloQ.data;

  return (
    <PageShell>
      <PageHeader
        title="Service Level Objectives"
        subtitle="Availability, latency, and error budget across all services."
        icon={<Target size={24} />}
      />

      {sloQ.error ? (
        <div
          className="rounded-md border border-red-500/35 bg-red-500/10 px-3 py-2 text-red-300 text-sm"
          role="alert"
        >
          Could not load SLO data: {(sloQ.error as Error).message}
        </div>
      ) : null}

      <PageSurface elevation={1} padding="md">
        <div className="flex items-start gap-6">
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Availability
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-semibold text-[28px] tabular-nums text-[var(--text-primary)]">
                {data ? pct(data.status.availability_percent) : "—"}
              </span>
              {data ? <StatusBadge compliant={data.status.compliant} /> : null}
            </div>
            <div className="mt-1 text-[12px] text-[var(--text-muted)]">
              Target {data ? pct(data.objectives.availability_target) : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              Error budget remaining
            </div>
            <div className="mt-1 font-semibold text-[28px] tabular-nums text-[var(--text-primary)]">
              {data ? pct(data.status.error_budget_remaining_percent) : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
              p95 latency
            </div>
            <div className="mt-1 font-semibold text-[28px] tabular-nums text-[var(--text-primary)]">
              {data ? `${Math.round(data.status.p95_latency_ms)}ms` : "—"}
            </div>
            <div className="mt-1 text-[12px] text-[var(--text-muted)]">
              Target {data ? `${Math.round(data.objectives.p95_latency_target_ms)}ms` : "—"}
            </div>
          </div>
        </div>
      </PageSurface>

      <PageSurface padding="lg">
        <div className="text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          Per-service drill-in
        </div>
        <div className="mt-2 text-[12px] text-[var(--text-secondary)]">
          The current backend exposes one global SLO computation per call. To view a specific service&rsquo;s
          SLO, click into a service from the catalog or use the URL{" "}
          <code className="font-mono text-[11px]">/slos?service=&lt;name&gt;</code>.
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/slos/global" })}
          className="mt-3 rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 py-1.5 text-[12px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
        >
          Open global SLO detail
        </button>
      </PageSurface>
    </PageShell>
  );
}
