import type { PillVariant } from "@shared/components/primitives/ui/pill";

                                                                                
                                                                      
export type HealthStatus = "healthy" | "warn" | "error" | "unknown";

export const HEALTH_PILL_VARIANT: Record<HealthStatus, PillVariant> = {
  healthy: "success",
  warn: "warning",
  error: "error",
  unknown: "neutral",
};

export const HEALTH_DOT_CLASS: Record<HealthStatus, string> = {
  healthy: "bg-success",
  warn: "bg-warning",
  error: "bg-error",
  unknown: "bg-foreground-muted",
};

export const HEALTH_RING_CLASS: Record<HealthStatus, string> = {
  healthy: "ring-[var(--color-success)]/30",
  warn: "ring-[var(--color-warning)]/30",
  error: "ring-[var(--color-error)]/30",
  unknown: "ring-transparent",
};

export const HEALTH_LABEL: Record<HealthStatus, string> = {
  healthy: "Healthy",
  warn: "Warn",
  error: "Error",
  unknown: "Unknown",
};
