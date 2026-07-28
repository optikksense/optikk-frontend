import { APP_COLORS } from "@config/colorLiterals";
import type { HealthStatus } from "@shared/components/ui/data-display/status/healthStatus";

import type { DatastoreSystemRow } from "@/features/saturation/api/datastoresExplorerSchemas";

// Health thresholds shared across list + detail. Mirrors the old single-page
// degraded heuristic (error rate 1% / p95 1s) with a critical tier on top.
const ERROR_RATE_DEGRADED = 1;
const ERROR_RATE_CRITICAL = 5;
const P95_DEGRADED_MS = 1000;
const P95_CRITICAL_MS = 2000;

export type InstanceStatus = "ok" | "warn" | "err";

export const STATUS_LABEL: Record<InstanceStatus, string> = {
  ok: "healthy",
  warn: "degraded",
  err: "critical",
};

// Translate the local vocabulary to the shared health-indicator vocabulary.
export const INSTANCE_HEALTH: Record<InstanceStatus, HealthStatus> = {
  ok: "healthy",
  warn: "warn",
  err: "error",
};

const ENGINE_COLOR: Record<string, string> = {
  postgresql: APP_COLORS.hex_336791,
  mysql: APP_COLORS.hex_00758f,
  redis: APP_COLORS.hex_dc382d,
  mongodb: APP_COLORS.hex_13aa52,
};

const ENGINE_BADGE: Record<string, string> = {
  postgresql: "PG",
  mysql: "MY",
  redis: "RD",
  mongodb: "MG",
};

export function instanceStatus(row: DatastoreSystemRow): InstanceStatus {
  if (row.errorRate >= ERROR_RATE_CRITICAL || row.p95LatencyMs >= P95_CRITICAL_MS) return "err";
  if (row.errorRate >= ERROR_RATE_DEGRADED || row.p95LatencyMs >= P95_DEGRADED_MS) return "warn";
  return "ok";
}

export function engineColor(system: string): string {
  return ENGINE_COLOR[system.toLowerCase()] ?? APP_COLORS.hex_336791;
}

export function engineBadge(system: string): string {
  return ENGINE_BADGE[system.toLowerCase()] ?? system.slice(0, 2).toUpperCase();
}
