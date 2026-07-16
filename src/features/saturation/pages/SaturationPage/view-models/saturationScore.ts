export type Tone = "ok" | "warn" | "err" | "neutral";

const P95_WARN_MS = 100;
const P95_ERR_MS = 500;
const ERROR_RATE_WARN = 1;
const ERROR_RATE_ERR = 5;

export function toneFromHealth(p95Ms: number, errorRate: number): Tone {
  if (p95Ms >= P95_ERR_MS || errorRate >= ERROR_RATE_ERR) return "err";
  if (p95Ms >= P95_WARN_MS || errorRate >= ERROR_RATE_WARN) return "warn";
  return "ok";
}
