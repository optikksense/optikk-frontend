import type { FleetPod } from "../types";

export type PodHealthTier = "healthy" | "degraded" | "unhealthy";

/** Same error-rate tiers as host nodes for consistent fleet coloring. */
export function tierForPod(pod: FleetPod): PodHealthTier {
  if (pod.error_rate > 10) return "unhealthy";
  if (pod.error_rate > 2) return "degraded";
  return "healthy";
}
