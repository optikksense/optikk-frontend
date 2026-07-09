/**
 * Overview API barrel — preserves the `overviewHubApi.<method>` call surface
 * consumed by the Overview page. Each underlying module owns a backend
 * boundary:
 *
 *   overviewRedApi    → `/spans/red/*`
 *   overviewErrorsApi → `/spans/exception-rate-by-type`, `/spans/error-hotspot`
 */

import {
  getRedSummaryWithComparison,
  getRequestAndErrorRateSeries,
} from "../../services/api/redApi";
import { getErrorHotspot } from "./overviewErrorsApi";

export type { ServiceCatalogRedSummary as FleetRedMetrics } from "../../services/api/redApi";

import type { RequestTime } from "@shared/api/service-types";

export const overviewHubApi = {
  getFleetRedMetrics: (start: RequestTime, end: RequestTime) =>
    getRedSummaryWithComparison(start, end).then((r) => r.data),
  getPerformanceSeries: getRequestAndErrorRateSeries,
  getErrorHotspot,
};
