import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Skeleton, Empty, Tag, Tabs, Progress } from 'antd';
import { Activity, AlertCircle, Clock, Zap, ArrowLeft, FileText, Network, TrendingUp } from 'lucide-react';
import { useAppStore } from '@store/appStore';
import PageHeader from '@components/common/PageHeader';
import StatCard from '@components/common/StatCard';
import DataTable from '@components/common/DataTable';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { v1Service } from '@services/v1Service';
import { formatNumber, formatDuration, formatTimestamp } from '@utils/formatters';
import { LOG_LEVELS } from '@config/constants';

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

  const endpoints = Array.isArray(endpointData) ? endpointData : [];
  const errorGroups = Array.isArray(errorData) ? errorData : [];
  const timeSeries = Array.isArray(timeSeriesData) ? timeSeriesData : [];
  const logs = logsData?.logs || [];
  const dependencies = Array.isArray(dependenciesData) ? dependenciesData : [];
  const isLoading = endpointsLoading || errorsLoading || timeSeriesLoading;

  // Filter dependencies for this service
  const serviceDependencies = useMemo(() => {
    return dependencies.filter(dep => dep.source === serviceName || dep.target === serviceName);
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
      { totalRequests: 0, totalErrors: 0, latencies: [], p95Latencies: [] }
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

  const p99Latency = stats.p95Latencies.length > 0
    ? Math.max(...stats.p95Latencies.map(l => l * 1.5))
    : 0;

  // Build sparkline data from timeseries
  const requestsSparkline = useMemo(
    () => (timeSeries || []).map((d) => d.request_count || 0),
    [timeSeries]
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

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Requests"
            value={stats.totalRequests}
            formatter={formatNumber}
            icon={<Activity size={20} />}
            iconColor="#1890ff"
            sparklineData={requestsSparkline}
            sparklineColor="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Error Rate"
            value={`${errorRate.toFixed(2)}%`}
            icon={<AlertCircle size={20} />}
            iconColor={errorRate > 5 ? '#F04438' : errorRate > 1 ? '#F79009' : '#12B76A'}
            sparklineData={errorSparkline}
            sparklineColor="#F04438"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Avg Latency"
            value={formatDuration(avgLatency)}
            icon={<Clock size={20} />}
            iconColor="#722ED1"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="P95 Latency"
            value={formatDuration(p95Latency)}
            icon={<Zap size={20} />}
            iconColor="#FA8C16"
          />
        </Col>
      </Row>

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
                <>
                  {/* Configurable Charts */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24}>
                      <ConfigurableDashboard
                        config={config}
                        dataSources={{
                          'metrics-timeseries': timeSeries,
                          'endpoint-breakdown': endpoints,
                        }}
                        isLoading={timeSeriesLoading}
                      />
                    </Col>
                  </Row>

                  {/* Top Endpoints by Latency */}
                  {endpoints.length > 0 && (
                    <Card title="Top Endpoints by Latency" style={{ marginBottom: 24 }} className="chart-card" size="small">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[...endpoints]
                          .sort((a, b) => b.avg_latency - a.avg_latency)
                          .slice(0, 10)
                          .map((ep) => {
                            const maxLat = Math.max(...endpoints.map((e) => e.avg_latency || 0), 1);
                            const pct = (ep.avg_latency / maxLat) * 100;
                            return (
                              <div key={`${ep.operation_name}-${ep.http_method}`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 200, fontSize: 12, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {ep.operation_name}
                                </div>
                                <div style={{ flex: 1, height: 20, background: 'var(--bg-tertiary, #1A1A1A)', borderRadius: 4, overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${pct}%`,
                                      height: '100%',
                                      background: ep.avg_latency > 500 ? '#F04438' : ep.avg_latency > 200 ? '#F79009' : '#73C991',
                                      borderRadius: 4,
                                      transition: 'width 0.3s',
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 60, textAlign: 'right' }}>
                                  {formatDuration(ep.avg_latency)}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </Card>
                  )}

                  {/* Endpoints Table */}
                  <Card title="Endpoints Breakdown" className="chart-card" size="small">
                    <DataTable
                      columns={endpointColumns}
                      data={endpoints}
                      loading={endpointsLoading}
                      rowKey={(record) => `${record.operation_name}-${record.http_method}`}
                    />
                  </Card>
                </>
              ),
            },
            {
              key: 'errors',
              label: `Errors (${errorGroups.length})`,
              children: (
                <Card className="chart-card" size="small">
                  <DataTable
                    columns={errorColumns}
                    data={errorGroups}
                    loading={errorsLoading}
                    rowKey={(record) => `${record.operation_name}-${record.http_status_code}-${record.status_message}`}
                    expandable={{
                      expandedRowRender: (record) => (
                        <div style={{ padding: 12, fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', color: '#F04438', background: 'var(--bg-tertiary, #1A1A1A)', borderRadius: 6 }}>
                          {record.status_message || 'No additional details'}
                        </div>
                      ),
                    }}
                  />
                </Card>
              ),
            },
            {
              key: 'logs',
              label: `Logs (${logs.length})`,
              children: (
                <Card className="chart-card" size="small">
                  <DataTable
                    columns={logColumns}
                    data={logs}
                    loading={logsLoading}
                    rowKey={(record, index) => `${record.trace_id}-${record.span_id}-${index}`}
                    onRow={(record) => ({
                      onClick: () => record.trace_id && navigate(`/traces/${record.trace_id}`),
                      style: { cursor: record.trace_id ? 'pointer' : 'default' },
                    })}
                  />
                </Card>
              ),
            },
            {
              key: 'dependencies',
              label: `Dependencies (${serviceDependencies.length})`,
              children: (
                <Card className="chart-card" size="small">
                  {serviceDependencies.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {serviceDependencies.map((dep, idx) => {
                        const isOutgoing = dep.source === serviceName;
                        const otherService = isOutgoing ? dep.target : dep.source;
                        return (
                          <div
                            key={idx}
                            style={{
                              padding: 12,
                              background: 'var(--bg-secondary, #0D0D0D)',
                              borderRadius: 6,
                              border: '1px solid var(--border-color, #2D2D2D)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                              <Network size={16} />
                              <span style={{ fontWeight: 600 }}>{serviceName}</span>
                              <span style={{ color: 'var(--text-muted)' }}>→</span>
                              <a
                                onClick={() => navigate(`/services/${encodeURIComponent(otherService)}`)}
                                style={{ color: '#1890ff', cursor: 'pointer' }}
                              >
                                {otherService}
                              </a>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                              <span>Calls: {formatNumber(dep.call_count || 0)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <Empty description="No dependencies found" />
                  )}
                </Card>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
