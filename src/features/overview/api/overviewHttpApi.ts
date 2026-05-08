import type { RequestTime } from "@shared/api/service-types";

import type { HistogramSummary } from "./overviewApmApi";
import { getJson } from "./overviewClient";

export function getHttpRequestRate(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/http/request-rate", startTime, endTime);
}

export function getHttpRequestDuration(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<HistogramSummary> {
  return getJson("/http/request-duration", startTime, endTime);
}

export function getHttpStatusDistribution(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/http/status-distribution", startTime, endTime);
}

export function getHttpErrorTimeseries(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/http/error-timeseries", startTime, endTime);
}
