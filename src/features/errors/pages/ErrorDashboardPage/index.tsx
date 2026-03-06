import { Row, Col, Card, Select, Tag, Table, Skeleton, Empty, Tooltip } from 'antd';
import { AlertCircle, ExternalLink, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '@components/common/layout/PageHeader';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { overviewService } from '@services/overviewService';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';

import { formatNumber, formatRelativeTime } from '@utils/formatters';
import './ErrorDashboardPage.css';

const n = (v: any) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

const normalizeErrorGroup = (row: any = {}) => ({
  ...row,
  service_name: row.service_name ?? row.serviceName ?? '',
  operation_name: row.operation_name ?? row.operationName ?? '',
  status_message: row.status_message ?? row.statusMessage ?? '',
  http_status_code: n(row.http_status_code ?? row.httpStatusCode),
  error_count: n(row.error_count ?? row.errorCount),
  last_occurrence: row.last_occurrence ?? row.lastOccurrence ?? '',
  sample_trace_id: row.sample_trace_id ?? row.sampleTraceId ?? '',
});

const normalizeServiceMetric = (row: any = {}) => ({
  ...row,
  service_name: row.service_name ?? row.serviceName ?? row.service ?? '',
  request_count: n(row.request_count ?? row.requestCount),
  error_count: n(row.error_count ?? row.errorCount),
  avg_latency: n(row.avg_latency ?? row.avgLatency),
  p95_latency: n(row.p95_latency ?? row.p95Latency),
  p99_latency: n(row.p99_latency ?? row.p99Latency),
});

const normalizeTimeSeriesPoint = (row: any = {}) => ({
  ...row,
  timestamp: row.timestamp ?? row.time_bucket ?? row.timeBucket ?? '',
  service_name: row.service_name ?? row.serviceName ?? '',
  request_count: n(row.request_count ?? row.requestCount),
  error_count: n(row.error_count ?? row.errorCount),
  avg_latency: n(row.avg_latency ?? row.avgLatency),
});

/**
 *
 */
export default function ErrorDashboardPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { config } = useDashboardConfig('error-dashboard');

  const resolvedConfig = useMemo(() => {
    if (!config) return config;

    return {
      ...config,
      charts: Array.isArray(config.charts) ? config.charts.map((chart: any) => {
        if (chart.id === 'service-error-rate') return { ...chart, dataSource: 'service-error-rate' };
        if (chart.id === 'service-error-volume') return { ...chart, dataSource: 'error-volume' };
        if (chart.id === 'service-latency-under-errors') return { ...chart, dataSource: 'latency-during-error-windows' };
        return chart;
      }) : [],
    };
  }, [config]);

  const { data: serviceErrorRateRaw, isLoading: errorRateLoading } = useTimeRangeQuery(
    'overview-service-error-rate',
    (teamId, start, end) =>
      overviewService.getServiceErrorRate(teamId, start, end, selectedService, '5m'),
    { extraKeys: [selectedService] },
  );

  const { data: errorVolumeRaw, isLoading: errorVolumeLoading } = useTimeRangeQuery(
    'overview-error-volume',
    (teamId, start, end) =>
      overviewService.getErrorVolume(teamId, start, end, selectedService, '5m'),
    { extraKeys: [selectedService] },
  );

  const { data: latencyWindowsRaw, isLoading: latencyLoading } = useTimeRangeQuery(
    'overview-error-latency-windows',
    (teamId, start, end) =>
      overviewService.getLatencyDuringErrorWindows(teamId, start, end, selectedService, '5m'),
    { extraKeys: [selectedService] },
  );

  const { data: errorGroupsRaw, isLoading: groupsLoading } = useTimeRangeQuery(
    'error-groups-global',
    (teamId, start, end) =>
      overviewService.getErrorGroups(teamId, start, end, { serviceName: selectedService as string, limit: 100 }),
    { extraKeys: [selectedService] },
  );

  // Service metrics for the filter dropdown and breakdown list
  const { data: serviceMetricsRaw } = useTimeRangeQuery(
    'overview-services-errors',
    (teamId, start, end) => overviewService.getServices(teamId, start, end),
  );

  const errorGroups = useMemo(() => {
    if (!errorGroupsRaw) return [];
    return Array.isArray(errorGroupsRaw) ? errorGroupsRaw.map(normalizeErrorGroup) : [];
  }, [errorGroupsRaw]);

  const normalizedServiceMetrics = useMemo(
    () => (Array.isArray(serviceMetricsRaw) ? serviceMetricsRaw.map(normalizeServiceMetric) : []),
    [serviceMetricsRaw],
  );
  const normalizedServiceErrorRate = useMemo(
    () => (Array.isArray(serviceErrorRateRaw) ? serviceErrorRateRaw.map(normalizeTimeSeriesPoint) : []),
    [serviceErrorRateRaw],
  );
  const normalizedErrorVolume = useMemo(
    () => (Array.isArray(errorVolumeRaw) ? errorVolumeRaw.map(normalizeTimeSeriesPoint) : []),
    [errorVolumeRaw],
  );
  const normalizedLatencyWindows = useMemo(
    () => (Array.isArray(latencyWindowsRaw) ? latencyWindowsRaw.map(normalizeTimeSeriesPoint) : []),
    [latencyWindowsRaw],
  );

  const services = useMemo(() => {
    return normalizedServiceMetrics.map((s) => s.service_name).filter(Boolean);
  }, [normalizedServiceMetrics]);

  const statusColor = (code: any) => {
    const n = Number(code);
    if (n >= 500) return '#F04438';
    if (n >= 400) return '#F79009';
    return '#98A2B3';
  };

  const columns: any[] = [
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (v: string) => (
        <Tag style={{ background: 'rgba(94,96,206,0.15)', color: '#5E60CE', border: '1px solid rgba(94,96,206,0.3)' }}>
          {v}
        </Tag>
      ),
      filters: services.map((s) => ({ text: s, value: s })),
      onFilter: (value: any, record: any) => record.service_name === value,
    },
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      render: (v: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)' }}>{v}</span>
      ),
    },
    {
      title: 'HTTP',
      dataIndex: 'http_status_code',
      key: 'http_status_code',
      width: 70,
      render: (v: any) => v ? (
        <Tag style={{ color: statusColor(v), borderColor: statusColor(v), background: 'transparent' }}>
          {v}
        </Tag>
      ) : '-',
    },
    {
      title: 'Error Message',
      dataIndex: 'status_message',
      key: 'status_message',
      ellipsis: true,
      render: (v: string) => (
        <Tooltip title={v}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {v || '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'error_count',
      key: 'error_count',
      width: 100,
      align: 'right',
      sorter: (a: any, b: any) => Number(a.error_count) - Number(b.error_count),
      defaultSortOrder: 'descend' as const,
      render: (v: any) => (
        <span style={{ fontWeight: 700, color: '#F04438', fontSize: 13 }}>
          {formatNumber(Number(v))}
        </span>
      ),
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_occurrence',
      key: 'last_occurrence',
      width: 130,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {v ? formatRelativeTime(v) : '-'}
        </span>
      ),
    },
    {
      title: 'Sample Trace',
      dataIndex: 'sample_trace_id',
      key: 'sample_trace_id',
      width: 120,
      render: (v: string) => v ? (
        <span
          style={{ color: '#5E60CE', cursor: 'pointer', fontSize: 12 }}
          onClick={() => navigate(`/traces/${v}`)}
        >
          <ExternalLink size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          View Trace
        </span>
      ) : '-',
    },
  ];

  return (
    <div className="error-dashboard-page">
      <PageHeader
        title="Error Dashboard"
        subtitle="Error trends, breakdowns, and grouped error logs across all services"
        icon={<AlertCircle size={24} />}
        actions={
          <Select
            placeholder="All Services"
            allowClear
            style={{ width: 200 }}
            value={selectedService}
            onChange={setSelectedService}
            options={services.map((s) => ({ label: s, value: s }))}
          />
        }
      />

      {/* Configurable Dashboard Charts */}
      <ConfigurableDashboard
        config={resolvedConfig}
        dataSources={{
          'service-error-rate': normalizedServiceErrorRate,
          'error-volume': normalizedErrorVolume,
          'latency-during-error-windows': normalizedLatencyWindows,
          'error-groups': errorGroups,
        }}
        isLoading={errorRateLoading || errorVolumeLoading || latencyLoading}
      />

      {/* Error Groups Table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                Error Groups
                {!groupsLoading && (
                  <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 12 }}>
                    {errorGroups.length} groups
                  </span>
                )}
              </span>
            }
            className="err-chart-card"
          >
            {groupsLoading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : errorGroups.length === 0 ? (
              <Empty description="No errors in selected time range" />
            ) : (
              <Table
                dataSource={errorGroups.map((g, i) => ({ ...g, key: i }))}
                columns={columns}
                size="small"
                pagination={{ pageSize: 20, showSizeChanger: true }}
                scroll={{ x: 900 }}
                rowClassName={(record) =>
                  Number(record.error_count) > 100 ? 'high-error-row' : ''
                }
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
