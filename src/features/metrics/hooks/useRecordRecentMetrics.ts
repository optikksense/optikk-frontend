import { useEffect } from "react";

import type { MetricQueryDefinition } from "@shared/metrics/types";
import { useMetricsStore } from "../store/metricsStore";

   
                                                                          
                                                                               
   
export function useRecordRecentMetrics(queries: MetricQueryDefinition[]): void {
  const pushRecentMetric = useMetricsStore((s) => s.pushRecentMetric);
  const activeNames = queries
    .map((q) => q.metricName)
    .filter(Boolean)
    .join("|");

  useEffect(() => {
    if (!activeNames) return;
    for (const name of activeNames.split("|")) {
      pushRecentMetric(name);
    }
  }, [activeNames, pushRecentMetric]);
}
