import { useMemo } from 'react';

import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import { resolveDataSourceId } from '../utils/dashboardUtils';
import { asDashboardRecordArray, getDashboardRecordArrayField } from '../utils/runtimeValue';

/**
 *
 */
export function useDashboardData(
  chartConfig: DashboardPanelSpec,
  dataSources: DashboardDataSources
) {
  const rawData = dataSources?.[resolveDataSourceId(chartConfig)];
  const data = useMemo(() => {
    const key = chartConfig.dataKey;
    if (key) {
      return getDashboardRecordArrayField(rawData, key);
    }

    if (Array.isArray(rawData)) {
      return asDashboardRecordArray(rawData);
    }

    return getDashboardRecordArrayField(rawData, 'data');
  }, [rawData, chartConfig.dataKey]);

  return { rawData, data };
}
