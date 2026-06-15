/**
 * Overview API barrel — preserves the `overviewHubApi.<method>` call surface
 * consumed by the Overview page. Each underlying module owns a backend
 * boundary:
 *
 *   overviewRedApi    → `/spans/red/*`
 *   overviewErrorsApi → `/spans/exception-rate-by-type`, `/spans/error-hotspot`
 */

import { getErrorHotspot } from "./overviewErrorsApi";
import { getFleetRedMetrics, getPerformanceSeries } from "./overviewRedApi";

export type { FleetRedMetrics } from "./overviewRedApi";

export const overviewHubApi = {
  getFleetRedMetrics,
  getPerformanceSeries,
  getErrorHotspot,
};
