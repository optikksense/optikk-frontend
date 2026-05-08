import type { RequestTime } from "@shared/api/service-types";

import { getJson } from "./overviewClient";

export interface BurnRate {
  fast_burn_rate?: number;
  slow_burn_rate?: number;
  budget_remaining_pct?: number;
}

/**
 * Phase 0: paths rewritten from `/overview/slo/*` → `/slo/*` to match the
 * canonical backend module (`internal/modules/services/slo`).
 */

export function getSloBurnRate(startTime: RequestTime, endTime: RequestTime): Promise<BurnRate> {
  return getJson("/slo/burn-rate", startTime, endTime);
}

export function getSloBurnDown(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/slo/burn-down", startTime, endTime);
}
