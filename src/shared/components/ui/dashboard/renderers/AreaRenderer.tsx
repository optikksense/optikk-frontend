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
export function AreaRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
  const { rawData, data: rows } = useDashboardData(chartConfig, dataSources);

  const groupKey = chartConfig.groupByKey || 'service_name';
  const valueKey = chartConfig.valueKey || 'count';

  const chartData = useMemo(() => {
    const tsSet = new Set<string>();
    const groupSet = new Set<string>();
    for (const row of rows) {
      tsSet.add(row.timestamp || row.time_bucket || '');
      groupSet.add(row[groupKey] || 'unknown');
    }
    const timestamps = Array.from(tsSet).filter(Boolean).sort();
    const groups = Array.from(groupSet);
    const lookup: Record<string, Record<string, number>> = {};
    for (const row of rows) {
      const group = row[groupKey] || 'unknown';
      if (!lookup[group]) lookup[group] = {};
      lookup[group][row.timestamp || row.time_bucket || ''] = Number(row[valueKey]) || 0;
    }
    const labels = timestamps.map((ts) => {
      const d = new Date(ts);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    });
    const datasets = groups.map((group, idx) => ({
      label: group,
      data: timestamps.map((ts) => lookup[group]?.[ts] ?? 0),
      borderColor: getChartColor(idx),
      backgroundColor: `${getChartColor(idx)}33`,
      fill: true,
      tension: 0.4,
    }));
    return { labels, datasets, hasData: datasets.length > 0 };
  }, [rows, groupKey, valueKey]);
  if (!chartData.hasData) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }
  const options = createChartOptions({
    plugins: { legend: { display: true, labels: { color: APP_COLORS.hex_666, font: { size: 11 } } } },
    scales: {
      x: { ticks: { color: APP_COLORS.hex_666 }, grid: { color: APP_COLORS.hex_2d2d2d } },
      y: { ticks: { color: APP_COLORS.hex_666 }, grid: { color: APP_COLORS.hex_2d2d2d }, beginAtZero: true },
    },
  });
  return <div style={{ height: '100%' }}><Line data={chartData} options={options} /></div>;
}
