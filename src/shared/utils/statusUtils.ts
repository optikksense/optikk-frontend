export type HealthVariant = "success" | "warning" | "error";

/**
 * Returns health status variant ("success", "warning", "error") based on error rate percentage thresholds.
 * Thresholds: >= 5% = error, >= 1% = warning, < 1% = success.
 */
export function healthVariantForErrorRate(
  errorRate: number | undefined
): HealthVariant {
  if (errorRate === undefined || errorRate === null) return "success";
  if (errorRate >= 5) return "error";
  if (errorRate >= 1) return "warning";
  return "success";
}

/**
 * Returns human-readable health status label ("Healthy", "Warning", "Critical") based on error rate percentage thresholds.
 */
export function healthLabelForErrorRate(errorRate: number | undefined): string {
  const variant = healthVariantForErrorRate(errorRate);
  if (variant === "error") return "Critical";
  if (variant === "warning") return "Warning";
  return "Healthy";
}
