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

const n = (v: any) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

const normalizeEndpoint = (row: any = {}) => ({
  ...row,
  service_name: row.service_name ?? row.serviceName ?? '',
  operation_name: row.operation_name ?? row.operationName ?? '',
  http_method: row.http_method ?? row.httpMethod ?? '',
  request_count: n(row.request_count ?? row.requestCount),
  error_count: n(row.error_count ?? row.errorCount),
  avg_latency: n(row.avg_latency ?? row.avgLatency),
  p95_latency: n(row.p95_latency ?? row.p95Latency),
  p99_latency: n(row.p99_latency ?? row.p99Latency),
});

const normalizeErrorGroup = (row: any = {}) => ({
  ...row,
  service_name: row.service_name ?? row.serviceName ?? '',
  operation_name: row.operation_name ?? row.operationName ?? '',
  status_message: row.status_message ?? row.statusMessage ?? '',
  http_status_code: n(row.http_status_code ?? row.httpStatusCode),
  error_count: n(row.error_count ?? row.errorCount),
  last_occurrence: row.last_occurrence ?? row.lastOccurrence ?? '',
  first_occurrence: row.first_occurrence ?? row.firstOccurrence ?? '',
  sample_trace_id: row.sample_trace_id ?? row.sampleTraceId ?? '',
});

const normalizeTimeSeriesPoint = (row: any = {}) => ({
  ...row,
  timestamp: row.timestamp ?? row.time_bucket ?? row.timeBucket ?? '',
  request_count: n(row.request_count ?? row.requestCount),
  error_count: n(row.error_count ?? row.errorCount),
  avg_latency: n(row.avg_latency ?? row.avgLatency),
  p95: n(row.p95 ?? row.p95_latency ?? row.p95Latency),
  p99: n(row.p99 ?? row.p99_latency ?? row.p99Latency),
});

const normalizeLog = (row: any = {}) => ({
  ...row,
  timestamp: row.timestamp ?? '',
  level: row.level ?? 'INFO',
  message: row.message ?? '',
  trace_id: row.trace_id ?? row.traceId ?? '',
  span_id: row.span_id ?? row.spanId ?? '',
});

const normalizeDependency = (row: any = {}) => ({
  ...row,
  source: row.source ?? '',
  target: row.target ?? '',
  call_count: n(row.call_count ?? row.callCount),
});

/**
 *
 */
