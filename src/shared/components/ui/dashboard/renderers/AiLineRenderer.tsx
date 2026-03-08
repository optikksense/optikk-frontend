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
export function AiLineRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext: DashboardExtraContext;
}) {
  const { rawData, data: rows } = useDashboardData(chartConfig, dataSources);

  const chartData = useMemo(
    () => buildAiTimeseries(
      rows,
      chartConfig.valueKey,
      chartConfig.groupByKey || 'model_name',
      extraContext?.selectedModel || null,
    ),
    [rows, chartConfig.valueKey, chartConfig.groupByKey, extraContext?.selectedModel],
  );
  const tickCallback = chartConfig.yPrefix
    ? (value: any) => `${chartConfig.yPrefix}${Number(value).toFixed(chartConfig.yDecimals ?? 2)}`
    : undefined;

  const options = createChartOptions({
    plugins: { legend: { display: true, labels: { color: APP_COLORS.hex_666, font: { size: 11 } } } },
    scales: {
      y: {
        ticks: { color: APP_COLORS.hex_666, ...(tickCallback ? { callback: tickCallback } : {}) },
        grid: { color: APP_COLORS.hex_2d2d2d },
        beginAtZero: true,
      },
    },
  });

  if (!chartData.hasData) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }
  return <div style={{ height: '100%' }}><Line data={chartData} options={options} /></div>;
}
