   
                                                                             
                                                                       
            
  
                                       
                                                                                
   

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
