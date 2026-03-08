import { Card, Col, Empty, Row } from 'antd';

import type { ComponentType } from 'react';

import { useMemo, useState } from 'react';

import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

import ErrorRateChart from '@shared/components/ui/charts/time-series/ErrorRateChart';
import LatencyChart from '@shared/components/ui/charts/time-series/LatencyChart';
import RequestChart from '@shared/components/ui/charts/time-series/RequestChart';
import StatCard from '@shared/components/ui/cards/StatCard';
import QueueMetricsList from '@shared/components/ui/data-display/QueueMetricsList';
import TopEndpointsList from '@shared/components/ui/data-display/TopEndpointsList';

import {
  formatBytes,
  formatDuration,
  formatNumber,
} from '@shared/utils/formatters';

import {
  AiBarRenderer,
  AiLineRenderer,
  AreaRenderer,
  BarRenderer,
  GaugeRenderer,
  HeatmapRenderer,
  LatencyHeatmapRenderer,
  LatencyHistogramRenderer,
  LogHistogramRenderer,
  PieRenderer,
  ScorecardRenderer,
  ServiceMapRenderer,
  TableRenderer,
  TraceWaterfallRenderer,
  getDashboardIcon,
} from './SpecializedRendererRegistry';

interface BaseChartComponentProps {
  data?: Array<Record<string, unknown>>;
  serviceTimeseriesMap: Record<string, unknown[]>;
  endpoints: Array<Record<string, unknown>>;
  selectedEndpoints: string[];
  valueKey?: string;
  datasetLabel?: string;
  color?: string;
  targetThreshold?: number;
}

const DASHBOARD_COMPONENT_MAP: Record<string, ComponentType<any>> = {
  request: RequestChart,
  'error-rate': ErrorRateChart,
  latency: LatencyChart,
  'log-histogram': LogHistogramRenderer,
  'latency-histogram': LatencyHistogramRenderer,
  'latency-heatmap': LatencyHeatmapRenderer,
  'ai-line': AiLineRenderer,
  'ai-bar': AiBarRenderer,
  table: TableRenderer,
  bar: BarRenderer,
  area: AreaRenderer,
  gauge: GaugeRenderer,
  scorecard: ScorecardRenderer,
  heatmap: HeatmapRenderer,
  pie: PieRenderer,
  'service-map': ServiceMapRenderer,
  'trace-waterfall': TraceWaterfallRenderer,
};

const SPECIALIZED_COMPONENT_KEYS = new Set([
  'log-histogram',
  'latency-histogram',
  'latency-heatmap',
  'ai-line',
  'ai-bar',
  'table',
  'bar',
  'area',
  'pie',
  'gauge',
  'scorecard',
  'heatmap',
  'service-map',
  'trace-waterfall',
]);

import {
  formatStatValue,
  resolveComponentData,
  resolveFieldValue,
  renderStatSummary,
  firstValue,
  strValue,
  numValue,
  resolveComponentKey,
  buildEndpointKey,
  groupTimeseries,
  buildQueueEndpoints,
  buildEndpointList,
  buildServiceListFromMetrics,
  defaultListTypeForChart,
  defaultListTitleForChart,
  buildGroupedListFromTimeseries,
} from './utils/dashboardAggregators';

interface ConfigurableChartCardProps {
  componentConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext: DashboardExtraContext;
}

/**
 *
 * @param root0
 * @param root0.componentConfig
 * @param root0.dataSources
 * @param root0.extraContext
 */
