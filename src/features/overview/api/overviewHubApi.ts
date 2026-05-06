/**
 * Overview Hub API barrel — preserves the legacy `overviewHubApi.<method>`
 * call surface used by every tab in OverviewHubPage. Internals are split
 * along the backend module boundary so each file stays ≤200 lines and
 * canonical-vs-phantom changes are easy to track per BE module:
 *
 *   overviewSummaryApi   → `/overview/summary` family   (Phase 0 stubs)
 *   overviewRedApi       → `/spans/red/*` + `/spans/latency-breakdown`
 *   overviewErrorsApi    → `/errors/*` + `/spans/exception-rate-by-type`
 *                          + `/spans/error-hotspot`
 *   overviewApmApi       → `/apm/*`
 *   overviewHttpApi      → `/http/*`
 *   overviewSloApi       → `/slo/*`
 */

import {
  getApmOpenFds,
  getApmProcessCpu,
  getApmProcessMemory,
  getApmRpcDuration,
  getApmRpcRequestRate,
} from "./overviewApmApi";
import {
  getErrorGroups,
  getErrorHotspot,
  getErrorsServiceErrorRate,
  getErrorsVolume,
  getExceptionRateByType,
} from "./overviewErrorsApi";
import {
  getHttpErrorTimeseries,
  getHttpRequestDuration,
  getHttpRequestRate,
  getHttpStatusDistribution,
} from "./overviewHttpApi";
import {
  getLatencyBreakdown,
  getRedErrorRateSeries,
  getRedP95Series,
  getRedRequestRateSeries,
  getRedSummary,
  getTopErrorOperations,
  getTopSlowOperations,
} from "./overviewRedApi";
import { getSloBurnDown, getSloBurnRate } from "./overviewSloApi";
export type { RedSummary } from "./overviewRedApi";
export type { HistogramSummary } from "./overviewApmApi";
export type { BurnRate } from "./overviewSloApi";

export const overviewHubApi = {
  getRedSummary,
  getLatencyBreakdown,
  getRedP95Series,
  getRedRequestRateSeries,
  getRedErrorRateSeries,
  getTopSlowOperations,
  getTopErrorOperations,
  getApmRpcRequestRate,
  getApmRpcDuration,
  getApmProcessCpu,
  getApmProcessMemory,
  getApmOpenFds,
  getErrorsServiceErrorRate,
  getErrorsVolume,
  getExceptionRateByType,
  getErrorHotspot,
  getErrorGroups,
  getHttpRequestRate,
  getHttpRequestDuration,
  getHttpStatusDistribution,
  getHttpErrorTimeseries,
  getSloBurnRate,
  getSloBurnDown,
};
