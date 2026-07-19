import { KpiCard, type KpiTone } from "@shared/components/ui/dashboard/KpiCard";
import { fmtMs, fmtNum, fmtPct } from "@shared/utils/metricFormatters";
import type { ServiceSummary } from "../hooks/useServiceSummary";

interface ServiceKpiStripProps {
  readonly serviceName: string;
  readonly summary: ServiceSummary | null;
}

function errorTone(errRate: number): KpiTone {
  if (errRate >= 2) return "err";
  if (errRate >= 0.5) return "warn";
  return "ok";
}

function p99Tone(p99Ms: number): KpiTone {
  if (p99Ms >= 2000) return "err";
  if (p99Ms >= 1000) return "warn";
  return "ok";
}

function saturationTone(sat: number): KpiTone {
  if (sat >= 85) return "err";
  if (sat >= 70) return "warn";
  return "ok";
}

function safeSummary(summary: ServiceSummary | null, serviceName: string): ServiceSummary {
  return (
    summary ?? {
      serviceName,
      requestCount: 0,
      errorCount: 0,
      errorRate: 0,
      p50Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
      rps: 0,
      cpuUtilization: 0,
      memoryUtilization: 0,
      diskUtilization: 0,
    }
  );
}

export function ServiceKpiStrip({ serviceName, summary }: ServiceKpiStripProps) {
  const s = safeSummary(summary, serviceName);
  const errorsPerSec = (s.errorRate / 100) * s.rps;
  const satVal = Math.max(s.cpuUtilization, s.memoryUtilization, s.diskUtilization);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Requests"
        value={fmtNum(s.requestCount)}
        secondary="req"
        subtext={`${s.rps >= 1 ? fmtNum(s.rps) : s.rps.toFixed(2)} rps`}
      />
      <KpiCard
        label="Error rate"
        value={fmtPct(s.errorRate, s.errorRate < 0.1 ? 3 : 2)}
        tone={errorTone(s.errorRate)}
        subtext={`${fmtNum(errorsPerSec)} errors/s`}
      />
      <KpiCard
        label="p99 Latency"
        value={fmtMs(s.p99Ms)}
        tone={p99Tone(s.p99Ms)}
      />
      <KpiCard
        label="Saturation"
        value={fmtPct(satVal / 100, 1)}
        tone={saturationTone(satVal)}
      />
    </div>
  );
}
