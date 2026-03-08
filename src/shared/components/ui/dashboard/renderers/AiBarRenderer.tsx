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
export function AiBarRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext: DashboardExtraContext;
}) {
  const { rawData, data: rows } = useDashboardData(chartConfig, dataSources);

  const filterValue = extraContext?.selectedModel || null;
  const groupKey = chartConfig.groupByKey || 'model_name';
  const labelKey = chartConfig.labelKey || groupKey;
  const stacked = chartConfig.stacked || false;

  const chartData = useMemo(() => {
    const filtered = filterValue ? rows.filter((row) => row[groupKey] === filterValue) : rows;
    if (!filtered.length) return null;

    if (chartConfig.valueKeys && chartConfig.valueKeys.length > 0) {
      const labels = filtered.map((row) => row[labelKey] || 'unknown');
      const datasets = chartConfig.valueKeys.map((valueKey: string, index: number) => ({
        label: valueKey.replace(/_/g, ' '),
        data: filtered.map((row) => { const value = Number(row[valueKey]); return Number.isNaN(value) ? 0 : value; }),
        backgroundColor: `${getChartColor(index)}CC`,
        borderColor: getChartColor(index),
        borderWidth: 1,
        borderRadius: stacked ? 0 : 2,
      }));
      return { labels, datasets, hasData: true };
    }

    if (chartConfig.bucketKey) {
      const groups: Record<string, Record<string, number>> = {};
      for (const row of filtered) {
        const group = row[groupKey] || 'unknown';
        if (!groups[group]) groups[group] = {};
        groups[group][row[chartConfig.bucketKey]] = Number(row[chartConfig.valueKey]) || 0;
      }
      const allBuckets = Array.from(new Set(filtered.map((row) => row[chartConfig.bucketKey]))).sort((a: any, b: any) => a - b);
      const labels = allBuckets.map((bucket) => `${bucket}ms`);
      const datasets = Object.keys(groups).map((group, index) =>
        createBarDataset(group, allBuckets.map((bucket) => groups[group][bucket] ?? 0), getChartColor(index)),
      );
      return { labels, datasets, hasData: datasets.length > 0 };
    }

    const labels = filtered.map((row) => row[labelKey] || 'unknown');
    const color = chartConfig.color || getChartColor(0);
    const datasets = [createBarDataset(
      chartConfig.datasetLabel || chartConfig.valueKey || 'Value',
      filtered.map((row) => { const value = Number(row[chartConfig.valueKey]); return Number.isNaN(value) ? 0 : value; }),
      color,
    )];
    return { labels, datasets, hasData: true };
  }, [rows, filterValue, groupKey, labelKey, stacked, chartConfig]);

  if (!chartData || !chartData.hasData) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }
  const tickCallback = chartConfig.yPrefix
    ? (value: any) => `${chartConfig.yPrefix}${Number(value).toFixed(chartConfig.yDecimals ?? 4)}`
    : undefined;

  const options = createChartOptions({
    plugins: { legend: { display: stacked || (chartData.datasets.length > 1), labels: { color: APP_COLORS.hex_666, font: { size: 11 } } } },
    scales: {
      x: { stacked, ticks: { color: APP_COLORS.hex_666 }, grid: { color: APP_COLORS.hex_2d2d2d } },
      y: {
        stacked,
        ticks: { color: APP_COLORS.hex_666, ...(tickCallback ? { callback: tickCallback } : {}) },
        grid: { color: APP_COLORS.hex_2d2d2d },
        beginAtZero: true,
      },
    },
  });

  return <div style={{ height: '100%' }}><Bar data={{ labels: chartData.labels, datasets: chartData.datasets }} options={options} /></div>;
}
