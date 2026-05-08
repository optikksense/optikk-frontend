import type { RequestTime } from "@shared/api/service-types";

import { getJson } from "./overviewClient";

export interface HistogramSummary {
  p50?: number;
  p95?: number;
  p99?: number;
  avg?: number;
}

export function getApmRpcRequestRate(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/apm/rpc-request-rate", startTime, endTime);
}

export function getApmRpcDuration(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<HistogramSummary> {
  return getJson("/apm/rpc-duration", startTime, endTime);
}

export function getApmProcessCpu(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/apm/process-cpu", startTime, endTime);
}

export function getApmProcessMemory(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<{ rss?: number; vms?: number }> {
  return getJson("/apm/process-memory", startTime, endTime);
}

export function getApmOpenFds(
  startTime: RequestTime,
  endTime: RequestTime
): Promise<unknown[]> {
  return getJson("/apm/open-fds", startTime, endTime);
}
