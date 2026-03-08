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
export function LatencyHistogramRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const traces = useMemo(() => {
    const arr = Array.isArray(rawData) ? rawData : [];
    if (arr.length > 0 && (arr[0].duration_ms != null || arr[0].durationMs != null)) return arr;
    const bucketMidpoint = (bucket: string): number => ({
      '0_10ms': 5, '10_25ms': 17, '25_50ms': 37, '50_100ms': 75,
      '100_250ms': 175, '250_500ms': 375, '500ms_1s': 750,
      '1s_2500ms': 1750, '2500ms_5s': 3750, gt_5s: 7000,
    } as Record<string, number>)[bucket] ?? 0;
    return arr.flatMap((bucket) => {
      const count = Number(bucket.span_count) || 0;
      return Array(count).fill({ duration_ms: bucketMidpoint(bucket.bucket) });
    });
  }, [rawData]);
  return <LatencyHistogram traces={traces} height={240} />;
}