export default function ConfigurableChartCard({
  componentConfig,
  dataSources,
  extraContext,
}: ConfigurableChartCardProps) {
  const chartConfig = componentConfig;
  const componentKey = resolveComponentKey(chartConfig);

  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);

  const toggleEndpoint = (key: string) => {
    setSelectedEndpoints((prev) => (
      prev.includes(key)
        ? prev.filter((currentKey) => currentKey !== key)
        : [...prev, key]
    ));
  };

  const titleContent = chartConfig.titleIcon ? (
    <span>
      {getDashboardIcon(chartConfig.titleIcon as string, 16)}
      <span style={{ marginLeft: 8 }}>{chartConfig.title as string}</span>
    </span>
  ) : chartConfig.title;

  const componentRenderer = componentKey ? DASHBOARD_COMPONENT_MAP[componentKey] : undefined;
  const rawData = resolveComponentData(chartConfig, dataSources);

  if (componentKey === 'stat-card') {
    const value = resolveFieldValue(rawData, chartConfig.valueField as string | undefined);
    const displayValue =
      typeof value === 'string' || typeof value === 'number'
        ? value
        : String(value ?? '');
    const icon = chartConfig.titleIcon
      ? getDashboardIcon(String(chartConfig.titleIcon), 20)
      : undefined;
    return (
      <StatCard
        metric={{
          title: String(chartConfig.title || ''),
          value: displayValue,
          formatter: (val) => formatStatValue(chartConfig.formatter as string | undefined, val),
        }}
        visuals={{
          icon: icon ?? undefined,
        }}
      />
    );
  }

  if (componentKey === 'stat') {
    return (
      <Card title={titleContent} className="chart-card" style={{ height: '100%' }} styles={{ body: { padding: '12px 16px' } }}>
        {renderStatSummary(rawData)}
      </Card>
    );
  }

  if (!componentRenderer) {
    console.warn(`Unknown dashboard component key received from backend: ${componentKey || '<empty>'}`);
    return (
      <Card title={chartConfig.title as string} className="chart-card" style={{ height: '100%' }}>
        <div style={{ padding: 20, color: 'var(--text-muted)' }}>
          Unknown dashboard component key: {componentKey || '<empty>'}
        </div>
      </Card>
    );
  }

  if (SPECIALIZED_COMPONENT_KEYS.has(componentKey)) {
    const SpecializedRenderer = componentRenderer;
    return (
      <Card title={titleContent} className="chart-card" style={{ height: '100%' }} styles={{ body: { padding: '8px', display: 'flex', flexDirection: 'column' } }}>
        <SpecializedRenderer
          chartConfig={chartConfig}
          dataSources={dataSources}
          extraContext={extraContext}
        />
      </Card>
    );
  }

  const ChartComponent = componentRenderer as ComponentType<BaseChartComponentProps>;
  const timeseriesData = (chartConfig.dataKey
    ? (Array.isArray((rawData as any)?.[chartConfig.dataKey as string])
      ? (rawData as any)[chartConfig.dataKey as string]
      : [])
    : (Array.isArray(rawData) ? rawData : [])) as any[];

  const serviceTimeseriesMap = useMemo(() => {
    if (chartConfig.groupByKey) {
      return groupTimeseries(timeseriesData, chartConfig.groupByKey as string);
    }
    const endpointDataSourceId = chartConfig.endpointDataSource;
    if (endpointDataSourceId && dataSources?.[endpointDataSourceId as string]) {
      const endpointData = Array.isArray(dataSources[endpointDataSourceId as string])
        ? dataSources[endpointDataSourceId as string]
        : [];
      return groupTimeseries(endpointData as any[], 'endpoint');
    }
    return {};
  }, [timeseriesData, dataSources, chartConfig]);

  const endpoints = useMemo(() => {
    if (chartConfig.groupByKey === 'queue') {
      const topQueues = (rawData as any)?.topQueues;
      return buildQueueEndpoints(
        topQueues,
        (chartConfig.listSortField as string) || (chartConfig.valueKey as string),
        (chartConfig.listType as string) || 'default',
      );
    }

    const metricsSourceId = chartConfig.endpointMetricsSource;
    if (metricsSourceId && dataSources?.[metricsSourceId as string]) {
      const metricsData = Array.isArray(dataSources[metricsSourceId as string])
        ? dataSources[metricsSourceId as string]
        : [];
      const listType = defaultListTypeForChart(chartConfig);
      const metricEndpoints = chartConfig.groupByKey === 'service'
        ? buildServiceListFromMetrics(metricsData as any[], listType)
        : buildEndpointList(metricsData as any[], listType);
      if (metricEndpoints.length > 0) {
        return metricEndpoints;
      }
    }

    if (chartConfig.groupByKey) {
      return buildGroupedListFromTimeseries(serviceTimeseriesMap, chartConfig);
    }

    return [];
  }, [rawData, dataSources, serviceTimeseriesMap, chartConfig]);

  const chartProps: BaseChartComponentProps = {
    serviceTimeseriesMap,
    endpoints,
    selectedEndpoints,
  };

  if (chartConfig.valueKey) chartProps.valueKey = chartConfig.valueKey as string;
  if (chartConfig.datasetLabel) chartProps.datasetLabel = chartConfig.datasetLabel as string;
  if (chartConfig.color) chartProps.color = chartConfig.color as string;
  if (chartConfig.targetThreshold != null) chartProps.targetThreshold = Number(chartConfig.targetThreshold);

  if (!chartConfig.groupByKey && !chartConfig.endpointDataSource) {
    chartProps.data = timeseriesData.map((d: any) => ({
      timestamp: firstValue(d, ['timestamp', 'time_bucket', 'timeBucket'], ''),
      value: (() => {
        const explicit = firstValue(
          d,
          [
            (chartConfig.valueField as string)
            || (chartConfig.valueKey as string)
            || 'value',
            'value',
          ],
          null,
        );
        if (explicit !== null && explicit !== undefined && explicit !== '') {
          const parsed = Number(explicit);
          return Number.isFinite(parsed) ? parsed : 0;
        }

        if (componentKey === 'request') {
          return numValue(d, ['request_count', 'requestCount'], 0);
        }
        if (componentKey === 'error-rate') {
          const total = numValue(d, ['request_count', 'requestCount'], 0);
          const errors = numValue(d, ['error_count', 'errorCount'], 0);
          if (total > 0) return (errors * 100.0) / total;
          return numValue(d, ['error_rate', 'errorRate'], 0);
        }
        if (componentKey === 'latency') {
          return numValue(d, ['avg_latency', 'avgLatency', 'avg_latency_ms', 'avgLatencyMs', 'p50_latency', 'p50Latency', 'p50'], 0);
        }
        return 0;
      })(),
      ...(componentKey === 'latency' ? {
        p50: firstValue(d, ['p50_latency', 'p50Latency', 'p50', 'avg_latency_ms', 'avgLatencyMs'], 0),
        p95: firstValue(d, ['p95_latency', 'p95Latency', 'p95', 'p95_latency_ms'], 0),
        p99: firstValue(d, ['p99_latency', 'p99Latency', 'p99'], 0),
      } : {}),
    }));
  }

  const isQueueChart = chartConfig.groupByKey === 'queue';
  const endpointListType = !isQueueChart ? defaultListTypeForChart(chartConfig) : null;
  const showEndpointList = !isQueueChart && endpoints.length > 0 && !!endpointListType;
  const showQueueList = isQueueChart && endpoints.length > 0;

  return (
    <Card title={titleContent} className="chart-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }} styles={{ body: { padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 260 } }}>
      <div style={{ flex: 1, width: '100%' }}>
        <ChartComponent {...chartProps} />
      </div>
      {showEndpointList && (
        <TopEndpointsList
          title={String(defaultListTitleForChart(chartConfig))}
          type={endpointListType as any}
          endpoints={endpoints}
          selectedEndpoints={selectedEndpoints}
          onToggle={toggleEndpoint}
        />
      )}
      {showQueueList && (
        <QueueMetricsList
          type={chartConfig.listType as any}
          title={String(chartConfig.listTitle || chartConfig.listType || '')}
          queues={endpoints}
          selectedQueues={selectedEndpoints}
          onToggle={toggleEndpoint}
        />
      )}
    </Card>
  );
}
