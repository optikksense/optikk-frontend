import { Empty } from 'antd';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  Cpu,
  Database,
  Gauge,
  GitPullRequest,
  HardDrive,
  Layers,
  Network,
  Radio,
  Server,
  ShieldCheck,
  Target,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';

import LatencyHistogram from '@components/charts/distributions/LatencyHistogram';
import LogHistogram from '@components/charts/distributions/LogHistogram';
import LatencyHeatmapChart from '@components/charts/specialized/LatencyHeatmapChart';

import {
  createBarDataset,
  createChartOptions,
  createLineDataset,
  getChartColor,
} from '@utils/chartHelpers';

const ICONS: Record<string, any> = {
  Activity, AlertCircle, Clock, Zap, Network, Layers,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Database,
  HardDrive, Cpu, Radio, Gauge, GitPullRequest, Target,
  BarChart3, Server, ShieldCheck, TrendingDown,
};

/**
 *
 * @param name
 * @param size
 */
export function getDashboardIcon(name: string, size: number = 16) {
  const IconComponent = ICONS[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}

function buildAiTimeseries(rows: any[], metricKey: string, groupKey: string = 'model_name', filterValue: string | null = null) {
  const arr = Array.isArray(rows) ? rows : [];
  const filtered = filterValue ? arr.filter((row) => row[groupKey] === filterValue) : arr;
  const tsSet = new Set<string>();
  const groupSet = new Set<string>();
  for (const row of filtered) {
    if (row[metricKey] != null && row[metricKey] !== '' && row[metricKey] !== 0) {
      tsSet.add(row.timestamp);
      groupSet.add(row[groupKey] || 'unknown');
    }
  }
  const timestamps = Array.from(tsSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const groups = Array.from(groupSet);
  const lookup: Record<string, Record<string, number | null>> = {};
  for (const row of filtered) {
    const group = row[groupKey] || 'unknown';
    if (!lookup[group]) lookup[group] = {};
    const value = Number(row[metricKey]);
    lookup[group][row.timestamp] = Number.isNaN(value) ? null : Math.round(value * 100000) / 100000;
  }
  const labels = timestamps.map((ts) => {
    const date = new Date(ts);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  });
  const datasets = groups.map((group, index) =>
    createLineDataset(group, timestamps.map((timestamp) => lookup[group]?.[timestamp] ?? null), getChartColor(index), false),
  );
  return { labels, datasets, hasData: datasets.length > 0 };
}

/**
 *
 * @param root0
 * @param root0.chartConfig
 * @param root0.dataSources
 * @param root0.extraContext
 */
function LogHistogramRenderer({ chartConfig, dataSources, extraContext }: { chartConfig: any; dataSources: any; extraContext?: any }) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const { startTime, endTime } = extraContext || {};
  const data = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  const height = chartConfig.height || 120;
  return data.length > 0
    ? <LogHistogram data={data} height={height} startTime={startTime} endTime={endTime} />
    : <Empty description="No log data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
}

/**
 *
 * @param root0
 * @param root0.chartConfig
 * @param root0.dataSources
 */
function LatencyHistogramRenderer({ chartConfig, dataSources }: { chartConfig: any; dataSources: any }) {
  const rawData = dataSources?.[chartConfig.dataSource];
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

  const height = chartConfig.height || 160;
  return <LatencyHistogram traces={traces} height={height} />;
}

/**
 *
 * @param root0
 * @param root0.chartConfig
 * @param root0.dataSources
 */
function LatencyHeatmapRenderer({ chartConfig, dataSources }: { chartConfig: any; dataSources: any }) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const data = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  return <LatencyHeatmapChart data={data} />;
}

/**
 *
 * @param root0
 * @param root0.chartConfig
 * @param root0.dataSources
 * @param root0.extraContext
 */
function AiLineRenderer({ chartConfig, dataSources, extraContext }: { chartConfig: any; dataSources: any; extraContext: any }) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const rows = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  const chartData = useMemo(
    () => buildAiTimeseries(
      rows,
      chartConfig.valueKey,
      chartConfig.groupByKey || 'model_name',
      extraContext?.selectedModel || null,
    ),
    [rows, chartConfig.valueKey, chartConfig.groupByKey, extraContext?.selectedModel],
  );

  const height = chartConfig.height || 220;
  const tickCallback = chartConfig.yPrefix
    ? (value: any) => `${chartConfig.yPrefix}${Number(value).toFixed(chartConfig.yDecimals ?? 2)}`
    : undefined;

  const options = createChartOptions({
    plugins: { legend: { display: true, labels: { color: '#666', font: { size: 11 } } } },
    scales: {
      y: {
        ticks: { color: '#666', ...(tickCallback ? { callback: tickCallback } : {}) },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
      },
    },
  });

  if (!chartData.hasData) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }
  return <div style={{ height }}><Line data={chartData} options={options} /></div>;
}

/**
 *
 * @param root0
 * @param root0.chartConfig
 * @param root0.dataSources
 * @param root0.extraContext
 */
function AiBarRenderer({ chartConfig, dataSources, extraContext }: { chartConfig: any; dataSources: any; extraContext: any }) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const rows = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

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

  const height = chartConfig.height || 220;
  const tickCallback = chartConfig.yPrefix
    ? (value: any) => `${chartConfig.yPrefix}${Number(value).toFixed(chartConfig.yDecimals ?? 4)}`
    : undefined;

  const options = createChartOptions({
    plugins: { legend: { display: stacked || (chartData.datasets.length > 1), labels: { color: '#666', font: { size: 11 } } } },
    scales: {
      x: { stacked, ticks: { color: '#666' }, grid: { color: '#2D2D2D' } },
      y: {
        stacked,
        ticks: { color: '#666', ...(tickCallback ? { callback: tickCallback } : {}) },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
      },
    },
  });

  return <div style={{ height }}><Bar data={{ labels: chartData.labels, datasets: chartData.datasets }} options={options} /></div>;
}

export const SPECIALIZED_RENDERERS: Record<string, any> = {
  'log-histogram': LogHistogramRenderer,
  'latency-histogram': LatencyHistogramRenderer,
  'latency-heatmap': LatencyHeatmapRenderer,
  'ai-line': AiLineRenderer,
  'ai-bar': AiBarRenderer,
};
