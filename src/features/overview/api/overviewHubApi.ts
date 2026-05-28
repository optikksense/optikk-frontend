/**
 * Overview API barrel — preserves the `overviewHubApi.<method>` call surface
 * consumed by the Overview page. Each underlying module owns a backend
 * boundary:
 *
 *   overviewRedApi    → `/spans/red/*` + `/errors/service-error-rate`
 *   overviewErrorsApi → `/spans/exception-rate-by-type`, `/spans/error-hotspot`
 */

import { getErrorHotspot, getExceptionRateByType } from "./overviewErrorsApi";
import {
  getRedErrorRateSeries,
  getRedP95Series,
  getRedRequestRateSeries,
  getRedSummary,
} from "./overviewRedApi";

export type { RedSummary } from "./overviewRedApi";

export const overviewHubApi = {
  getRedSummary,
  getRedP95Series,
  getRedRequestRateSeries,
  getRedErrorRateSeries,
  getExceptionRateByType,
  getErrorHotspot,
};
