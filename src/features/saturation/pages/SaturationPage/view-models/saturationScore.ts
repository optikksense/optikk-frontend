import type { DatastoreSystemRow } from "../../../api/saturationApi";

export type Tone = "ok" | "warn" | "err" | "neutral";

const P95_WARN_MS = 100;
const P95_ERR_MS = 500;
const ERROR_RATE_WARN = 0.01;
const ERROR_RATE_ERR = 0.05;

export function toneFromScore(score: number): Tone {
  if (score >= 0.85) return "err";
  if (score >= 0.7) return "warn";
  return "ok";
}

export function toneFromHealth(p95Ms: number, errorRate: number): Tone {
  if (p95Ms >= P95_ERR_MS || errorRate >= ERROR_RATE_ERR) return "err";
  if (p95Ms >= P95_WARN_MS || errorRate >= ERROR_RATE_WARN) return "warn";
  return "ok";
}

function normalize(value: number, ceiling: number): number {
  if (!Number.isFinite(value) || ceiling <= 0) return 0;
  return Math.min(1, Math.max(0, value / ceiling));
}

export function computeSystemSaturation(row: DatastoreSystemRow): number {
  const latency = normalize(row.p95_latency_ms ?? 0, P95_ERR_MS);
  const errors = normalize(row.error_rate ?? 0, ERROR_RATE_ERR);
  const load = normalize(row.active_connections ?? 0, 1_000);
  return Math.max(latency, errors, load);
}
