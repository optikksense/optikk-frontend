import type { ServiceLatestDeployment } from "@/features/overview/api/deploymentsApi";
import type {
  RedServiceRow,
  RedSummary,
  RequestRatePoint,
  SloRow,
} from "@/features/services/api/serviceCatalogApi";

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
  readonly lastDeployedAt: string | null;
  readonly slo: SloRow | null;
}

function classifyStatus(errorRate: number, p99Ms: number): CatalogStatus {
  if (errorRate >= 0.02 || p99Ms >= 2000) return "error";
  if (errorRate >= 0.005 || p99Ms >= 1000) return "warn";
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
    const list = grouped.get(p.service_name) ?? [];
    list.push({ t: ts, v: p.rps });
    grouped.set(p.service_name, list);
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

function bySloService(slos: SloRow[]): Map<string, SloRow> {
  const m = new Map<string, SloRow>();
  for (const s of slos) m.set(s.service_name, s);
  return m;
}

function byLatestDeploy(latest: ServiceLatestDeployment[]): Map<string, ServiceLatestDeployment> {
  const m = new Map<string, ServiceLatestDeployment>();
  for (const d of latest) m.set(d.service_name, d);
  return m;
}

function byPrevP99(prev: RedSummary | undefined): Map<string, number> {
  const m = new Map<string, number>();
  if (!prev) return m;
  for (const row of prev.services ?? []) m.set(row.service_name, row.p99_latency);
  return m;
}

export interface BuildCatalogInputs {
  readonly primary: RedSummary;
  readonly comparison?: RedSummary;
  readonly rateSeries: RequestRatePoint[];
  readonly slos: SloRow[];
  readonly latestDeploys: ServiceLatestDeployment[];
  readonly windowSec: number;
}

export function buildCatalogRow(
  row: RedServiceRow,
  windowSec: number,
  spark: Map<string, number[]>,
  sloByName: Map<string, SloRow>,
  deployByName: Map<string, ServiceLatestDeployment>,
  prevP99: Map<string, number>
): CatalogRow {
  const deploy = deployByName.get(row.service_name);
  return {
    serviceName: row.service_name,
    requestCount: row.request_count,
    errorCount: row.error_count,
    errorRate: row.request_count > 0 ? row.error_count / row.request_count : 0,
    rps: windowSec > 0 ? row.request_count / windowSec : 0,
    p50Ms: row.avg_latency,
    p95Ms: row.p95_latency,
    p99Ms: row.p99_latency,
    p99DeltaPct: deltaPct(row.p99_latency, prevP99.get(row.service_name)),
    status: classifyStatus(
      row.request_count > 0 ? row.error_count / row.request_count : 0,
      row.p99_latency
    ),
    sparkline: spark.get(row.service_name) ?? [],
    version: deploy?.version ?? "—",
    environment: deploy?.environment ?? "—",
    lastDeployedAt: deploy?.deployed_at ?? null,
    slo: sloByName.get(row.service_name) ?? null,
  };
}

export function buildCatalogRows(inputs: BuildCatalogInputs): CatalogRow[] {
  const spark = bySparkline(inputs.rateSeries);
  const sloByName = bySloService(inputs.slos);
  const deployByName = byLatestDeploy(inputs.latestDeploys);
  const prevP99 = byPrevP99(inputs.comparison);
  return (inputs.primary.services ?? []).map((row) =>
    buildCatalogRow(row, inputs.windowSec, spark, sloByName, deployByName, prevP99)
  );
}
