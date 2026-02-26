import { useMemo, useState } from 'react';
import { Row, Col, Card, Spin, Empty } from 'antd';
import {
  Activity, AlertCircle, Clock, Zap, Network, Layers,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Database,
  HardDrive, Cpu, Radio, Gauge, GitPullRequest, Target,
  BarChart3, Server, ShieldCheck, TrendingDown,
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import RequestChart from '@components/charts/time-series/RequestChart';
import ErrorRateChart from '@components/charts/time-series/ErrorRateChart';
import LatencyChart from '@components/charts/time-series/LatencyChart';
import LogHistogram, { LogHistogramPanel } from '@components/charts/distributions/LogHistogram';
import LatencyHistogram from '@components/charts/distributions/LatencyHistogram';
import LatencyHeatmapChart from '@components/charts/specialized/LatencyHeatmapChart';
import { TopEndpointsList, QueueMetricsList } from '@components/common';
import { createChartOptions, createLineDataset, createBarDataset, getChartColor } from '@utils/chartHelpers';

// Icon registry — maps string names to lucide-react components
const ICONS = {
  Activity, AlertCircle, Clock, Zap, Network, Layers,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Database,
  HardDrive, Cpu, Radio, Gauge, GitPullRequest, Target,
  BarChart3, Server, ShieldCheck, TrendingDown,
};

// Chart component registry (for standard chart types)
const CHART_COMPONENTS = {
  'request': RequestChart,
  'error-rate': ErrorRateChart,
  'latency': LatencyChart,
};

function firstValue(row, keys, fallback = '') {
  if (!row || typeof row !== 'object') return fallback;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
}

function strValue(row, keys, fallback = '') {
  const value = firstValue(row, keys, fallback);
  return value == null ? fallback : String(value);
}

function numValue(row, keys, fallback = 0) {
  const value = firstValue(row, keys, fallback);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// ─── Specialized chart renderers ─────────────────────────────────────────────

/** log-histogram: renders LogHistogram directly from a histogram data array */
function LogHistogramRenderer({ chartConfig, dataSources }) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const data = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  const height = chartConfig.height || 120;
  return data.length > 0
    ? <LogHistogram data={data} height={height} />
    : <Empty description="No log data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
}

/** latency-histogram: renders LatencyHistogram from trace-like objects */
function LatencyHistogramRenderer({ chartConfig, dataSources }) {
  const rawData = dataSources?.[chartConfig.dataSource];
  // Accepts either flat trace array or backend histogram bucket array
  const traces = useMemo(() => {
    const arr = Array.isArray(rawData) ? rawData : [];
    // If data already has duration_ms / durationMs, use as traces
    if (arr.length > 0 && (arr[0].duration_ms != null || arr[0].durationMs != null)) return arr;
    // Otherwise interpret as bucket data: convert to fake traces
    const bucketMidpoint = (b) => ({
      '0_10ms': 5, '10_25ms': 17, '25_50ms': 37, '50_100ms': 75,
      '100_250ms': 175, '250_500ms': 375, '500ms_1s': 750,
      '1s_2500ms': 1750, '2500ms_5s': 3750, 'gt_5s': 7000,
    })[b] ?? 0;
    return arr.flatMap((bucket) => {
      const count = Number(bucket.span_count) || 0;
      return Array(count).fill({ duration_ms: bucketMidpoint(bucket.bucket) });
    });
  }, [rawData]);

  const height = chartConfig.height || 160;
  return <LatencyHistogram traces={traces} height={height} />;
}

/** latency-heatmap: renders LatencyHeatmapChart */
function LatencyHeatmapRenderer({ chartConfig, dataSources }) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const data = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  return <LatencyHeatmapChart data={data} />;
}

