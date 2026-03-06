import { Card } from 'antd';
import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';

import ErrorRateChart from '@components/charts/time-series/ErrorRateChart';
import LatencyChart from '@components/charts/time-series/LatencyChart';
import RequestChart from '@components/charts/time-series/RequestChart';
import QueueMetricsList from '@components/common/data-display/QueueMetricsList';
import TopEndpointsList from '@components/common/data-display/TopEndpointsList';
import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

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
  'gauge',
  'scorecard',
  'heatmap',
  'service-map',
  'trace-waterfall',
]);

function firstValue(row: any, keys: string[], fallback: any = '') {
  if (!row || typeof row !== 'object') return fallback;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
}

function strValue(row: any, keys: string[], fallback: string = '') {
  const value = firstValue(row, keys, fallback);
  return value == null ? fallback : String(value);
}

function numValue(row: any, keys: string[], fallback: number = 0) {
  const value = firstValue(row, keys, fallback);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveComponentKey(chartConfig: DashboardComponentSpec): string {
  if (typeof chartConfig.componentKey === 'string' && chartConfig.componentKey.length > 0) {
    return chartConfig.componentKey;
  }
  if (typeof chartConfig.type === 'string' && chartConfig.type.length > 0) {
    return chartConfig.type;
  }
  return '';
}

function buildEndpointKey(row: any) {
  const method = strValue(row, ['http_method', 'httpMethod']).toUpperCase();
  const op = strValue(row, ['operation_name', 'operationName', 'endpoint_name', 'endpointName'], 'Unknown');
  const cleanOp = op.startsWith(`${method} `) ? op.substring(method.length + 1) : op;
  const serviceName = strValue(row, ['service_name', 'serviceName']);
  return `${method} ${cleanOp}_${serviceName}`;
}

function groupTimeseries(rows: any[], groupByKey: string) {
  const map: Record<string, any[]> = {};
  for (const row of rows) {
    const serviceName = strValue(row, ['service_name', 'serviceName']);
    const queueName = strValue(row, ['queue_name', 'queueName', 'queue'], 'unknown');
    const tableName = strValue(row, ['table_name', 'tableName', 'table'], 'unknown');
    const podName = strValue(row, ['pod', 'pod_name', 'podName']);
    let key;
    if (groupByKey === 'queue') {
      key = `${queueName || 'unknown'}::${serviceName || 'unknown'}`;
    } else if (groupByKey === 'table') {
      key = tableName;
    } else if (groupByKey === 'service') {
      key = serviceName;
    } else if (groupByKey === 'pod') {
      key = podName;
    } else if (groupByKey === 'endpoint') {
      key = buildEndpointKey(row);
    } else {
      key = serviceName || queueName || '';
    }
    if (!key) continue;
    if (!map[key]) map[key] = [];
    map[key].push(row);
  }
  return map;
}

function buildQueueEndpoints(topQueues: any[], sortField: string, scope: string) {
  if (!Array.isArray(topQueues)) return [];
  const queueSeriesKey = (queue: any) => `${strValue(queue, ['queue_name', 'queueName'], 'unknown')}::${strValue(queue, ['service_name', 'serviceName'], 'unknown')}`;
  return [...topQueues]
    .sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0))
    .map((queue) => ({
      ...queue,
      endpoint: strValue(queue, ['queue_name', 'queueName'], 'unknown'),
      seriesKey: queueSeriesKey(queue),
      key: `${scope}::${queueSeriesKey(queue)}`,
    }));
}

function buildEndpointList(endpointMetrics: any[], listType: string) {
  if (!Array.isArray(endpointMetrics) || endpointMetrics.length === 0) return [];

  const mapped = endpointMetrics.map((endpoint) => {
    const method = strValue(endpoint, ['http_method', 'httpMethod']).toUpperCase();
    const op = strValue(endpoint, ['operation_name', 'operationName', 'endpoint_name', 'endpointName'], 'Unknown');
    const cleanOp = op.startsWith(`${method} `) ? op.substring(method.length + 1) : op;
    const serviceName = strValue(endpoint, ['service_name', 'serviceName']);
    const requestCount = numValue(endpoint, ['request_count', 'requestCount']);
    const errorCount = numValue(endpoint, ['error_count', 'errorCount']);
    const avgLatency = numValue(endpoint, ['avg_latency', 'avgLatency']);
    return {
      ...endpoint,
      endpoint: `${method} ${cleanOp}`,
      service_name: serviceName,
      service: serviceName,
      request_count: requestCount,
      error_count: errorCount,
      avg_latency: avgLatency,
      latency: avgLatency,
      key: `${method} ${cleanOp}_${serviceName || ''}`,
      errorRate: requestCount > 0 ? (errorCount / requestCount) * 100 : 0,
    };
  });

  if (listType === 'errorRate') {
    return mapped.filter((endpoint) => endpoint.errorRate > 0).sort((a, b) => b.errorRate - a.errorRate).slice(0, 10);
  }
  if (listType === 'latency') {
    return mapped.sort((a, b) => (b.avg_latency || 0) - (a.avg_latency || 0)).slice(0, 10);
  }
  return mapped.sort((a, b) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 10);
}

