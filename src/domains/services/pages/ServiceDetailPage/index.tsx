import { APP_COLORS } from '@config/colorLiterals';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Skeleton, Tag, Tabs, Progress } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import PageHeader from '@components/common/layout/PageHeader';

import { v1Service } from '@services/v1Service';

import { useDashboardConfig } from '@hooks/useDashboardConfig';

import { useAppStore } from '@store/appStore';

import { formatNumber, formatDuration, formatTimestamp } from '@utils/formatters';

import { LOG_LEVELS } from '@config/constants';
import {
  ServiceDetailDependenciesTab,
  ServiceDetailErrorsTab,
  ServiceDetailLogsTab,
  ServiceDetailOverviewTab,
  ServiceDetailStatsRow,
} from '../../components/detail';

import type {
  ServiceDependency,
  ServiceEndpointRow,
  ServiceErrorGroupRow,
  ServiceLogRow,
  ServiceTimeSeriesPoint,
} from '../../types';

const n = (value: unknown): number => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

const normalizeEndpoint = (row: Record<string, unknown> = {}): ServiceEndpointRow => ({
  ...row,
  service_name: String(row.service_name ?? row.serviceName ?? ''),
  operation_name: String(row.operation_name ?? row.operationName ?? ''),
  http_method: String(row.http_method ?? row.httpMethod ?? ''),
  request_count: n(row.request_count ?? row.requestCount),
  error_count: n(row.error_count ?? row.errorCount),
  avg_latency: n(row.avg_latency ?? row.avgLatency),
  p95_latency: n(row.p95_latency ?? row.p95Latency),
  p99_latency: n(row.p99_latency ?? row.p99Latency),
});

const normalizeErrorGroup = (row: Record<string, unknown> = {}): ServiceErrorGroupRow => ({
  ...row,
  service_name: String(row.service_name ?? row.serviceName ?? ''),
  operation_name: String(row.operation_name ?? row.operationName ?? ''),
  status_message: String(row.status_message ?? row.statusMessage ?? ''),
  http_status_code: n(row.http_status_code ?? row.httpStatusCode),
  error_count: n(row.error_count ?? row.errorCount),
  last_occurrence: String(row.last_occurrence ?? row.lastOccurrence ?? ''),
  first_occurrence: String(row.first_occurrence ?? row.firstOccurrence ?? ''),
  sample_trace_id: String(row.sample_trace_id ?? row.sampleTraceId ?? ''),
});

const normalizeTimeSeriesPoint = (row: Record<string, unknown> = {}): ServiceTimeSeriesPoint => ({
  ...row,
  timestamp: String(row.timestamp ?? row.time_bucket ?? row.timeBucket ?? ''),
  service_name: String(row.service_name ?? row.serviceName ?? ''),
  operation_name: String(row.operation_name ?? row.operationName ?? ''),
  http_method: String(row.http_method ?? row.httpMethod ?? ''),
  request_count: n(row.request_count ?? row.requestCount),
  error_count: n(row.error_count ?? row.errorCount),
  avg_latency: n(row.avg_latency ?? row.avgLatency),
  p50: n(row.p50 ?? row.p50_latency ?? row.p50Latency),
  p95: n(row.p95 ?? row.p95_latency ?? row.p95Latency),
  p99: n(row.p99 ?? row.p99_latency ?? row.p99Latency),
});

const normalizeLog = (row: Record<string, unknown> = {}): ServiceLogRow => ({
  ...row,
  timestamp: String(row.timestamp ?? ''),
  level: String(row.level ?? 'INFO'),
  message: String(row.message ?? ''),
  trace_id: String(row.trace_id ?? row.traceId ?? ''),
  span_id: String(row.span_id ?? row.spanId ?? ''),
});

const normalizeDependency = (row: Record<string, unknown> = {}): ServiceDependency => ({
  ...row,
  source: String(row.source ?? ''),
  target: String(row.target ?? ''),
  call_count: n(row.call_count ?? row.callCount),
});

/**
 *
 */
