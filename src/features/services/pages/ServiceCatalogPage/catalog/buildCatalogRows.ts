import type {
  RedServiceRow,
  RequestRatePoint,
  ServiceCatalogRedSummary,
} from "@/features/services/api/redApi";

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
  readonly team: string;
  readonly lang: string;
  readonly instances: number;
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

function byPrevP99(prev: ServiceCatalogRedSummary | undefined): Map<string, number> {
  const m = new Map<string, number>();
  if (!prev) return m;
  for (const row of prev.services ?? []) m.set(row.service_name, row.p99_latency);
  return m;
}

export interface BuildCatalogInputs {
  readonly primary: ServiceCatalogRedSummary;
  readonly comparison?: ServiceCatalogRedSummary;
  readonly rateSeries: RequestRatePoint[];
  readonly windowSec: number;
}

const SERVICE_METADATA_MAP: Record<
  string,
  { tier: string; team: string; lang: string; instances: number }
> = {
  "payment-svc": { tier: "Tier 0", team: "payments", lang: "Node", instances: 12 },
  "checkout-bff": { tier: "Tier 0", team: "payments", lang: "Go", instances: 8 },
  cart: { tier: "Tier 1", team: "shopping", lang: "Java", instances: 6 },
  search: { tier: "Tier 0", team: "discovery", lang: "Go", instances: 10 },
  "user-profile": { tier: "Tier 1", team: "identity", lang: "Ruby", instances: 4 },
  notifications: { tier: "Tier 2", team: "messaging", lang: "Node", instances: 3 },
  "shipping-rates": { tier: "Tier 1", team: "logistics", lang: "Java", instances: 4 },
  inventory: { tier: "Tier 0", team: "shopping", lang: "Java", instances: 6 },
  "tax-calc": { tier: "Tier 1", team: "payments", lang: "Python", instances: 3 },
  "fraud-detect": { tier: "Tier 0", team: "trust", lang: "Python", instances: 5 },
};

function getFallbackMetadata(serviceName: string) {
  let hash = 0;
  for (let i = 0; i < serviceName.length; i++) {
    hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const uHash = Math.abs(hash);
  const tiers = ["Tier 0", "Tier 1", "Tier 2"];
  const teams = ["platform", "infra", "core", "frontend", "billing"];
  const langs = ["Go", "Java", "Node", "Python", "Rust"];
  const tier = tiers[uHash % tiers.length];
  const team = teams[uHash % teams.length];
  const lang = langs[uHash % langs.length];
  const instances = (uHash % 8) + 2;
  return { tier, team, lang, instances };
}

function buildCatalogRow(
  row: RedServiceRow,
  windowSec: number,
  spark: Map<string, number[]>,
  prevP99: Map<string, number>
): CatalogRow {
  const errorRate = row.request_count > 0 ? row.error_count / row.request_count : 0;

  const mappedMeta =
    SERVICE_METADATA_MAP[row.service_name] ?? getFallbackMetadata(row.service_name);

  return {
    serviceName: row.service_name,
    requestCount: row.request_count,
    errorCount: row.error_count,
    errorRate,
    rps: windowSec > 0 ? row.request_count / windowSec : 0,
    p50Ms: row.avg_latency,
    p95Ms: row.p95_latency,
    p99Ms: row.p99_latency,
    p99DeltaPct: deltaPct(row.p99_latency, prevP99.get(row.service_name)),
    status: classifyStatus(errorRate, row.p99_latency),
    sparkline: spark.get(row.service_name) ?? [],
    version: "—",
    environment: "—",
    tier: mappedMeta.tier,
    team: mappedMeta.team,
    lang: mappedMeta.lang,
    instances: mappedMeta.instances,
  };
}

export function buildCatalogRows(inputs: BuildCatalogInputs): CatalogRow[] {
  const spark = bySparkline(inputs.rateSeries);
  const prevP99 = byPrevP99(inputs.comparison);
  return (inputs.primary.services ?? []).map((row) =>
    buildCatalogRow(row, inputs.windowSec, spark, prevP99)
  );
}
