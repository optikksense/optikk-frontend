import type {
  DashboardPanelSpec,
  DashboardDataSources,
  DashboardPanelType,
  DashboardRecord,
} from '@/types/dashboardConfig';

import { formatBytes, formatDuration, formatNumber } from '@shared/utils/formatters';
import {
  asDashboardRecord,
  asDashboardRecordArray,
  getDashboardRecordArrayField,
  getDashboardValue,
} from './runtimeValue';

/**
 *
 */
export function formatStatValue(formatter: string | undefined, value: unknown): string | number {
  switch (formatter) {
    case 'ms':
      return formatDuration(typeof value === 'string' || typeof value === 'number' ? value : 0);
    case 'bytes':
      return formatBytes(Number(value) || 0);
    case 'percent1':
      return `${Number(value || 0).toFixed(1)}%`;
    case 'percent2':
      return `${Number(value || 0).toFixed(2)}%`;
    case 'number':
      return formatNumber(Number(value) || 0);
    default:
      return typeof value === 'number' ? value : String(value ?? '0');
  }
}

/**
 *
 */
export function resolveComponentData(
  chartConfig: DashboardPanelSpec,
  dataSources: DashboardDataSources
) {
  const dataSourceId = chartConfig.dataSource || chartConfig.id;
  return dataSourceId ? dataSources?.[dataSourceId] : undefined;
}

/**
 *
 */
export function normalizeDashboardRows(rawData: unknown, dataKey?: string): DashboardRecord[] {
  if (dataKey) {
    return getDashboardRecordArrayField(rawData, dataKey);
  }

  if (Array.isArray(rawData)) {
    return asDashboardRecordArray(rawData);
  }

  return getDashboardRecordArrayField(rawData, 'data');
}

/**
 *
 */
export function resolveFieldValue(raw: unknown, field: string | undefined): unknown {
  if (!field) return 0;
  if (field === '_count') {
    return Array.isArray(raw) ? raw.length : 0;
  }
  if (Array.isArray(raw)) {
    const first = asDashboardRecordArray(raw)[0];
    return first?.[field] ?? 0;
  }
  return getDashboardValue(raw, field) ?? 0;
}

/**
 *
 */
interface StatSummaryField {
  label: string;
  field?: string;
  keys?: string[];
}

export type EndpointListType = 'requests' | 'errorRate' | 'latency' | 'count';

interface GroupedEndpointListRow {
  endpoint: string;
  service: string;
  key: string;
  request_count: number;
  error_count: number;
  errorRate: number;
  latency: number;
  value: number;
  [key: string]: string | number;
}

function isEndpointListType(value: string): value is EndpointListType {
  return value === 'requests' || value === 'errorRate' || value === 'latency' || value === 'count';
}

