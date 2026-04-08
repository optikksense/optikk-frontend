import { useMemo } from "react";

import LogHistogram from "@shared/components/ui/charts/distributions/LogHistogram";
import type { DashboardPanelRendererProps } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { useDashboardData } from "@shared/components/ui/dashboard/hooks/useDashboardData";

/**
 *
 */
export function LogHistogramRenderer({
  chartConfig,
  dataSources,
  extraContext,
  fillHeight = true,
}: DashboardPanelRendererProps) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const { startTime, endTime } = extraContext || {};
  const data = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);
  return data.length > 0 ? (
    <LogHistogram data={data} fillHeight startTime={startTime} endTime={endTime} />
  ) : (
    <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
      No data
    </div>
  );
}
