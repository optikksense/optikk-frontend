export type ServiceHealth = "healthy" | "warn" | "error" | "unknown";

export function classifyServiceHealth(errorRate: number, p99Ms: number): ServiceHealth {
  if (errorRate >= 2 || p99Ms >= 2000) return "error";
  if (errorRate >= 0.5 || p99Ms >= 1000) return "warn";
  return "healthy";
}
