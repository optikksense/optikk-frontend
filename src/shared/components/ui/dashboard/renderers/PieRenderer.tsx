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
export function PieRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { rawData, data: rows } = useDashboardData(chartConfig, dataSources);

  const labelKey = chartConfig.labelKey || chartConfig.groupByKey || 'label';
  const valueKey = chartConfig.valueKey || 'value';

  const chartData = useMemo(() => {
    const filtered = rows.filter((row) => row != null);
    if (filtered.length === 0) {
      return null;
    }

    const labels = filtered.map((row, index) => String(row[labelKey] ?? `Item ${index + 1}`));
    const values = filtered.map((row) => {
      const value = Number(row[valueKey]);
      return Number.isFinite(value) ? value : 0;
    });

    if (!values.some((value) => value > 0)) {
      return null;
    }

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((_, index) => `${getChartColor(index)}CC`),
        borderColor: labels.map((_, index) => getChartColor(index)),
        borderWidth: 1,
      }],
    };
  }, [labelKey, rows, valueKey]);
  if (!chartData) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }

  const options = createChartOptions({
    plugins: {
      legend: {
        display: true,
        labels: {
          color: APP_COLORS.hex_666,
          font: { size: 11 },
        },
      },
    },
  });

  return <div style={{ height: '100%' }}><Doughnut data={chartData} options={options} /></div>;
}