export function renderStatSummary(
  rawData: unknown,
  options?: {
    formatter?: string;
    fields?: StatSummaryField[];
  }
) {
  const summary = Array.isArray(rawData)
    ? asDashboardRecordArray(rawData)[0]
    : asDashboardRecord(rawData);
  if (!summary) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
        No data
      </div>
    );
  }

  const defaultFields: StatSummaryField[] = [
    { label: 'P50', keys: ['p50', 'p50_ms', 'p50Latency', 'p50_latency'] },
    { label: 'P95', keys: ['p95', 'p95_ms', 'p95Latency', 'p95_latency'] },
    { label: 'P99', keys: ['p99', 'p99_ms', 'p99Latency', 'p99_latency'] },
    { label: 'Avg', keys: ['avg', 'avg_ms', 'avgLatency', 'avg_latency'] },
  ];
  const fields = options?.fields && options.fields.length > 0 ? options.fields : defaultFields;

  const cells = fields
    .map((field) => ({
      label: field.label,
      value: field.field
        ? firstValue(summary, [field.field], null)
        : firstValue(summary, field.keys ?? [], null),
    }))
    .filter((cell) => cell.value !== null && cell.value !== undefined);

  if (cells.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
        No data
      </div>
    );
  }

  const formatter = options?.formatter ?? (fields === defaultFields ? 'ms' : undefined);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: 12 }}>
      {cells.map((cell) => (
        <div key={cell.label} style={{ padding: '8px 0' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cell.label}</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            {formatStatValue(formatter, cell.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 *
 */
export function firstValue(row: unknown, keys: string[], fallback: unknown = ''): unknown {
  const record = asDashboardRecord(row);
  if (!record) return fallback;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
}

/**
 *
 */
export function strValue(row: unknown, keys: string[], fallback: string = '') {
  const value = firstValue(row, keys, fallback);
  return value == null ? fallback : String(value);
}

/**
 *
 */
export function numValue(row: unknown, keys: string[], fallback: number = 0) {
  const value = firstValue(row, keys, fallback);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 *
 */
export function resolveComponentKey(chartConfig: DashboardPanelSpec): DashboardPanelType {
  return chartConfig.panelType;
}

/**
 *
 */
export function buildEndpointKey(row: DashboardRecord) {
  const method = strValue(row, ['http_method', 'httpMethod']).toUpperCase();
  const op = strValue(
    row,
    ['operation_name', 'operationName', 'endpoint_name', 'endpointName'],
    'Unknown'
  );
  const cleanOp = op.startsWith(`${method} `) ? op.substring(method.length + 1) : op;
  const serviceName = strValue(row, ['service_name', 'serviceName']);
  return `${method} ${cleanOp}_${serviceName}`;
}

/**
 *
 */
export function groupTimeseries(
  rows: DashboardRecord[],
  groupByKey: string
): Record<string, DashboardRecord[]> {
  const map: Record<string, DashboardRecord[]> = {};
  for (const row of rows) {
    const serviceName = strValue(row, ['service_name', 'serviceName']);
    const queueName = strValue(row, ['queue_name', 'queueName', 'queue'], 'unknown');
    const tableName = strValue(row, ['table_name', 'tableName', 'table'], 'unknown');
    const podName = strValue(row, ['pod', 'pod_name', 'podName']);
    const exceptionType = strValue(row, ['exceptionType', 'exception_type'], 'unknown');
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
    } else if (groupByKey === 'exceptionType') {
      key = exceptionType;
    } else {
      const directValue = strValue(row, [groupByKey], '');
      key = directValue || serviceName || queueName || '';
    }
    if (!key) continue;
    if (!map[key]) map[key] = [];
    map[key].push(row);
  }
  return map;
}

/**
 *
 */
export function buildQueueEndpoints(
  topQueues: DashboardRecord[],
  sortField: string,
  scope: string
) {
  if (!Array.isArray(topQueues)) return [];
  const queueSeriesKey = (queue: any) =>
    `${strValue(queue, ['queue_name', 'queueName'], 'unknown')}::${strValue(queue, ['service_name', 'serviceName'], 'unknown')}`;
  return [...topQueues]
    .sort((a, b) => Number(b[sortField] || 0) - Number(a[sortField] || 0))
    .map((queue) => ({
      ...queue,
      endpoint: strValue(queue, ['queue_name', 'queueName'], 'unknown'),
      seriesKey: queueSeriesKey(queue),
      key: `${scope}::${queueSeriesKey(queue)}`,
    }));
}

/**
 *
 */
export function buildEndpointList(endpointMetrics: any[], listType: string) {
  if (!Array.isArray(endpointMetrics) || endpointMetrics.length === 0) return [];

  const mapped = endpointMetrics.map((endpoint) => {
    const method = strValue(endpoint, ['http_method', 'httpMethod']).toUpperCase();
    const op = strValue(
      endpoint,
      ['operation_name', 'operationName', 'endpoint_name', 'endpointName'],
      'Unknown'
    );
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
    return mapped
      .filter((endpoint) => endpoint.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);
  }
  if (listType === 'latency') {
    return mapped.sort((a, b) => (b.avg_latency || 0) - (a.avg_latency || 0)).slice(0, 10);
  }
  return mapped.sort((a, b) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 10);
}

/**
 *
 */
export function buildServiceListFromMetrics(serviceMetrics: any[], listType: string) {
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
    return mapped
      .filter((service: any) => service.errorRate > 0)
      .sort((a: any, b: any) => b.errorRate - a.errorRate)
      .slice(0, 10);
  }
  if (listType === 'latency') {
    return mapped.sort((a: any, b: any) => (b.latency || 0) - (a.latency || 0)).slice(0, 10);
  }
  return mapped
    .sort((a: any, b: any) => (b.request_count || 0) - (a.request_count || 0))
    .slice(0, 10);
}

/**
 *
 */
export function defaultListTypeForChart(chartConfig: DashboardPanelSpec): EndpointListType {
  if (chartConfig.endpointListType && isEndpointListType(chartConfig.endpointListType)) {
    return chartConfig.endpointListType;
  }

  const componentKey = resolveComponentKey(chartConfig);
  if (componentKey === 'error-rate') return 'errorRate';
  if (componentKey === 'latency') return 'latency';
  if (componentKey === 'exception-type-line') return 'count';
  return 'requests';
}

/**
 *
 */
export function defaultListTitleForChart(chartConfig: DashboardPanelSpec) {
  if (chartConfig.listTitle) return chartConfig.listTitle;
  const listType = defaultListTypeForChart(chartConfig);
  if (listType === 'errorRate') return 'Average Error Rate';
  if (listType === 'latency') return 'Average Latency';
  if (listType === 'count') return 'Count';
  if (listType === 'requests') return 'Requests';
  return listType;
}

/**
 *
 */
export function buildGroupedListFromTimeseries(
  serviceTimeseriesMap: Record<string, DashboardRecord[]>,
  chartConfig: DashboardPanelSpec
) {
  const listType = defaultListTypeForChart(chartConfig);
  const valueKey = chartConfig.valueKey || 'request_count';
  const groupByKey = String(chartConfig.groupByKey || 'group');

  const rows = Object.entries(serviceTimeseriesMap || {})
    .map<GroupedEndpointListRow | null>(([groupName, groupRows]) => {
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

        const latencyVal = numValue(
          row,
          ['avg_latency', 'avgLatency', 'avg_duration_ms', 'avgDurationMs', valueKey],
          0
        );
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
        service: chartConfig.groupByKey === 'service' ? groupName : '',
        key: groupName,
        [groupByKey]: groupName,
        request_count: valueTotal > 0 ? valueTotal : requestCount,
        error_count: errorCount,
        errorRate,
        latency,
        value: valueTotal,
      };
    })
    .filter((row): row is GroupedEndpointListRow => row !== null);

  if (listType === 'errorRate') {
    return rows
      .filter((row) => row.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);
  }
  if (listType === 'latency') {
    return rows.sort((a, b) => (b.latency || 0) - (a.latency || 0)).slice(0, 10);
  }
  return rows.sort((a, b) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 10);
}
