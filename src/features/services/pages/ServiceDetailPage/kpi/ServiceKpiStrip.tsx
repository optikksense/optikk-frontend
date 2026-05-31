import { SparklineCell } from "@/features/services/pages/ServiceCatalogPage/catalog/SparklineCell";
import { KpiCard, type KpiDelta, type KpiTone } from "@shared/components/ui/dashboard/KpiCard";
import { useMemo } from "react";
import { fmtMs, fmtNum, fmtPct } from "../formatters";
import { useLatencyPercentiles } from "../hooks/useLatencyPercentiles";
import { useServiceSaturation } from "../hooks/useServiceSaturation";
import type { ServiceSummary } from "../hooks/useServiceSummary";
import { useStatusTimeseries } from "../hooks/useStatusTimeseries";

interface ServiceKpiStripProps {
  readonly serviceName: string;
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

function saturationTone(sat: number): KpiTone {
  if (sat >= 85) return "err";
  if (sat >= 70) return "warn";
  return "ok";
}

function delta(now: number, prev: number | undefined): KpiDelta | null {
  if (prev == null || prev <= 0) return null;
  const v = ((now - prev) / prev) * 100;
  if (Math.abs(v) < 0.5) return { label: "vs prev", direction: "flat" };
  return { label: `${v > 0 ? "+" : ""}${v.toFixed(0)}%`, direction: v > 0 ? "up" : "down" };
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

export function ServiceKpiStrip({ serviceName, summary, previous }: ServiceKpiStripProps) {
  const s = safeSummary(summary, serviceName);
  const errorsPerSec = s.errorRate * s.rps;

  const satVal = Math.max(s.cpuUtilization, s.memoryUtilization, s.diskUtilization);
  const prevSatVal = previous
    ? Math.max(previous.cpuUtilization, previous.memoryUtilization, previous.diskUtilization)
    : undefined;

  // Fetch timeseries for sparklines
  const statusQ = useStatusTimeseries(s.serviceName);
  const latencyQ = useLatencyPercentiles(s.serviceName);
  const saturationQ = useServiceSaturation(s.serviceName);

  const reqSpark = useMemo(() => {
    return (
      statusQ.data?.map((pt) => pt.status_2xx + pt.status_4xx + pt.status_5xx + pt.status_other) ??
      []
    );
  }, [statusQ.data]);

  const errSpark = useMemo(() => {
    return (
      statusQ.data?.map((pt) => {
        const total = pt.status_2xx + pt.status_4xx + pt.status_5xx + pt.status_other;
        return total > 0 ? (pt.status_5xx / total) * 100 : 0;
      }) ?? []
    );
  }, [statusQ.data]);

  const latSpark = useMemo(() => {
    return latencyQ.data?.map((pt) => pt.p99_ms) ?? [];
  }, [latencyQ.data]);

  const satSpark = useMemo(() => {
    return saturationQ.data?.map((pt) => pt.value) ?? [];
  }, [saturationQ.data]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Requests"
        value={fmtNum(s.rps)}
        secondary="rps"
        delta={delta(s.rps, previous?.rps)}
        sparkline={<SparklineCell values={reqSpark} tone="info" width={80} height={24} />}
      />
      <KpiCard
        label="Error rate"
        value={fmtPct(s.errorRate, s.errorRate < 0.001 ? 3 : 2)}
        tone={errorTone(s.errorRate)}
        subtext={`${fmtNum(errorsPerSec)} errors/s`}
        sparkline={
          <SparklineCell
            values={errSpark}
            tone={s.errorRate >= 0.02 ? "err" : s.errorRate >= 0.005 ? "warn" : "info"}
            width={80}
            height={24}
          />
        }
      />
      <KpiCard
        label="p99 Latency"
        value={fmtMs(s.p99Ms)}
        tone={p99Tone(s.p99Ms)}
        delta={delta(s.p99Ms, previous?.p99Ms)}
        sparkline={
          <SparklineCell
            values={latSpark}
            tone={s.p99Ms >= 2000 ? "err" : s.p99Ms >= 1000 ? "warn" : "info"}
            width={80}
            height={24}
          />
        }
      />
      <KpiCard
        label="Saturation"
        value={fmtPct(satVal / 100, 1)}
        tone={saturationTone(satVal)}
        delta={delta(satVal, prevSatVal)}
        sparkline={
          <SparklineCell
            values={satSpark}
            tone={satVal >= 85 ? "err" : satVal >= 70 ? "warn" : "info"}
            width={80}
            height={24}
          />
        }
      />
    </div>
  );
}
