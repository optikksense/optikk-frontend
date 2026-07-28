export interface HealthThresholds {
  readonly unhealthy: number;
  readonly degraded: number;
}

export const SERVICE_HEALTH_THRESHOLDS: HealthThresholds = {
  unhealthy: 5,
  degraded: 1,
};

export const INFRA_HEALTH_THRESHOLDS: HealthThresholds = {
  unhealthy: 10,
  degraded: 2,
};

export const ENDPOINT_HEALTH_THRESHOLDS: HealthThresholds = {
  unhealthy: 2,
  degraded: 0.5,
};

/**
 * Classifies health status based on an error rate and standard threshold boundaries.
 */
export function classifyHealth(
  errorRate: number,
  thresholds: HealthThresholds
): "healthy" | "degraded" | "unhealthy" {
  if (errorRate > thresholds.unhealthy) return "unhealthy";
  if (errorRate > thresholds.degraded) return "degraded";
  return "healthy";
}
