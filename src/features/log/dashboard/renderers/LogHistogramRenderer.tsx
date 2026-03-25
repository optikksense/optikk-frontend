import { useMemo } from 'react';

import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

import LogHistogram from '@shared/components/ui/charts/distributions/LogHistogram';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';

/**
 *
 */
export function LogHistogramRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const { startTime, endTime } = extraContext || {};
  const data = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);
  return data.length > 0
    ? <LogHistogram data={data} height={240} startTime={startTime} endTime={endTime} />
    : <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No data</div>;
}