/** Build multi-series line/bar data from a flat timeseries array grouped by a key */
function buildAiTimeseries(rows, metricKey, groupKey = 'model_name', filterValue = null) {
  const arr = Array.isArray(rows) ? rows : [];
  const filtered = filterValue ? arr.filter((r) => r[groupKey] === filterValue) : arr;
  const tsSet = new Set();
  const groupSet = new Set();
  for (const row of filtered) {
    if (row[metricKey] != null && row[metricKey] !== '' && row[metricKey] !== 0) {
      tsSet.add(row.timestamp);
      groupSet.add(row[groupKey] || 'unknown');
    }
  }
  const timestamps = Array.from(tsSet).sort((a, b) => new Date(a) - new Date(b));
  const groups = Array.from(groupSet);
  const lookup = {};
  for (const row of filtered) {
    const g = row[groupKey] || 'unknown';
    if (!lookup[g]) lookup[g] = {};
    const n = Number(row[metricKey]);
    lookup[g][row.timestamp] = isNaN(n) ? null : Math.round(n * 100000) / 100000;
  }
  const labels = timestamps.map((ts) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });
  const datasets = groups.map((g, i) =>
    createLineDataset(g, timestamps.map((ts) => lookup[g]?.[ts] ?? null), getChartColor(i), false)
  );
  return { labels, datasets, hasData: datasets.length > 0 };
}

/** ai-line: multi-series line chart — used by AiObservabilityPage tabs */
function AiLineRenderer({ chartConfig, dataSources, extraContext }) {
  const rawData = dataSources?.[chartConfig.dataSource];
  const rows = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  const chartData = useMemo(() => buildAiTimeseries(
    rows,
    chartConfig.valueKey,
    chartConfig.groupByKey || 'model_name',
    extraContext?.selectedModel || null,
  ), [rows, chartConfig.valueKey, chartConfig.groupByKey, extraContext?.selectedModel]);

  const height = chartConfig.height || 220;

  const tickCallback = chartConfig.yPrefix
    ? (v) => `${chartConfig.yPrefix}${Number(v).toFixed(chartConfig.yDecimals ?? 2)}`
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

/** ai-bar: grouped/stacked bar chart — used for histograms and breakdowns */
function AiBarRenderer({ chartConfig, dataSources, extraContext }) {
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
    const filtered = filterValue ? rows.filter((r) => r[groupKey] === filterValue) : rows;
    if (!filtered.length) return null;

    // Multiple valueKeys → stacked datasets
    if (chartConfig.valueKeys && chartConfig.valueKeys.length > 0) {
      const labels = filtered.map((r) => r[labelKey] || 'unknown');
      const datasets = chartConfig.valueKeys.map((vk, i) => ({
        label: vk.replace(/_/g, ' '),
        data: filtered.map((r) => { const n = Number(r[vk]); return isNaN(n) ? 0 : n; }),
        backgroundColor: `${getChartColor(i)}CC`,
        borderColor: getChartColor(i),
        borderWidth: 1,
        borderRadius: stacked ? 0 : 2,
      }));
      return { labels, datasets, hasData: true };
    }

    // Single valueKey — grouped by bucketKey or labelKey
    if (chartConfig.bucketKey) {
      // histogram style: group by groupKey, x = bucketKey
      const groups = {};
      for (const row of filtered) {
        const g = row[groupKey] || 'unknown';
        if (!groups[g]) groups[g] = {};
        groups[g][row[chartConfig.bucketKey]] = Number(row[chartConfig.valueKey]) || 0;
      }
      const allBuckets = Array.from(new Set(filtered.map((r) => r[chartConfig.bucketKey]))).sort((a, b) => a - b);
      const labels = allBuckets.map((b) => `${b}ms`);
      const datasets = Object.keys(groups).map((g, i) =>
        createBarDataset(g, allBuckets.map((b) => groups[g][b] ?? 0), getChartColor(i))
      );
      return { labels, datasets, hasData: datasets.length > 0 };
    }

    // Simple bar: one bar per row, value = valueKey
    const labels = filtered.map((r) => r[labelKey] || 'unknown');
    const color = chartConfig.color || getChartColor(0);
    const datasets = [createBarDataset(
      chartConfig.datasetLabel || chartConfig.valueKey || 'Value',
      filtered.map((r) => { const n = Number(r[chartConfig.valueKey]); return isNaN(n) ? 0 : n; }),
      color,
    )];
    return { labels, datasets, hasData: true };
  }, [rows, filterValue, groupKey, labelKey, stacked, chartConfig]);

  if (!chartData || !chartData.hasData) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }

  const height = chartConfig.height || 220;
  const tickCallback = chartConfig.yPrefix
    ? (v) => `${chartConfig.yPrefix}${Number(v).toFixed(chartConfig.yDecimals ?? 4)}`
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

