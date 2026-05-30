import { type KpiDelta, type KpiTone, KpiCard } from "@shared/components/ui/dashboard/KpiCard";

import { fmtMs, fmtNum, fmtPct } from "../formatters";
import type { ServiceSummary } from "../hooks/useServiceSummary";

interface ServiceKpiStripProps {
  readonly summary: ServiceSummary | null;
  readonly previous: ServiceSummary | null;
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

function delta(now: number, prev: number | undefined): KpiDelta | null {
  if (prev == null || prev <= 0) return null;
  const v = ((now - prev) / prev) * 100;
  if (Math.abs(v) < 0.5) return { label: "vs prev", direction: "flat" };
  return { label: `${v > 0 ? "+" : ""}${v.toFixed(0)}%`, direction: v > 0 ? "up" : "down" };
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

export function ServiceKpiStrip({ summary, previous }: ServiceKpiStripProps) {
  const s = safeSummary(summary);
  const errorsPerSec = s.errorRate * s.rps;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard
        label="Request rate"
        value={fmtNum(s.rps)}
        secondary="rps"
        delta={delta(s.rps, previous?.rps)}
      />
      <KpiCard
        label="Error rate"
        value={fmtPct(s.errorRate, s.errorRate < 0.001 ? 3 : 2)}
        tone={errorTone(s.errorRate)}
        subtext={`${fmtNum(errorsPerSec)} errors/s`}
      />
      <KpiCard
        label="p50"
        value={fmtMs(s.p50Ms)}
        subtext={previous ? `baseline ${fmtMs(previous.p50Ms)}` : "median"}
      />
      <KpiCard
        label="p95"
        value={fmtMs(s.p95Ms)}
        subtext={previous ? `baseline ${fmtMs(previous.p95Ms)}` : "95th percentile"}
      />
      <KpiCard
        label="p99"
        value={fmtMs(s.p99Ms)}
        tone={p99Tone(s.p99Ms)}
        delta={delta(s.p99Ms, previous?.p99Ms)}
      />
    </div>
  );
}
