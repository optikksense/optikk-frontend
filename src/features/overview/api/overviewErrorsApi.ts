import type { RequestTime } from "@shared/api/service-types";

import { getJson, getJsonWithParams } from "./overviewClient";

/**
 * Phase 0: paths rewritten from `/overview/errors/*` → `/errors/*` to match
 * the canonical backend module (`internal/modules/services/errors`).
 */

export function getErrorsServiceErrorRate(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/errors/service-error-rate", startTime, endTime);
}

export function getErrorsVolume(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/errors/error-volume", startTime, endTime);
}

export function getErrorGroups(
  startTime: RequestTime,
  endTime: RequestTime,
  limit = 100
): Promise<unknown[]> {
  return getJsonWithParams("/errors/groups", startTime, endTime, { limit });
}

export function getExceptionRateByType(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/spans/exception-rate-by-type", startTime, endTime);
}

export function getErrorHotspot(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/spans/error-hotspot", startTime, endTime);
}
