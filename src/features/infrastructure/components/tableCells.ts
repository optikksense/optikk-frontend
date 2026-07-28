// Shared status helpers for the infrastructure tables.

export type TrafficStatus = "ok" | "warn" | "err";

export const STATUS_COLOR: Record<TrafficStatus, string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  err: "var(--err)",
};

export function trafficStatus(errorRate: number): TrafficStatus {
  return errorRate >= 10 ? "err" : errorRate >= 2 ? "warn" : "ok";
}

export function errorRateColor(errorRate: number): string {
  const status = trafficStatus(errorRate);
  return status === "err" ? "var(--err)" : status === "warn" ? "var(--warn-fg)" : "var(--fg-1)";
}
