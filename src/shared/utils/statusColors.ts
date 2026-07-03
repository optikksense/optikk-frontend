import { APP_COLORS } from "@config/colorLiterals";

/**
 * Get the color for a service health status.
 * @param status
 */
export function getHealthColor(status: string): string {
  const colors: Record<string, string> = {
    healthy: APP_COLORS.hex_73c991,
    degraded: APP_COLORS.hex_f79009,
    unhealthy: APP_COLORS.hex_f04438,
    unknown: APP_COLORS.hex_98a2b3,
  };
  return colors[status] ?? colors.unknown;
}
