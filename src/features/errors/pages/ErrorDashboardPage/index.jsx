import { useMemo, useState } from 'react';
import { Row, Col, Card, Select, Tag, Table, Skeleton, Empty, Tooltip } from 'antd';
import { AlertCircle, ExternalLink, Clock, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { v1Service } from '@services/v1Service';
import PageHeader from '@components/common/layout/PageHeader';
import StatCard from '@components/common/cards/StatCard';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { formatNumber, formatRelativeTime } from '@utils/formatters';
import './ErrorDashboardPage.css';

export default function ErrorDashboardPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const { config } = useDashboardConfig('error-dashboard');

  // Cross-service error groups
  const { data: errorGroupsRaw, isLoading: groupsLoading } = useTimeRangeQuery(
    'error-groups-global',
    (teamId, start, end) =>
      v1Service.getGlobalErrorGroups(teamId, start, end, { serviceName: selectedService, limit: 100 }),
    { extraKeys: [selectedService] }
  );

  // Service timeseries for chart
  const { data: serviceTimeseriesRaw, isLoading: tsLoading } = useTimeRangeQuery(
    'service-timeseries-charts',
    (teamId, start, end) =>
      v1Service.getServiceTimeSeries(teamId, start, end, '5m'),
    { extraKeys: [selectedService] }
  );

  // Service metrics for the filter dropdown and breakdown list
  const { data: serviceMetricsRaw } = useTimeRangeQuery(
    'services-metrics-err',
    (teamId, start, end) => v1Service.getServiceMetrics(teamId, start, end)
  );

  const errorGroups = useMemo(() => {
    if (!errorGroupsRaw) return [];
    return Array.isArray(errorGroupsRaw) ? errorGroupsRaw : [];
  }, [errorGroupsRaw]);

  const services = useMemo(() => {
    const raw = Array.isArray(serviceMetricsRaw) ? serviceMetricsRaw : [];
    return raw.map((s) => s.service_name).filter(Boolean);
  }, [serviceMetricsRaw]);

  // Derive stats from error groups
  const stats = useMemo(() => {
    if (errorGroups.length > 0) {
      const totalErrors = errorGroups.reduce((sum, g) => sum + Number(g.error_count || 0), 0);
      const uniqueServices = new Set(errorGroups.map((g) => g.service_name)).size;
      const uniqueOperations = new Set(errorGroups.map((g) => g.operation_name)).size;
      const topErrorCount = errorGroups[0]?.error_count || 0;
      return { totalErrors, uniqueServices, uniqueOperations, topErrorCount };
    }
    return { totalErrors: 0, uniqueServices: 0, uniqueOperations: 0, topErrorCount: 0 };
  }, [errorGroups]);

  const statusColor = (code) => {
    const n = Number(code);
    if (n >= 500) return '#F04438';
    if (n >= 400) return '#F79009';
    return '#98A2B3';
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (v) => (
        <Tag style={{ background: 'rgba(94,96,206,0.15)', color: '#5E60CE', border: '1px solid rgba(94,96,206,0.3)' }}>
          {v}
        </Tag>
      ),
      filters: services.map((s) => ({ text: s, value: s })),
      onFilter: (value, record) => record.service_name === value,
    },
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      render: (v) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-primary)' }}>{v}</span>
      ),
    },
    {
      title: 'HTTP',
      dataIndex: 'http_status_code',
      key: 'http_status_code',
      width: 70,
      render: (v) => v ? (
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
      render: (v) => (
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
      sorter: (a, b) => Number(a.error_count) - Number(b.error_count),
      defaultSortOrder: 'descend',
      render: (v) => (
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
      render: (v) => (
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
      render: (v) => v ? (
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

      {/* Summary Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Errors"
            value={stats.totalErrors}
            formatter={formatNumber}
            icon={<AlertCircle size={20} />}
            iconColor="#F04438"
            loading={groupsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Affected Services"
            value={stats.uniqueServices}
            icon={<Server size={20} />}
            iconColor="#F79009"
            loading={groupsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Affected Endpoints"
            value={stats.uniqueOperations}
            icon={<AlertCircle size={20} />}
            iconColor="#5E60CE"
            loading={groupsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Top Error Group"
            value={stats.topErrorCount}
            formatter={formatNumber}
            icon={<AlertCircle size={20} />}
            iconColor="#E478FA"
            loading={groupsLoading}
          />
        </Col>
      </Row>

      {/* Configurable Dashboard Charts */}
      <ConfigurableDashboard
        config={config}
        dataSources={{
          'service-timeseries': Array.isArray(serviceTimeseriesRaw) ? serviceTimeseriesRaw : [],
          'services-metrics': Array.isArray(serviceMetricsRaw) ? serviceMetricsRaw : [],
        }}
        isLoading={tsLoading}
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