export default function ServiceDetailPage() {
  const { serviceName: serviceNameParam } = useParams();
  const serviceName = serviceNameParam ?? '';
  const navigate = useNavigate();
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'errors' | 'logs' | 'dependencies'>('overview');
  const { config } = useDashboardConfig('service-detail');

  const { data: endpointData, isLoading: endpointsLoading } = useQuery({
    queryKey: ['endpoint-breakdown', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return v1Service.getEndpointBreakdown(selectedTeamId, startTime, endTime, serviceName);
    },
    enabled: !!selectedTeamId && serviceName.length > 0,
  });

  const { data: errorData, isLoading: errorsLoading } = useQuery({
    queryKey: ['error-groups', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return v1Service.getErrorGroups(selectedTeamId, startTime, endTime, serviceName);
    },
    enabled: !!selectedTeamId && serviceName.length > 0,
  });

  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['metrics-timeseries', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return v1Service.getMetricsTimeSeries(selectedTeamId, startTime, endTime, serviceName, '5m');
    },
    enabled: !!selectedTeamId && serviceName.length > 0,
  });

  // Fetch service logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['service-logs', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return v1Service.getLogs(selectedTeamId, startTime, endTime, {
        services: [serviceName],
        limit: 50,
        offset: 0,
      });
    },
    enabled: !!selectedTeamId && serviceName.length > 0 && activeTab === 'logs',
  });

  // Fetch service dependencies
  const { data: dependenciesData } = useQuery({
    queryKey: ['service-dependencies', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return v1Service.getServiceDependencies(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId && serviceName.length > 0 && activeTab === 'dependencies',
  });

  const endpoints = Array.isArray(endpointData)
    ? endpointData.map((row) => normalizeEndpoint((row as Record<string, unknown>) || {}))
    : [];
  const errorGroups = Array.isArray(errorData)
    ? errorData.map((row) => normalizeErrorGroup((row as Record<string, unknown>) || {}))
    : [];
  const timeSeries = Array.isArray(timeSeriesData)
    ? timeSeriesData.map((row) => normalizeTimeSeriesPoint((row as Record<string, unknown>) || {}))
    : [];
  const logsRaw = (logsData as { logs?: unknown[] } | undefined)?.logs;
  const logs = Array.isArray(logsRaw)
    ? logsRaw.map((row) => normalizeLog((row as Record<string, unknown>) || {}))
    : [];
  const dependencies = Array.isArray(dependenciesData)
    ? dependenciesData.map((row) => normalizeDependency((row as Record<string, unknown>) || {}))
    : [];
  const isLoading = endpointsLoading || errorsLoading || timeSeriesLoading;

  // Filter dependencies for this service
  const serviceDependencies = useMemo(() => {
    return dependencies.filter(
      (dependency: ServiceDependency) =>
        dependency.source === serviceName || dependency.target === serviceName,
    );
  }, [dependencies, serviceName]);

  const stats = useMemo(
    () =>
      endpoints.reduce(
        (
          accumulator: { totalRequests: number; totalErrors: number; latencies: number[]; p95Latencies: number[] },
          endpoint: ServiceEndpointRow,
        ) => {
          accumulator.totalRequests += endpoint.request_count || 0;
          accumulator.totalErrors += endpoint.error_count || 0;
          accumulator.latencies.push(endpoint.avg_latency || 0);
          accumulator.p95Latencies.push(endpoint.p95_latency || 0);
          return accumulator;
        },
        { totalRequests: 0, totalErrors: 0, latencies: [], p95Latencies: [] },
      ),
    [endpoints],
  );

  const errorRate = stats.totalRequests > 0 ? (stats.totalErrors / stats.totalRequests) * 100 : 0;

  const avgLatency =
    stats.latencies.length > 0
      ? stats.latencies.reduce((left: number, right: number) => left + right, 0) /
        stats.latencies.length
      : 0;

  const p95Latency = stats.p95Latencies.length > 0 ? Math.max(...stats.p95Latencies) : 0;

  // Build sparkline data from timeseries
  const requestsSparkline = useMemo(
    () => timeSeries.map((point: ServiceTimeSeriesPoint) => point.request_count || 0),
    [timeSeries],
  );

  const errorSparkline = useMemo(() => {
    return timeSeries.map((point: ServiceTimeSeriesPoint) => {
      const total = point.request_count || 0;
      const errors = point.error_count || 0;
      return total > 0 ? (errors / total) * 100 : 0;
    });
  }, [timeSeries]);

  const endpointColumns: any[] = [
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      width: 250,
      render: (text: any) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>,
    },
    {
      title: 'Method',
      dataIndex: 'http_method',
      key: 'http_method',
      width: 100,
      render: (method: any) => {
        const methodColors: Record<string, string> = {
          GET: 'blue',
          POST: 'green',
          PUT: 'orange',
          DELETE: 'red',
          PATCH: 'purple',
        };
        const normalizedMethod = String(method || '').toUpperCase();
        return <Tag color={methodColors[normalizedMethod] || 'default'}>{normalizedMethod || '-'}</Tag>;
      },
    },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      width: 120,
      render: (count: any) => formatNumber(count),
      sorter: (left: any, right: any) => n(left.request_count) - n(right.request_count),
    },
    {
      title: 'Error Rate',
      key: 'error_rate',
      width: 150,
      render: (_value: any, record: any) => {
        const requests = n(record.request_count);
        const errors = n(record.error_count);
        const rate = requests > 0 ? (errors / requests) * 100 : 0;
        const color = rate > 5 ? APP_COLORS.hex_f04438 : rate > 1 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_12b76a;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress
              percent={Math.min(rate, 100)}
              size="small"
              strokeColor={color}
              showInfo={false}
              style={{ flex: 1 }}
            />
            <span style={{ color, minWidth: 50, fontSize: 12 }}>{Number(rate).toFixed(2)}%</span>
          </div>
        );
      },
      sorter: (left: any, right: any) => {
        const rateLeft = n(left.request_count) > 0 ? n(left.error_count) / n(left.request_count) : 0;
        const rateRight = n(right.request_count) > 0 ? n(right.error_count) / n(right.request_count) : 0;
        return rateLeft - rateRight;
      },
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avg_latency',
      key: 'avg_latency',
      width: 120,
      render: (latency: any) => formatDuration(latency),
      sorter: (left: any, right: any) => n(left.avg_latency) - n(right.avg_latency),
    },
    {
      title: 'P95',
      dataIndex: 'p95_latency',
      key: 'p95_latency',
      width: 120,
      render: (latency: any) => formatDuration(latency),
      sorter: (left: any, right: any) => n(left.p95_latency) - n(right.p95_latency),
    },
    {
      title: 'P99',
      dataIndex: 'p99_latency',
      key: 'p99_latency',
      width: 120,
      render: (latency: any) => formatDuration(latency || 0),
      sorter: (left: any, right: any) => n(left.p99_latency) - n(right.p99_latency),
    },
  ];

  const errorColumns: any[] = [
    {
      title: 'Error Message',
      dataIndex: 'status_message',
      key: 'status_message',
      width: 300,
      render: (text: any) => (
        <span style={{ fontFamily: 'monospace', color: APP_COLORS.hex_f04438, fontSize: 12 }}>
          {text || 'Unknown error'}
        </span>
      ),
    },
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      width: 200,
      render: (text: any) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>,
    },
    {
      title: 'Status Code',
      dataIndex: 'http_status_code',
      key: 'http_status_code',
      width: 120,
      render: (code: any) => {
        const statusCode = n(code);
        const color = statusCode >= 500 ? 'red' : statusCode >= 400 ? 'orange' : 'default';
        return <Tag color={color}>{statusCode || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Count',
      dataIndex: 'error_count',
      key: 'error_count',
      width: 100,
      render: (count: any) => <span style={{ fontWeight: 600 }}>{formatNumber(count)}</span>,
      sorter: (left: any, right: any) => n(left.error_count) - n(right.error_count),
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_occurrence',
      key: 'last_occurrence',
      width: 180,
      render: (timestamp: any) => {
        if (!timestamp) return '-';
        return <span style={{ fontSize: 12 }}>{formatTimestamp(timestamp)}</span>;
      },
    },
    {
      title: 'Sample Trace',
      dataIndex: 'sample_trace_id',
      key: 'sample_trace_id',
      width: 150,
      render: (traceId: any) => {
        if (!traceId) return '-';
        return (
          <a
            onClick={() => navigate(`/traces/${traceId}`)}
            style={{ color: APP_COLORS.hex_1890ff, cursor: 'pointer', fontSize: 12 }}
          >
            View Trace
          </a>
        );
      },
    },
  ];

  const logColumns: any[] = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: any) => formatTimestamp(timestamp),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: any) => {
        const levelKey = String(level || 'INFO').toUpperCase() as keyof typeof LOG_LEVELS;
        const config = LOG_LEVELS[levelKey] || LOG_LEVELS.INFO;
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (message: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{message || '-'}</span>
      ),
    },
    {
      title: 'Trace',
      dataIndex: 'trace_id',
      key: 'trace_id',
      width: 150,
      render: (traceId: any) => {
        if (!traceId) return '-';
        return (
          <a
            onClick={() => navigate(`/traces/${traceId}`)}
            style={{ color: APP_COLORS.hex_1890ff, cursor: 'pointer', fontSize: 11 }}
          >
            {String(traceId).substring(0, 16)}...
          </a>
        );
      },
    },
  ];

  const breadcrumbs = [
    { label: 'Services', path: '/services' },
    { label: serviceName },
  ];

  const headerActions = (
    <button
      onClick={() => navigate('/services')}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
        background: `var(--bg-secondary, ${APP_COLORS.hex_0d0d0d})`, border: `1px solid var(--border-color, ${APP_COLORS.hex_2d2d2d})`,
        borderRadius: 6, cursor: 'pointer', fontSize: 14, color: `var(--text-primary, ${APP_COLORS.hex_fff})`,
      }}
    >
      <ArrowLeft size={16} /> Back to Services
    </button>
  );

  if (isLoading && !logsLoading) {
    return (
      <div>
        <PageHeader title={serviceName} breadcrumbs={breadcrumbs} actions={headerActions} />
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[1, 2, 3, 4].map((index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card><Skeleton active paragraph={{ rows: 2 }} /></Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={serviceName} breadcrumbs={breadcrumbs} actions={headerActions} />

      <ServiceDetailStatsRow
        stats={{ totalRequests: stats.totalRequests }}
        errorRate={errorRate}
        avgLatency={avgLatency}
        p95Latency={p95Latency}
        requestsSparkline={requestsSparkline}
        errorSparkline={errorSparkline}
      />

      {/* Tabs for different views */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'overview' | 'errors' | 'logs' | 'dependencies')}
          items={[
            {
              key: 'overview',
              label: 'Overview',
              children: (
                <ServiceDetailOverviewTab
                  config={config}
                  timeSeries={timeSeries}
                  endpoints={endpoints}
                  timeSeriesLoading={timeSeriesLoading}
                  endpointsLoading={endpointsLoading}
                  endpointColumns={endpointColumns}
                />
              ),
            },
            {
              key: 'errors',
              label: `Errors (${errorGroups.length})`,
              children: (
                <ServiceDetailErrorsTab
                  errorGroups={errorGroups}
                  errorsLoading={errorsLoading}
                  errorColumns={errorColumns}
                />
              ),
            },
            {
              key: 'logs',
              label: `Logs (${logs.length})`,
              children: (
                <ServiceDetailLogsTab
                  logs={logs}
                  logsLoading={logsLoading}
                  logColumns={logColumns}
                  onTraceNavigate={(traceId: string) => navigate(`/traces/${traceId}`)}
                />
              ),
            },
            {
              key: 'dependencies',
              label: `Dependencies (${serviceDependencies.length})`,
              children: (
                <ServiceDetailDependenciesTab
                  serviceName={serviceName}
                  serviceDependencies={serviceDependencies}
                  onNavigateService={(targetService: string) =>
                    navigate(`/services/${encodeURIComponent(targetService)}`)
                  }
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
