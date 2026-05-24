import { fmtMs, fmtNum, fmtPct } from "../formatters";
import type { ServiceSummary } from "../hooks/useServiceSummary";
import type { SloStatsResponse } from "../hooks/useSloStats";
import { KpiCard, type KpiTone } from "./KpiCard";

interface ServiceKpiStripProps {
  readonly summary: ServiceSummary | null;
  readonly slo: SloStatsResponse | undefined;
}

function errorTone(errRate: number): KpiTone {
  if (errRate >= 0.02) return "err";
  if (errRate >= 0.005) return "warn";
  return "ok";
}

function p99Tone(p99Ms: number): KpiTone {
  if (p99Ms >= 2000) return "err";
  if (p99Ms >= 1000) return "warn";
  return "ok";
}

function sloTone(budget: number | undefined): KpiTone {
  if (budget == null) return "neutral";
  if (budget < 0.25) return "err";
  if (budget < 0.5) return "warn";
  return "ok";
}

function sloBudgetLabel(slo: SloStatsResponse | undefined): string {
  if (!slo || slo.error_budget_remaining == null) return "—";
  const pct = Math.max(0, slo.error_budget_remaining * 100);
  return `${pct.toFixed(0)}%`;
}

function safeSummary(summary: ServiceSummary | null): ServiceSummary {
  return (
    summary ?? {
      serviceName: "",
      requestCount: 0,
      errorCount: 0,
      errorRate: 0,
      p50Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
      rps: 0,
    }
  );
}

export function ServiceKpiStrip({ summary, slo }: ServiceKpiStripProps) {
  const s = safeSummary(summary);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        label="Request rate"
        value={fmtNum(s.rps)}
        secondary="rps"
        subtext={`${fmtNum(s.requestCount)} requests`}
      />
      <KpiCard
        label="Error rate"
        value={fmtPct(s.errorRate, s.errorRate < 0.001 ? 3 : 2)}
        tone={errorTone(s.errorRate)}
        subtext={`${fmtNum(s.errorCount)} errors`}
      />
      <KpiCard label="p50" value={fmtMs(s.p50Ms)} subtext="median" />
      <KpiCard label="p95" value={fmtMs(s.p95Ms)} subtext="95th percentile" />
      <KpiCard
        label="p99"
        value={fmtMs(s.p99Ms)}
        tone={p99Tone(s.p99Ms)}
        subtext="99th percentile"
      />
      <KpiCard
        label="SLO budget"
        value={sloBudgetLabel(slo)}
        tone={sloTone(slo?.error_budget_remaining)}
        subtext="error-budget remaining"
      />
    </div>
  );
}
