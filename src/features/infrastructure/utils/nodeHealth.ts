import { INFRA_HEALTH_THRESHOLDS, classifyHealth } from "@shared/constants/healthThresholds";
import type { InfrastructureNode } from "../types";

export type NodeHealthTier = "healthy" | "degraded" | "unhealthy";

                                                                                         
export function tierForNode(node: InfrastructureNode): NodeHealthTier {
  return classifyHealth(node.errorRate, INFRA_HEALTH_THRESHOLDS);
}
