/**
 * Overview API barrel — preserves the `overviewHubApi.<method>` call surface
 * consumed by the Overview page. Each underlying module owns a backend
 * boundary:
 *
 *   overviewRedApi    → `/spans/red/*`
 *   overviewErrorsApi → `/spans/exception-rate-by-type`, `/spans/error-hotspot`
 */

import { getRedSummary, getRequestAndErrorRateSeries } from "@shared/api/red/redApi";
import { getErrorHotspot } from "./overviewErrorsApi";

export type { ServiceCatalogRedSummary as FleetRedMetrics } from "@shared/api/red/redApi";

import type { RequestTime } from "@shared/api/service-types";

export const overviewHubApi = {
  getFleetRedMetrics: (start: RequestTime, end: RequestTime, signal?: AbortSignal) =>
    getRedSummary(start, end, undefined, signal),
  getPerformanceSeries: getRequestAndErrorRateSeries,
  getErrorHotspot,
};
