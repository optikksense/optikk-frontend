import { APP_COLORS } from '@config/colorLiterals';
import { Empty, Table } from 'antd';
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
import type { ComponentType } from 'react';
import { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';

import LatencyHistogram from '@components/charts/distributions/LatencyHistogram';
import LogHistogram from '@components/charts/distributions/LogHistogram';
import GaugeChart from '@components/charts/micro/GaugeChart';
import ServiceGraph from '@components/charts/specialized/ServiceGraph';
import LatencyHeatmapChart from '@components/charts/specialized/LatencyHeatmapChart';
import WaterfallChart from '@components/charts/specialized/WaterfallChart';

import {
  createBarDataset,
  createChartOptions,
  createLineDataset,
  getChartColor,
} from '@utils/chartHelpers';
import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

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
export function LogHistogramRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
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
export function LatencyHistogramRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
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
export function LatencyHeatmapRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
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
export function AiLineRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext: DashboardExtraContext;
}) {
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
  return <div style={{ height }}><Line data={chartData} options={options} /></div>;
}

/**
 *
 * @param root0
 * @param root0.chartConfig
 * @param root0.dataSources
 * @param root0.extraContext
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

  return <div style={{ height }}><Bar data={{ labels: chartData.labels, datasets: chartData.datasets }} options={options} /></div>;
}

/**
 * Generic table renderer — auto-generates columns from first row keys.
 */
export function TableRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const rows = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).slice(0, 8).map((key) => ({
      title: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      dataIndex: key,
      key,
      ellipsis: true,
      render: (val: any) => {
        if (val == null) return '—';
        if (typeof val === 'number') return Number.isInteger(val) ? val : Number(val).toFixed(2);
        return String(val);
      },
    }));
  }, [rows]);

  const height = Number(chartConfig.height || 320);
  if (rows.length === 0) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }
  return (
    <div style={{ maxHeight: height, overflow: 'auto' }}>
      <Table
        dataSource={rows.map((r: any, i: number) => ({ ...r, _rowKey: r.id ?? r.key ?? i }))}
        columns={columns}
        rowKey="_rowKey"
        size="small"
        pagination={false}
      />
    </div>
  );
}

/**
 * Bar chart renderer (generic — wraps AiBarRenderer logic).
 */
export function BarRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
  return <AiBarRenderer chartConfig={chartConfig} dataSources={dataSources} extraContext={extraContext ?? {}} />;
}

/**
 * Area/line chart renderer.
 */
export function AreaRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const rows = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

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

  const height = Number(chartConfig.height || 260);
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
  return <div style={{ height }}><Line data={chartData} options={options} /></div>;
}

/**
 * Gauge renderer — displays a single numeric value as a gauge.
 */
export function GaugeRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const rows = useMemo(() => Array.isArray(rawData) ? rawData : [], [rawData]);
  const valueKey = chartConfig.valueKey || 'value';
  const groupKey = chartConfig.groupByKey;

  if (rows.length === 0) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }

  if (groupKey) {
    // Render multiple small gauges
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: 8 }}>
        {rows.slice(0, 8).map((row: any, i: number) => {
          const val = Number(row[valueKey] ?? 0);
          const label = row[groupKey] || `Item ${i + 1}`;
          return (
            <div key={label} style={{ textAlign: 'center', minWidth: 80 }}>
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

/**
 * Scorecard renderer — horizontal row of key metrics.
 */
export function ScorecardRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const rows = useMemo(() => Array.isArray(rawData) ? rawData : [], [rawData]);

  if (rows.length === 0) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 8 }}>
      {rows.map((row: any, i: number) => {
        const name = row.service_name || row.serviceName || row.service || `Service ${i + 1}`;
        const rps = Number(row.rps ?? row.requestRate ?? 0).toFixed(1);
        const errPct = Number(row.error_pct ?? row.errorPct ?? row.error_rate ?? 0).toFixed(1);
        const p95 = Number(row.p95_ms ?? row.p95 ?? row.p95LatencyMs ?? 0).toFixed(0);
        return (
          <div key={name} style={{
            background: 'var(--glass-bg, rgba(255,255,255,0.05))',
            border: '1px solid var(--glass-border, #333)',
            borderRadius: 8,
            padding: '8px 12px',
            minWidth: 160,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary, #888)' }}>
              <span style={{ marginRight: 8 }}>{rps} rps</span>
              <span style={{ marginRight: 8, color: Number(errPct) > 1 ? APP_COLORS.hex_f04438 : undefined }}>{errPct}% err</span>
              <span>{p95}ms p95</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Heatmap renderer (x/y matrix with value color).
 */
export function HeatmapRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const rows = useMemo(() => Array.isArray(rawData) ? rawData : [], [rawData]);

  if (rows.length === 0) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }

  const xKey = chartConfig.xKey || 'operationName';
  const yKey = chartConfig.yKey || 'serviceName';
  const valueKey = chartConfig.valueKey || 'errorRate';

  const xValues = Array.from(new Set(rows.map((r: any) => String(r[xKey] ?? '')))).slice(0, 20);
  const yValues = Array.from(new Set(rows.map((r: any) => String(r[yKey] ?? ''))));
  const lookup: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    const x = String(row[xKey] ?? '');
    const y = String(row[yKey] ?? '');
    if (!lookup[y]) lookup[y] = {};
    lookup[y][x] = Number(row[valueKey]) || 0;
  }
  const maxVal = Math.max(...rows.map((r: any) => Number(r[valueKey]) || 0), 1);

  const height = Number(chartConfig.height || 360);
  return (
    <div style={{ maxHeight: height, overflowY: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 8px', textAlign: 'left' }}></th>
            {xValues.map((x) => (
              <th key={x} style={{ padding: '4px 6px', fontWeight: 400, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={x}>{x.slice(0, 12)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yValues.map((y) => (
            <tr key={y}>
              <td style={{ padding: '4px 8px', fontWeight: 500, whiteSpace: 'nowrap' }}>{y}</td>
              {xValues.map((x) => {
                const val = lookup[y]?.[x] ?? 0;
                const intensity = Math.min(1, val / maxVal);
                const bg = `rgba(240,68,56,${intensity.toFixed(2)})`;
                return (
                  <td key={x} style={{ background: bg, padding: '4px 6px', textAlign: 'center', color: intensity > 0.5 ? '#fff' : 'inherit' }}>
                    {val > 0 ? (val < 1 ? val.toFixed(2) : val.toFixed(0)) : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Service map renderer — wraps the ServiceGraph component.
 */
export function ServiceMapRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const nodes = useMemo(() => (rawData as any)?.nodes ?? [], [rawData]);
  const edges = useMemo(() => (rawData as any)?.edges ?? [], [rawData]);
  const height = Number(chartConfig.height || 560);

  if (nodes.length === 0) {
    return <Empty description="No topology data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }
  return (
    <div style={{ height }}>
      <ServiceGraph nodes={nodes} edges={edges} />
    </div>
  );
}

/**
 * Trace waterfall renderer.
 */
export function TraceWaterfallRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const spans = useMemo(() => Array.isArray(rawData) ? rawData : [], [rawData]);
  const height = Number(chartConfig.height || 600);

  if (spans.length === 0) {
    return <Empty description="No span data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }
  return (
    <div style={{ height, overflow: 'auto' }}>
      <WaterfallChart spans={spans} />
    </div>
  );
}

export type SpecializedDashboardRenderer = ComponentType<{
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}>;
