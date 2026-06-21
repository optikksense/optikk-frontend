import type { KafkaTopology } from "@/features/saturation/api/kafkaTopologySchemas";

// Health level derived from error rate, matching the backend topology bands.
export type Level = "ok" | "warn" | "err";

const WARN_ERR = 0.01;
const CRIT_ERR = 0.05;

export function levelFromError(errorRate: number): Level {
  if (errorRate >= CRIT_ERR) return "err";
  if (errorRate >= WARN_ERR) return "warn";
  return "ok";
}

export function worst(a: Level, b: Level): Level {
  const rank: Record<Level, number> = { ok: 0, warn: 1, err: 2 };
  return rank[a] >= rank[b] ? a : b;
}

export const LEVEL_LABEL: Record<Level, string> = {
  ok: "healthy",
  warn: "degraded",
  err: "critical",
};

// Compact rate formatting (24.1k / 1.2M), mirroring the design.
export function fmtRate(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}k`;
  return `${Math.round(n)}`;
}

export function fmtPct(fraction: number): string {
  return `${(fraction * 100).toFixed(fraction >= 0.1 ? 0 : 1)}%`;
}

export interface ServiceConsume {
  topic: string;
  group: string;
  rate: number;
  error: number;
  level: Level;
}

export interface KafkaService {
  id: string;
  produces: { topic: string; rate: number }[];
  consumes: ServiceConsume[];
  status: Level;
  rate: number; // total produce + consume throughput
  errorRate: number; // worst observed
}

// deriveServices folds the topology into a client (service) roster so the
// topology map, pathways table and drawers stay in sync.
export function deriveServices(topo: KafkaTopology): KafkaService[] {
  const map = new Map<string, KafkaService>();
  const ensure = (id: string): KafkaService => {
    let s = map.get(id);
    if (!s) {
      s = { id, produces: [], consumes: [], status: "ok", rate: 0, errorRate: 0 };
      map.set(id, s);
    }
    return s;
  };

  for (const p of topo.producers) {
    const s = ensure(p.service);
    s.status = worst(s.status, levelFromError(p.error_rate));
    s.rate += p.rate_per_sec;
    s.errorRate = Math.max(s.errorRate, p.error_rate);
  }
  for (const e of topo.edges) {
    if (e.kind === "produce")
      ensure(e.source).produces.push({ topic: e.target, rate: e.rate_per_sec });
  }
  for (const pw of topo.pathways) {
    const s = ensure(pw.consumer);
    const level = levelFromError(pw.error_rate);
    s.consumes.push({
      topic: pw.topic,
      group: pw.group,
      rate: pw.consume_rate_per_sec,
      error: pw.error_rate,
      level,
    });
    s.status = worst(s.status, level);
    s.rate += pw.consume_rate_per_sec;
    s.errorRate = Math.max(s.errorRate, pw.error_rate);
  }
  return Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
}
