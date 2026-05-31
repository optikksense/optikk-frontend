/**
 * Overview API barrel — preserves the `overviewHubApi.<method>` call surface
 * consumed by the Overview page. Each underlying module owns a backend
 * boundary:
 *
 *   overviewRedApi    → `/spans/red/*` + `/errors/service-error-rate`
 *   overviewErrorsApi → `/spans/exception-rate-by-type`, `/spans/error-hotspot`
 */

import { getErrorHotspot } from "./overviewErrorsApi";
import {
  getApdex,
  getRedErrorRateSeries,
  getRedRequestRateSeries,
  getRedSummary,
} from "./overviewRedApi";

export type { ApdexScore, RedSummary } from "./overviewRedApi";

export const overviewHubApi = {
  getRedSummary,
  getApdex,
  getRedRequestRateSeries,
  getRedErrorRateSeries,
  getErrorHotspot,
};
