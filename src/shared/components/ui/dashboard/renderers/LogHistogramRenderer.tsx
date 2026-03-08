import { Empty, Table } from 'antd';
import { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

import LatencyHistogram from '@shared/components/ui/charts/distributions/LatencyHistogram';
import LogHistogram from '@shared/components/ui/charts/distributions/LogHistogram';
import GaugeChart from '@shared/components/ui/charts/micro/GaugeChart';
import LatencyHeatmapChart from '@shared/components/ui/charts/specialized/LatencyHeatmapChart';
import ServiceGraph from '@shared/components/ui/charts/specialized/ServiceGraph';
import WaterfallChart from '@shared/components/ui/charts/specialized/WaterfallChart';

import {
  createBarDataset,
  createChartOptions,
  createLineDataset,
  getChartColor,
} from '@shared/utils/chartHelpers';

import { APP_COLORS } from '@config/colorLiterals';

import { useDashboardData } from '../hooks/useDashboardData';
import { buildAiTimeseries, resolveDataSourceId } from '../utils/dashboardUtils';

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
    : <Empty description="No log data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
}
