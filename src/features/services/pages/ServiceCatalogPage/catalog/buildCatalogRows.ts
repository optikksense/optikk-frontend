import type {
  RedServiceRow,
  RequestRatePoint,
  ServiceCatalogRedSummary,
} from "@shared/api/red/redApi";

export type CatalogStatus = "healthy" | "warn" | "error" | "unknown";

export interface CatalogRow {
  readonly serviceName: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly rps: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
  readonly p99DeltaPct: number | null;
  readonly status: CatalogStatus;
  readonly sparkline: number[];
  readonly version: string;
  readonly environment: string;
  readonly tier: string;
  readonly tenant: string;
  readonly lang: string;
  readonly instances: number | null;
}

function classifyStatus(errorRate: number, p99Ms: number): CatalogStatus {
  if (errorRate >= 2 || p99Ms >= 2000) return "error";
  if (errorRate >= 0.5 || p99Ms >= 1000) return "warn";
  return "healthy";
}

function deltaPct(now: number, prev: number | undefined): number | null {
  if (prev == null || prev === 0) return null;
  return (now - prev) / prev;
}

function bySparkline(points: RequestRatePoint[]): Map<string, number[]> {
  const grouped = new Map<string, Array<{ t: number; v: number }>>();
  for (const p of points) {
    const ts = new Date(p.timestamp).getTime();
    if (!Number.isFinite(ts)) continue;
    const list = grouped.get(p.serviceName) ?? [];
    list.push({ t: ts, v: p.rps });
    grouped.set(p.serviceName, list);
  }
  const out = new Map<string, number[]>();
  for (const [name, list] of grouped) {
    list.sort((a, b) => a.t - b.t);
    out.set(
      name,
      list.map((x) => x.v)
    );
  }
  return out;
}

function byPrevP99(prev: ServiceCatalogRedSummary | undefined): Map<string, number> {
  const m = new Map<string, number>();
  if (!prev) return m;
  for (const row of prev.services ?? []) m.set(row.serviceName, row.p99Latency);
  return m;
}

export interface BuildCatalogInputs {
  readonly primary: ServiceCatalogRedSummary;
  readonly comparison?: ServiceCatalogRedSummary;
  readonly rateSeries: RequestRatePoint[];
  readonly windowSec: number;
}

function buildCatalogRow(
  row: RedServiceRow,
  windowSec: number,
  spark: Map<string, number[]>,
  prevP99: Map<string, number>
): CatalogRow {
  const errorRate = row.requestCount > 0 ? (row.errorCount * 100) / row.requestCount : 0;

  return {
    serviceName: row.serviceName,
    requestCount: row.requestCount,
    errorCount: row.errorCount,
    errorRate,
    rps: windowSec > 0 ? row.requestCount / windowSec : 0,
    p50Ms: row.avgLatency,
    p95Ms: row.p95Latency,
    p99Ms: row.p99Latency,
    p99DeltaPct: deltaPct(row.p99Latency, prevP99.get(row.serviceName)),
    status: classifyStatus(errorRate, row.p99Latency),
    sparkline: spark.get(row.serviceName) ?? [],
    version: "—",
    environment: "—",
    tier: "—",
    tenant: "—",
    lang: "—",
    instances: null,
  };
}

export function buildCatalogRows(inputs: BuildCatalogInputs): CatalogRow[] {
  const spark = bySparkline(inputs.rateSeries);
  const prevP99 = byPrevP99(inputs.comparison);
  return (inputs.primary.services ?? []).map((row) =>
    buildCatalogRow(row, inputs.windowSec, spark, prevP99)
  );
}