export default function ServiceDetailPage() {
  const { serviceName } = useParams();
  const navigate = useNavigate();
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const { config } = useDashboardConfig('service-detail');

  const { data: endpointData, isLoading: endpointsLoading } = useQuery({
    queryKey: ['endpoint-breakdown', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getEndpointBreakdown(selectedTeamId, startTime, endTime, serviceName);
    },
    enabled: !!selectedTeamId && !!serviceName,
  });

  const { data: errorData, isLoading: errorsLoading } = useQuery({
    queryKey: ['error-groups', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getErrorGroups(selectedTeamId, startTime, endTime, serviceName);
    },
    enabled: !!selectedTeamId && !!serviceName,
  });

  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['metrics-timeseries', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getMetricsTimeSeries(selectedTeamId, startTime, endTime, serviceName, '5m');
    },
    enabled: !!selectedTeamId && !!serviceName,
  });

  // Fetch service logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['service-logs', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getLogs(selectedTeamId, startTime, endTime, {
        services: [serviceName],
        limit: 50,
        offset: 0,
      });
    },
    enabled: !!selectedTeamId && !!serviceName && activeTab === 'logs',
  });

  // Fetch service dependencies
  const { data: dependenciesData } = useQuery({
    queryKey: ['service-dependencies', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getServiceDependencies(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId && !!serviceName && activeTab === 'dependencies',
  });

  const endpoints = Array.isArray(endpointData) ? endpointData.map(normalizeEndpoint) : [];
  const errorGroups = Array.isArray(errorData) ? errorData.map(normalizeErrorGroup) : [];
  const timeSeries = Array.isArray(timeSeriesData) ? timeSeriesData.map(normalizeTimeSeriesPoint) : [];
  const logs = Array.isArray(logsData?.logs) ? logsData.logs.map(normalizeLog) : [];
  const dependencies = Array.isArray(dependenciesData) ? dependenciesData.map(normalizeDependency) : [];
  const isLoading = endpointsLoading || errorsLoading || timeSeriesLoading;

  // Filter dependencies for this service
  const serviceDependencies = useMemo(() => {
    return dependencies.filter((dep) => dep.source === serviceName || dep.target === serviceName);
  }, [dependencies, serviceName]);

  const stats = useMemo(() => {
    return endpoints.reduce(
      (acc, endpoint) => {
        acc.totalRequests += endpoint.request_count || 0;
        acc.totalErrors += endpoint.error_count || 0;
        acc.latencies.push(endpoint.avg_latency || 0);
        acc.p95Latencies.push(endpoint.p95_latency || 0);
        return acc;
      },
      { totalRequests: 0, totalErrors: 0, latencies: [], p95Latencies: [] },
    );
  }, [endpoints]);

  const errorRate = stats.totalRequests > 0
    ? (stats.totalErrors / stats.totalRequests) * 100
    : 0;

  const avgLatency = stats.latencies.length > 0
    ? stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length
    : 0;

  const p95Latency = stats.p95Latencies.length > 0
    ? Math.max(...stats.p95Latencies)
    : 0;

  // Build sparkline data from timeseries
  const requestsSparkline = useMemo(
    () => (timeSeries || []).map((d) => d.request_count || 0),
    [timeSeries],
  );

  const errorSparkline = useMemo(() => {
    return (timeSeries || []).map((d) => {
      const total = d.request_count || 0;
      const errors = d.error_count || 0;
      return total > 0 ? (errors / total) * 100 : 0;
    });
  }, [timeSeries]);

  const endpointColumns = [
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      width: 250,
      render: (text) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>,
    },
    {
      title: 'Method',
      dataIndex: 'http_method',
      key: 'http_method',
      width: 100,
      render: (method) => {
        const colors = { GET: 'blue', POST: 'green', PUT: 'orange', DELETE: 'red', PATCH: 'purple' };
        return <Tag color={colors[method] || 'default'}>{method}</Tag>;
      },
    },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      width: 120,
      render: (count) => formatNumber(count),
      sorter: (a, b) => a.request_count - b.request_count,
    },
    {
      title: 'Error Rate',
      key: 'error_rate',
      width: 150,
      render: (_, record) => {
        const rate = record.request_count > 0
          ? (record.error_count / record.request_count) * 100
          : 0;
        const color = rate > 5 ? '#F04438' : rate > 1 ? '#F79009' : '#12B76A';
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
      sorter: (a, b) => {
        const rateA = a.request_count > 0 ? (a.error_count / a.request_count) : 0;
        const rateB = b.request_count > 0 ? (b.error_count / b.request_count) : 0;
        return rateA - rateB;
      },
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avg_latency',
      key: 'avg_latency',
      width: 120,
      render: (latency) => formatDuration(latency),
      sorter: (a, b) => a.avg_latency - b.avg_latency,
    },
    {
      title: 'P95',
      dataIndex: 'p95_latency',
      key: 'p95_latency',
      width: 120,
      render: (latency) => formatDuration(latency),
      sorter: (a, b) => a.p95_latency - b.p95_latency,
    },
    {
      title: 'P99',
      dataIndex: 'p99_latency',
      key: 'p99_latency',
      width: 120,
      render: (latency) => formatDuration(latency || 0),
      sorter: (a, b) => (a.p99_latency || 0) - (b.p99_latency || 0),
    },
  ];

  const errorColumns = [
    {
      title: 'Error Message',
      dataIndex: 'status_message',
      key: 'status_message',
      width: 300,
      render: (text) => (
        <span style={{ fontFamily: 'monospace', color: '#F04438', fontSize: 12 }}>
          {text || 'Unknown error'}
        </span>
      ),
    },
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      width: 200,
      render: (text) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>,
    },
    {
      title: 'Status Code',
      dataIndex: 'http_status_code',
      key: 'http_status_code',
      width: 120,
      render: (code) => {
        const color = code >= 500 ? 'red' : code >= 400 ? 'orange' : 'default';
        return <Tag color={color}>{code || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Count',
      dataIndex: 'error_count',
      key: 'error_count',
      width: 100,
      render: (count) => <span style={{ fontWeight: 600 }}>{formatNumber(count)}</span>,
      sorter: (a, b) => a.error_count - b.error_count,
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_occurrence',
      key: 'last_occurrence',
      width: 180,
      render: (timestamp) => {
        if (!timestamp) return '-';
        return <span style={{ fontSize: 12 }}>{formatTimestamp(timestamp)}</span>;
      },
    },
    {
      title: 'Sample Trace',
      dataIndex: 'sample_trace_id',
      key: 'sample_trace_id',
      width: 150,
      render: (traceId) => {
        if (!traceId) return '-';
        return (
          <a
            onClick={() => navigate(`/traces/${traceId}`)}
            style={{ color: '#1890ff', cursor: 'pointer', fontSize: 12 }}
          >
            View Trace
          </a>
        );
      },
    },
  ];

  const logColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (ts) => formatTimestamp(ts),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => {
        const config = LOG_LEVELS[level] || LOG_LEVELS.INFO;
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (msg) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{msg || '-'}</span>
      ),
    },
    {
      title: 'Trace',
      dataIndex: 'trace_id',
      key: 'trace_id',
      width: 150,
      render: (traceId) => {
        if (!traceId) return '-';
        return (
          <a
            onClick={() => navigate(`/traces/${traceId}`)}
            style={{ color: '#1890ff', cursor: 'pointer', fontSize: 11 }}
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
        background: 'var(--bg-secondary, #0D0D0D)', border: '1px solid var(--border-color, #2D2D2D)',
        borderRadius: 6, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary, #fff)',
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
          {[1, 2, 3, 4].map((i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
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
          onChange={setActiveTab}
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
                  onTraceNavigate={(traceId) => navigate(`/traces/${traceId}`)}
                />
              ),
            },
            {
              key: 'dependencies',
              label: `Dependencies (${serviceDependencies.length})`,
              children: (
                <ServiceDetailDependenciesTab
                  serviceName={serviceName || ''}
                  serviceDependencies={serviceDependencies}
                  onNavigateService={(targetService) =>
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
