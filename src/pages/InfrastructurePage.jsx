import { useMemo, useState } from 'react';
import { Row, Col, Card, Tag, Progress, Segmented } from 'antd';
import { Server, Box, AlertCircle, Activity, List, LayoutGrid } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { PageHeader, StatCard, DataTable } from '@components/common';
import GaugeChart from '@components/charts/GaugeChart';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { infrastructureService } from '@services/infrastructureService';
import { v1Service } from '@services/v1Service';
import { formatNumber, formatDuration } from '@utils/formatters';
import './InfrastructurePage.css';


export default function InfrastructurePage() {
  const [viewMode, setViewMode] = useState('table');

  const { config: dashboardConfig } = useDashboardConfig('infrastructure');

  const { data, isLoading } = useTimeRangeQuery(
    'infrastructure-metrics',
    (teamId, startTime, endTime) =>
      infrastructureService.getMetrics(teamId, startTime, endTime)
  );

  // Service timeseries for configurable charts
  const { data: serviceTimeseriesRaw } = useTimeRangeQuery(
    'service-timeseries-infra',
    (teamId, start, end) => v1Service.getServiceTimeSeries(teamId, start, end, '5m')
  );
  const { data: serviceMetricsRaw } = useTimeRangeQuery(
    'services-metrics-infra',
    (teamId, start, end) => v1Service.getServiceMetrics(teamId, start, end)
  );

  const chartDataSources = useMemo(() => ({
    'service-timeseries': Array.isArray(serviceTimeseriesRaw) ? serviceTimeseriesRaw : [],
    'services-metrics': Array.isArray(serviceMetricsRaw) ? serviceMetricsRaw : [],
  }), [serviceTimeseriesRaw, serviceMetricsRaw]);

  const stats = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return { totalHosts: 0, totalPods: 0, totalRequests: 0, avgErrorRate: 0 };
    }

    const uniqueHosts = new Set(data.map(item => item.host)).size;
    const uniquePods = new Set(
      data.map(item => item.pod).filter(pod => pod && pod.trim() !== '')
    ).size;
    const totalRequests = data.reduce((sum, item) => sum + (item.spanCount || 0), 0);
    const totalErrors = data.reduce((sum, item) => sum + (item.errorCount || 0), 0);
    const avgErrorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    return { totalHosts: uniqueHosts, totalPods: uniquePods, totalRequests, avgErrorRate };
  }, [data]);

  const columns = [
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      render: (text) => (
        <span className="infrastructure-host">
          <Server size={16} />
          {text}
        </span>
      ),
      sorter: (a, b) => a.host.localeCompare(b.host),
    },
    {
      title: 'Pod',
      dataIndex: 'pod',
      key: 'pod',
      render: (text) => (
        <span className="infrastructure-pod">
          <Box size={16} />
          {text && text.trim() !== '' ? text : '-'}
        </span>
      ),
      sorter: (a, b) => (a.pod || '').localeCompare(b.pod || ''),
    },
    {
      title: 'Container',
      dataIndex: 'container',
      key: 'container',
      render: (text) => text && text.trim() !== '' ? text : '-',
      sorter: (a, b) => (a.container || '').localeCompare(b.container || ''),
    },
    {
      title: 'Requests',
      dataIndex: 'spanCount',
      key: 'spanCount',
      render: (value) => formatNumber(value),
      sorter: (a, b) => a.spanCount - b.spanCount,
      align: 'right',
    },
    {
      title: 'Error Rate',
      key: 'error_rate',
      render: (_, record) => {
        const errorRate = record.spanCount > 0
          ? (record.errorCount / record.spanCount) * 100
          : 0;
        const status = errorRate > 5 ? 'exception' : errorRate > 1 ? 'normal' : 'success';
        return (
          <div className="error-rate-cell">
            <Progress
              percent={Math.min(errorRate, 100)}
              status={status}
              size="small"
              format={(percent) => `${percent.toFixed(2)}%`}
            />
          </div>
        );
      },
      sorter: (a, b) => {
        const rateA = a.spanCount > 0 ? (a.errorCount / a.spanCount) * 100 : 0;
        const rateB = b.spanCount > 0 ? (b.errorCount / b.spanCount) * 100 : 0;
        return rateA - rateB;
      },
      width: 200,
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avgLatency',
      key: 'avgLatency',
      render: (value) => formatDuration(value),
      sorter: (a, b) => a.avgLatency - b.avgLatency,
      align: 'right',
    },
    {
      title: 'P95 Latency',
      dataIndex: 'p95Latency',
      key: 'p95Latency',
      render: (value) => formatDuration(value),
      sorter: (a, b) => a.p95Latency - b.p95Latency,
      align: 'right',
    },
    {
      title: 'Services',
      dataIndex: 'services',
      key: 'services',
      render: (services) => {
        if (!services || !Array.isArray(services) || services.length === 0) return '-';
        if (services.length <= 3) {
          return (
            <div className="services-tags">
              {services.map((service, index) => (
                <Tag key={index} color="blue">{service}</Tag>
              ))}
            </div>
          );
        }
        return (
          <div className="services-tags">
            {services.slice(0, 2).map((service, index) => (
              <Tag key={index} color="blue">{service}</Tag>
            ))}
            <Tag color="default">+{services.length - 2} more</Tag>
          </div>
        );
      },
    },
  ];

  const expandedRowRender = (record) => {
    if (!record.services || !Array.isArray(record.services) || record.services.length <= 3) return null;
    return (
      <div className="expanded-services">
        <strong>All Services:</strong>
        <div className="services-tags" style={{ marginTop: '8px' }}>
          {record.services.map((service, index) => (
            <Tag key={index} color="blue">{service}</Tag>
          ))}
        </div>
      </div>
    );
  };

  const tableData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item, index) => ({
      ...item,
      spanCount: item.spanCount ?? item.span_count ?? 0,
      errorCount: item.errorCount ?? item.error_count ?? 0,
      avgLatency: item.avgLatency ?? item.avg_latency ?? 0,
      p95Latency: item.p95Latency ?? item.p95_latency ?? 0,
      key: `${item.host}-${item.pod}-${item.container}-${index}`,
    }));
  }, [data]);

  // Max requests for gauge scaling
  const maxRequests = useMemo(() => {
    if (!tableData.length) return 1;
    return Math.max(...tableData.map((d) => d.spanCount || 0), 1);
  }, [tableData]);

  return (
    <div className="infrastructure-page">
      <PageHeader
        title="Infrastructure"
        icon={<Server size={24} />}
        actions={
          <Segmented
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'table', icon: <List size={14} /> },
              { value: 'grid', icon: <LayoutGrid size={14} /> },
            ]}
          />
        }
      />

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Hosts" value={stats.totalHosts} icon={<Server size={20} />} iconColor="#5E60CE" loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Pods" value={stats.totalPods} icon={<Box size={20} />} iconColor="#06AED5" loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Requests" value={formatNumber(stats.totalRequests)} icon={<Activity size={20} />} iconColor="#73C991" loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Avg Error Rate"
            value={`${stats.avgErrorRate.toFixed(2)}%`}
            icon={<AlertCircle size={20} />}
            iconColor={stats.avgErrorRate > 5 ? '#F04438' : stats.avgErrorRate > 1 ? '#F79009' : '#73C991'}
            loading={isLoading}
          />
        </Col>
      </Row>

      {/* Configurable Charts — request rate & error rate */}
      {dashboardConfig && (
        <div style={{ marginBottom: 16 }}>
          <ConfigurableDashboard
            config={dashboardConfig}
            dataSources={chartDataSources}
          />
        </div>
      )}

      {viewMode === 'table' ? (
        <Card className="infrastructure-table-card">
          <DataTable
            columns={columns}
            data={tableData}
            loading={isLoading}
            expandable={{
              expandedRowRender,
              rowExpandable: (record) =>
                record.services && Array.isArray(record.services) && record.services.length > 3,
            }}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {tableData.map((item) => {
            const errorRate = item.spanCount > 0 ? (item.errorCount / item.spanCount) * 100 : 0;
            const loadPercent = (item.spanCount / maxRequests) * 100;
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
                <Card size="small" className="infra-grid-card">
                  <div className="infra-grid-header">
                    <Server size={16} />
                    <span className="infra-grid-host">{item.host}</span>
                  </div>
                  <div className="infra-grid-gauge">
                    <GaugeChart value={loadPercent} label="Load" size={100} />
                  </div>
                  <div className="infra-grid-stats">
                    <div className="infra-grid-stat">
                      <span className="infra-grid-stat-label">Requests</span>
                      <span className="infra-grid-stat-value">{formatNumber(item.spanCount)}</span>
                    </div>
                    <div className="infra-grid-stat">
                      <span className="infra-grid-stat-label">Error Rate</span>
                      <span className="infra-grid-stat-value" style={{ color: errorRate > 5 ? '#F04438' : errorRate > 1 ? '#F79009' : '#73C991' }}>
                        {errorRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="infra-grid-stat">
                      <span className="infra-grid-stat-label">Latency</span>
                      <span className="infra-grid-stat-value">{formatDuration(item.avgLatency)}</span>
                    </div>
                  </div>
                  {item.services && item.services.length > 0 && (
                    <div className="infra-grid-services">
                      {item.services.slice(0, 3).map((s, i) => (
                        <Tag key={i} color="blue" style={{ fontSize: 10 }}>{s}</Tag>
                      ))}
                      {item.services.length > 3 && (
                        <Tag color="default" style={{ fontSize: 10 }}>+{item.services.length - 3}</Tag>
                      )}
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
