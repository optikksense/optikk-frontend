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
export function GaugeRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { rawData, data: rows } = useDashboardData(chartConfig, dataSources);
  const valueKey = chartConfig.valueKey || 'value';
  const groupKey = chartConfig.groupByKey;

  if (rows.length === 0) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }

  if (groupKey) {
    // Render multiple small gauges
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 8px', padding: 8, overflowY: 'auto', maxHeight: '100%' }}>
        {rows.slice(0, 8).map((row: any, i: number) => {
          const val = Number(row[valueKey] ?? 0);
          const label = row[groupKey] || `Item ${i + 1}`;
          return (
            <div key={label} style={{ textAlign: 'center', minWidth: 80, flex: '1 1 calc(25% - 8px)', overflow: 'hidden' }}>
              <GaugeChart value={Math.round(val * 100)} label={label} size={80} />
            </div>
          );
        })}
      </div>
    );
  }

  const val = Number(rows[0]?.[valueKey] ?? 0);
  return <GaugeChart value={Math.round(val * 100)} label={chartConfig.title ?? ''} />;
}