// Specialized chart type → renderer map
const SPECIALIZED_RENDERERS = {
  'log-histogram': LogHistogramRenderer,
  'latency-histogram': LatencyHistogramRenderer,
  'latency-heatmap': LatencyHeatmapRenderer,
  'ai-line': AiLineRenderer,
  'ai-bar': AiBarRenderer,
};

function getIcon(name, size = 16) {
  const IconComp = ICONS[name];
  if (!IconComp) return null;
  return <IconComp size={size} />;
}

/**
 * Builds an endpoint key from raw data — matches the format used across pages.
 */
function buildEndpointKey(row) {
  const method = strValue(row, ['http_method', 'httpMethod']).toUpperCase();
  const op = strValue(row, ['operation_name', 'operationName', 'endpoint_name', 'endpointName'], 'Unknown');
  const cleanOp = op.startsWith(method + ' ') ? op.substring(method.length + 1) : op;
  const serviceName = strValue(row, ['service_name', 'serviceName']);
  return `${method} ${cleanOp}_${serviceName}`;
}

/**
 * Groups a flat timeseries array into a serviceTimeseriesMap by a key strategy.
 */
function groupTimeseries(rows, groupByKey) {
  const map = {};
  for (const row of rows) {
    const serviceName = strValue(row, ['service_name', 'serviceName']);
    const queueName = strValue(row, ['queue_name', 'queueName'], 'unknown');
    const podName = strValue(row, ['pod', 'pod_name', 'podName']);
    let key;
    if (groupByKey === 'queue') {
      key = `${queueName || 'unknown'}::${serviceName || 'unknown'}`;
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

/**
 * Builds endpoint-like objects from timeseries data for queue-based charts.
 */
function buildQueueEndpoints(topQueues, sortField, scope) {
  if (!Array.isArray(topQueues)) return [];
  const queueSeriesKey = (q) => `${strValue(q, ['queue_name', 'queueName'], 'unknown')}::${strValue(q, ['service_name', 'serviceName'], 'unknown')}`;
  return [...topQueues]
    .sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0))
    .map((q) => ({
      ...q,
      seriesKey: queueSeriesKey(q),
      key: `${scope}::${queueSeriesKey(q)}`,
    }));
}

/**
 * Builds endpoint-like objects from metric data.
 */
function buildEndpointList(endpointMetrics, listType) {
  if (!Array.isArray(endpointMetrics) || endpointMetrics.length === 0) return [];

  const mapped = endpointMetrics.map((ep) => {
    const method = strValue(ep, ['http_method', 'httpMethod']).toUpperCase();
    const op = strValue(ep, ['operation_name', 'operationName', 'endpoint_name', 'endpointName'], 'Unknown');
    const cleanOp = op.startsWith(method + ' ') ? op.substring(method.length + 1) : op;
    const serviceName = strValue(ep, ['service_name', 'serviceName']);
    const requestCount = numValue(ep, ['request_count', 'requestCount']);
    const errorCount = numValue(ep, ['error_count', 'errorCount']);
    const avgLatency = numValue(ep, ['avg_latency', 'avgLatency']);
    return {
      ...ep,
      endpoint: `${method} ${cleanOp}`,
      service_name: serviceName,
      service: serviceName,
      request_count: requestCount,
      error_count: errorCount,
      avg_latency: avgLatency,
      key: `${method} ${cleanOp}_${serviceName || ''}`,
      errorRate: requestCount > 0 ? (errorCount / requestCount) * 100 : 0,
    };
  });

  if (listType === 'errorRate') {
    return mapped.filter((ep) => ep.errorRate > 0).sort((a, b) => b.errorRate - a.errorRate).slice(0, 10);
  }
  if (listType === 'latency') {
    return mapped.sort((a, b) => (b.avg_latency || 0) - (a.avg_latency || 0)).slice(0, 10);
  }
  // requests
  return mapped.sort((a, b) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 10);
}

function buildServiceListFromMetrics(serviceMetrics, listType) {
  if (!Array.isArray(serviceMetrics) || serviceMetrics.length === 0) return [];

  const mapped = serviceMetrics
    .map((svc) => {
      const name = strValue(svc, ['service_name', 'serviceName', 'service'], '');
      if (!name) return null;
      const requestCount = numValue(svc, ['request_count', 'requestCount']);
      const errorCount = numValue(svc, ['error_count', 'errorCount']);
      const avgLatency = numValue(svc, ['avg_latency', 'avgLatency']);
      const errorRate = requestCount > 0 ? (errorCount * 100.0) / requestCount : 0;
      return {
        ...svc,
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
    return mapped.filter((svc) => svc.errorRate > 0).sort((a, b) => b.errorRate - a.errorRate).slice(0, 10);
  }
  if (listType === 'latency') {
    return mapped.sort((a, b) => (b.latency || 0) - (a.latency || 0)).slice(0, 10);
  }
  return mapped.sort((a, b) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 10);
}

function defaultListTypeForChart(chartConfig) {
  if (chartConfig.endpointListType) return chartConfig.endpointListType;
  if (chartConfig.type === 'error-rate') return 'errorRate';
  if (chartConfig.type === 'latency') return 'latency';
  return 'requests';
}

function defaultListTitleForChart(chartConfig) {
  if (chartConfig.listTitle) return chartConfig.listTitle;
  const listType = defaultListTypeForChart(chartConfig);
  if (listType === 'errorRate') return 'Average Error Rate';
  if (listType === 'latency') return 'Average Latency';
  if (listType === 'requests') return 'Requests';
  return listType;
}

function buildGroupedListFromTimeseries(serviceTimeseriesMap, chartConfig) {
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
    .filter(Boolean);

  if (listType === 'errorRate') {
    return rows.filter((r) => r.errorRate > 0).sort((a, b) => b.errorRate - a.errorRate).slice(0, 10);
  }
  if (listType === 'latency') {
    return rows.sort((a, b) => (b.latency || 0) - (a.latency || 0)).slice(0, 10);
  }
  return rows.sort((a, b) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 10);
}

/**
 * A single configurable chart card rendered from YAML config.
 */
function ConfigurableChartCard({ chartConfig, dataSources, extraContext }) {
  const [selectedEndpoints, setSelectedEndpoints] = useState([]);

  const toggleEndpoint = (key) => {
    setSelectedEndpoints((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Build title with optional icon (used by both specialized and standard charts)
  const titleContent = chartConfig.titleIcon ? (
    <span>
      {getIcon(chartConfig.titleIcon, 16)}
      <span style={{ marginLeft: 8 }}>{chartConfig.title}</span>
    </span>
  ) : chartConfig.title;

  // log-histogram renders as a bare Grafana-style panel — no card border
  if (chartConfig.type === 'log-histogram') {
    return (
      <LogHistogramPanel chartConfig={chartConfig} dataSources={dataSources} />
    );
  }

  // Check for other specialized renderers
  const SpecializedRenderer = SPECIALIZED_RENDERERS[chartConfig.type];
  if (SpecializedRenderer) {
    return (
      <Card title={titleContent} className="chart-card" styles={{ body: { padding: '8px' } }}>
        <SpecializedRenderer chartConfig={chartConfig} dataSources={dataSources} extraContext={extraContext} />
      </Card>
    );
  }

  const ChartComponent = CHART_COMPONENTS[chartConfig.type];
  if (!ChartComponent) {
    return (
      <Card title={chartConfig.title} className="chart-card">
        <div style={{ padding: 20, color: 'var(--text-muted)' }}>
          Unknown chart type: {chartConfig.type}
        </div>
      </Card>
    );
  }

  // Resolve data source
  const dataSourceId = chartConfig.dataSource;
  const rawData = dataSources?.[dataSourceId];

  // For nested data (e.g., messaging-queue returns {summary, timeseries, topQueues})
  const timeseriesData = chartConfig.dataKey
    ? (Array.isArray(rawData?.[chartConfig.dataKey]) ? rawData[chartConfig.dataKey] : [])
    : (Array.isArray(rawData) ? rawData : []);

  // Build serviceTimeseriesMap
  const serviceTimeseriesMap = useMemo(() => {
    if (chartConfig.groupByKey) {
      return groupTimeseries(timeseriesData, chartConfig.groupByKey);
    }
    // For endpoint-based charts, use the endpoint data source
    const endpointDsId = chartConfig.endpointDataSource;
    if (endpointDsId && dataSources?.[endpointDsId]) {
      const epData = Array.isArray(dataSources[endpointDsId]) ? dataSources[endpointDsId] : [];
      return groupTimeseries(epData, 'endpoint');
    }
    return {};
  }, [timeseriesData, dataSources, chartConfig]);

  // Build endpoints list
  const endpoints = useMemo(() => {
    if (chartConfig.groupByKey === 'queue') {
      const topQueues = rawData?.topQueues;
      return buildQueueEndpoints(topQueues, chartConfig.listSortField || chartConfig.valueKey, chartConfig.listType || 'default');
    }
    // For endpoint-metric-based lists
    const metricsSrcId = chartConfig.endpointMetricsSource;
    if (metricsSrcId && dataSources?.[metricsSrcId]) {
      const metricsData = Array.isArray(dataSources[metricsSrcId]) ? dataSources[metricsSrcId] : [];
      const listType = defaultListTypeForChart(chartConfig);
      const metricEndpoints = chartConfig.groupByKey === 'service'
        ? buildServiceListFromMetrics(metricsData, listType)
        : buildEndpointList(metricsData, listType);
      if (metricEndpoints.length > 0) {
        return metricEndpoints;
      }
    }
    // Grouped timeseries fallback (service/pod/etc.) when explicit metrics source isn't configured.
    if (chartConfig.groupByKey) {
      return buildGroupedListFromTimeseries(serviceTimeseriesMap, chartConfig);
    }
    return [];
  }, [rawData, dataSources, serviceTimeseriesMap, chartConfig]);

  // Build chart-specific props
  const chartProps = {
    serviceTimeseriesMap,
    endpoints,
    selectedEndpoints,
  };

  if (chartConfig.valueKey) chartProps.valueKey = chartConfig.valueKey;
  if (chartConfig.datasetLabel) chartProps.datasetLabel = chartConfig.datasetLabel;
  if (chartConfig.color) chartProps.color = chartConfig.color;
  if (chartConfig.targetThreshold != null) chartProps.targetThreshold = chartConfig.targetThreshold;

  // For charts that use direct data array (not serviceTimeseriesMap)
  if (!chartConfig.groupByKey && !chartConfig.endpointDataSource) {
    chartProps.data = timeseriesData.map((d) => ({
      timestamp: firstValue(d, ['timestamp', 'time_bucket', 'timeBucket'], ''),
      value: firstValue(d, [chartConfig.valueField || chartConfig.valueKey || 'value', 'value'], 0),
      ...(chartConfig.type === 'latency' ? {
        p50: firstValue(d, ['p50_latency', 'p50Latency', 'p50'], 0),
        p95: firstValue(d, ['p95_latency', 'p95Latency', 'p95'], 0),
        p99: firstValue(d, ['p99_latency', 'p99Latency', 'p99'], 0),
      } : {}),
    }));
  }

  const chartHeight = chartConfig.height || 280;

  // Determine which list component to use
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
          title={defaultListTitleForChart(chartConfig)}
          type={endpointListType}
          endpoints={endpoints}
          selectedEndpoints={selectedEndpoints}
          onToggle={toggleEndpoint}
        />
      )}
      {showQueueList && (
        <QueueMetricsList
          type={chartConfig.listType}
          title={chartConfig.listTitle || chartConfig.listType}
          queues={endpoints}
          selectedQueues={selectedEndpoints}
          onToggle={toggleEndpoint}
        />
      )}
    </Card>
  );
}

/**
 * ConfigurableDashboard renders a grid of charts from a parsed YAML config object.
 *
 * @param {Object} config - Parsed YAML config (from useDashboardConfig hook)
 * @param {Object} dataSources - Map of { dataSourceId: data } (fetched by parent page)
 * @param {boolean} isLoading - Whether data is still loading
 * @param {Object} extraContext - Optional extra context (selectedService, etc.)
 */
export default function ConfigurableDashboard({ config, dataSources = {}, isLoading = false, extraContext = {} }) {
  if (!config || !config.charts) return null;

  return (
    <Spin spinning={isLoading}>
      <Row gutter={[16, 16]}>
        {config.charts.map((chartConfig) => {
          const colSpan = chartConfig.layout?.col || 12;
          return (
            <Col
              key={chartConfig.id}
              xs={24}
              lg={colSpan}
            >
              <ConfigurableChartCard
                chartConfig={chartConfig}
                dataSources={dataSources}
                extraContext={extraContext}
              />
            </Col>
          );
        })}
      </Row>
    </Spin>
  );
}