function buildServiceListFromMetrics(serviceMetrics: any[], listType: string) {
  if (!Array.isArray(serviceMetrics) || serviceMetrics.length === 0) return [];

  const mapped = serviceMetrics
    .map((service) => {
      const name = strValue(service, ['service_name', 'serviceName', 'service'], '');
      if (!name) return null;
      const requestCount = numValue(service, ['request_count', 'requestCount']);
      const errorCount = numValue(service, ['error_count', 'errorCount']);
      const avgLatency = numValue(service, ['avg_latency', 'avgLatency']);
      const errorRate = requestCount > 0 ? (errorCount * 100.0) / requestCount : 0;
      return {
        ...service,
        service_name: name,
        endpoint: name,
        service: name,
        key: name,
        request_count: requestCount,
        error_count: errorCount,
        errorRate,
        latency: avgLatency,
      };
    })
    .filter(Boolean);

  if (listType === 'errorRate') {
    return mapped.filter((service: any) => service.errorRate > 0).sort((a: any, b: any) => b.errorRate - a.errorRate).slice(0, 10);
  }
  if (listType === 'latency') {
    return mapped.sort((a: any, b: any) => (b.latency || 0) - (a.latency || 0)).slice(0, 10);
  }
  return mapped.sort((a: any, b: any) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 10);
}

function defaultListTypeForChart(chartConfig: DashboardComponentSpec) {
  if (chartConfig.endpointListType) return chartConfig.endpointListType;

  const componentKey = resolveComponentKey(chartConfig);
  if (componentKey === 'error-rate') return 'errorRate';
  if (componentKey === 'latency') return 'latency';
  return 'requests';
}

function defaultListTitleForChart(chartConfig: DashboardComponentSpec) {
  if (chartConfig.listTitle) return chartConfig.listTitle;
  const listType = defaultListTypeForChart(chartConfig);
  if (listType === 'errorRate') return 'Average Error Rate';
  if (listType === 'latency') return 'Average Latency';
  if (listType === 'requests') return 'Requests';
  return listType;
}

function buildGroupedListFromTimeseries(serviceTimeseriesMap: Record<string, any[]>, chartConfig: DashboardComponentSpec) {
  const listType = defaultListTypeForChart(chartConfig);
  const valueKey = chartConfig.valueKey || 'request_count';

  const rows = Object.entries(serviceTimeseriesMap || {})
    .map(([groupName, groupRows]) => {
      if (!groupName || !Array.isArray(groupRows) || groupRows.length === 0) return null;

      let requestCount = 0;
      let errorCount = 0;
      let latencySum = 0;
      let latencyCount = 0;
      let valueTotal = 0;

      for (const row of groupRows) {
        const req = numValue(row, ['request_count', 'requestCount']);
        const err = numValue(row, ['error_count', 'errorCount']);
        if (!Number.isNaN(req)) requestCount += req;
        if (!Number.isNaN(err)) errorCount += err;

        const latencyVal = numValue(row, ['avg_latency', 'avgLatency', 'avg_duration_ms', 'avgDurationMs', valueKey], 0);
        if (!Number.isNaN(latencyVal) && latencyVal > 0) {
          latencySum += latencyVal;
          latencyCount += 1;
        }

        const value = numValue(row, [valueKey], 0);
        if (!Number.isNaN(value)) valueTotal += value;
      }

      const errorRate = requestCount > 0 ? (errorCount * 100.0) / requestCount : 0;
      const latency = latencyCount > 0 ? latencySum / latencyCount : 0;

      return {
        endpoint: groupName,
        service: groupName,
        key: groupName,
        request_count: valueTotal > 0 ? valueTotal : requestCount,
        error_count: errorCount,
        errorRate,
        latency,
        value: valueTotal,
      };
    })
    .filter(Boolean) as any[];

  if (listType === 'errorRate') {
    return rows.filter((row) => row.errorRate > 0).sort((a, b) => b.errorRate - a.errorRate).slice(0, 10);
  }
  if (listType === 'latency') {
    return rows.sort((a, b) => (b.latency || 0) - (a.latency || 0)).slice(0, 10);
  }
  return rows.sort((a, b) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 10);
}

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
  if (!componentRenderer) {
    console.warn(`Unknown dashboard component key received from backend: ${componentKey || '<empty>'}`);
    return (
      <Card title={chartConfig.title as string} className="chart-card">
        <div style={{ padding: 20, color: 'var(--text-muted)' }}>
          Unknown dashboard component key: {componentKey || '<empty>'}
        </div>
      </Card>
    );
  }

  if (SPECIALIZED_COMPONENT_KEYS.has(componentKey)) {
    const SpecializedRenderer = componentRenderer;
    return (
      <Card title={titleContent} className="chart-card" styles={{ body: { padding: '8px' } }}>
        <SpecializedRenderer
          chartConfig={chartConfig}
          dataSources={dataSources}
          extraContext={extraContext}
        />
      </Card>
    );
  }

  const ChartComponent = componentRenderer as ComponentType<BaseChartComponentProps>;
  const dataSourceId = chartConfig.dataSource as string | undefined;
  const rawData = dataSourceId ? dataSources?.[dataSourceId] : undefined;
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

  const chartHeight = Number(chartConfig.height || 280);
  const isQueueChart = chartConfig.groupByKey === 'queue';
  const endpointListType = !isQueueChart ? defaultListTypeForChart(chartConfig) : null;
  const showEndpointList = !isQueueChart && endpoints.length > 0 && !!endpointListType;
  const showQueueList = isQueueChart && endpoints.length > 0;

  return (
    <Card title={titleContent} className="chart-card" styles={{ body: { padding: '8px' } }}>
      <div style={{ height: chartHeight }}>
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
