import { INFRA_HEALTH_THRESHOLDS, classifyHealth } from "@shared/constants/healthThresholds";
import type { InfrastructureNode } from "../types";

export type NodeHealthTier = "healthy" | "degraded" | "unhealthy";

/** Mirrors backend nodes summary thresholds (errorRate > 10 unhealthy, > 2 degraded). */
export function tierForErrorRate(errorRate: number): NodeHealthTier {
  return classifyHealth(errorRate, INFRA_HEALTH_THRESHOLDS);
}

export function tierForNode(node: InfrastructureNode): NodeHealthTier {
  return tierForErrorRate(node.errorRate);
}
