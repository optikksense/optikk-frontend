import type { InfrastructureNode } from "../types";

export type NodeHealthTier = "healthy" | "degraded" | "unhealthy";

/** Mirrors backend nodes summary thresholds (error_rate > 10 unhealthy, > 2 degraded). */
export function tierForNode(node: InfrastructureNode): NodeHealthTier {
  if (node.error_rate > 10) return "unhealthy";
  if (node.error_rate > 2) return "degraded";
  return "healthy";
}

export function groupLabelForNode(
  node: InfrastructureNode,
  mode: "health" | "host_prefix"
): string {
  if (mode === "health") return tierForNode(node);
  const host = node.host || "unknown";
  const dot = host.indexOf(".");
  const prefix = dot > 0 ? host.slice(0, dot) : host.slice(0, 8) || "other";
  return prefix;
}
