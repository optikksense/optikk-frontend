import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs } from 'antd';
import { Layers, Network } from 'lucide-react';
import { PageHeader } from '@components/common';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { HealthIndicator } from '@components/common';

import { useServicesData } from '../../hooks/useServicesData';
import { ServiceOverviewTab } from '../../components/services-page/ServiceOverviewTab';
import { ServiceTopologyTab } from '../../components/services-page/ServiceTopologyTab';
import { formatNumber, formatDuration } from '@utils/formatters';
import SparklineChart from '@components/charts/micro/SparklineChart';

import './ServicesPage.css';

export default function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'topology' ? 'topology' : 'overview');
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const { config: dashboardConfig } = useDashboardConfig('services');

  const {
    isLoading,
    chartDataSources,
    topologyLoading,
    topologyError,
    totalServices,
    healthyServices,
    degradedServices,
    unhealthyServices,
    avgErrorRate,
    avgLatency,
    tableData,
    topologyNodes,
    topologyEdges,
    topologyStats,
    criticalServices,
    dependencyRows,
    healthOptions,
  } = useServicesData({ searchQuery, sortField, sortOrder, healthFilter });

  useEffect(() => {
    const queryTab = searchParams.get('tab') === 'topology' ? 'topology' : 'overview';
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [searchParams, activeTab]);

  const onTabChange = (key) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    if (key === 'topology') {
      next.set('tab', 'topology');
    } else {
      next.delete('tab');
    }
    setSearchParams(next, { replace: true });
  };

  const onNodeClick = (name) => {
    navigate(`/services/${encodeURIComponent(name)}`);
  };

  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 200,
      render: (name) => (
        <a onClick={() => onNodeClick(name)} style={{ fontWeight: 600 }}>
          {name}
        </a>
      ),
      sorter: true,
      onHeaderCell: () => ({
        onClick: () => {
          if (sortField === 'serviceName') {
            setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
          } else {
            setSortField('serviceName');
            setSortOrder('ascend');
          }
        },
      }),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <HealthIndicator status={status} showLabel />,
    },
    {
      title: 'Total Requests',
      dataIndex: 'requestCount',
      key: 'requestCount',
      width: 150,
      render: (count, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{formatNumber(count)}</span>
          {record.requestTrend && (
            <SparklineChart
              data={record.requestTrend}
              color="#1890ff"
              width={60}
              height={20}
            />
          )}
        </div>
      ),
      sorter: true,
      onHeaderCell: () => ({
        onClick: () => {
          if (sortField === 'requestCount') {
            setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
          } else {
            setSortField('requestCount');
            setSortOrder('ascend');
          }
        },
      }),
    },
    {
      title: 'Error Rate',
      dataIndex: 'errorRate',
      key: 'errorRate',
      width: 140,
      render: (rate) => (
        <span style={{ color: rate > 5 ? '#F04438' : rate > 1 ? '#F79009' : '#73C991', fontWeight: 600 }}>
          {Number(rate).toFixed(2)}%
        </span>
      ),
      sorter: true,
      onHeaderCell: () => ({
        onClick: () => {
          if (sortField === 'errorRate') {
            setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
          } else {
            setSortField('errorRate');
            setSortOrder('ascend');
          }
        },
      }),
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avgLatency',
      key: 'avgLatency',
      width: 120,
      render: (latency) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {formatDuration(latency)}
        </span>
      ),
      sorter: true,
      onHeaderCell: () => ({
        onClick: () => {
          if (sortField === 'avgLatency') {
            setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
          } else {
            setSortField('avgLatency');
            setSortOrder('ascend');
          }
        },
      }),
    },
    {
      title: 'P95 Latency',
      dataIndex: 'p95Latency',
      key: 'p95Latency',
      width: 120,
      render: (latency) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {formatDuration(latency)}
        </span>
      ),
      sorter: true,
      onHeaderCell: () => ({
        onClick: () => {
          if (sortField === 'p95Latency') {
            setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
          } else {
            setSortField('p95Latency');
            setSortOrder('ascend');
          }
        },
      }),
    },
    {
      title: 'P99 Latency',
      dataIndex: 'p99Latency',
      key: 'p99Latency',
      width: 120,
      render: (latency) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {formatDuration(latency)}
        </span>
      ),
      sorter: true,
      onHeaderCell: () => ({
        onClick: () => {
          if (sortField === 'p99Latency') {
            setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
          } else {
            setSortField('p99Latency');
            setSortOrder('ascend');
          }
        },
      }),
    },
  ];

  const dependencyColumns = [
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 180,
      render: (value, row) => (
        <span className="services-dep-cell">
          <HealthIndicator status={row.sourceStatus} size={7} />
          <a onClick={() => navigate(`/services/${encodeURIComponent(value)}`)}>{value}</a>
        </span>
      ),
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      width: 180,
      render: (value, row) => (
        <span className="services-dep-cell">
          <HealthIndicator status={row.targetStatus} size={7} />
          <a onClick={() => navigate(`/services/${encodeURIComponent(value)}`)}>{value}</a>
        </span>
      ),
    },
    {
      title: 'Calls',
      dataIndex: 'callCount',
      key: 'callCount',
      width: 120,
      render: (value) => formatNumber(value),
      sorter: (a, b) => a.callCount - b.callCount,
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avgLatency',
      key: 'avgLatency',
      width: 120,
      render: (value) => formatDuration(value),
      sorter: (a, b) => a.avgLatency - b.avgLatency,
    },
    {
      title: 'Error Rate',
      dataIndex: 'errorRate',
      key: 'errorRate',
      width: 140,
      render: (value) => (
        <span style={{ color: value > 5 ? '#F04438' : value > 1 ? '#F79009' : '#73C991', fontWeight: 600 }}>
          {value.toFixed(2)}%
        </span>
      ),
      sorter: (a, b) => a.errorRate - b.errorRate,
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk',
      key: 'risk',
      width: 140,
      render: (value) => (
        <span style={{ color: value > 70 ? '#F04438' : value > 45 ? '#F79009' : '#73C991', fontWeight: 600 }}>
          {value}
        </span>
      ),
      sorter: (a, b) => a.risk - b.risk,
    },
  ];

  return (
    <div className="services-page">
      <PageHeader
        title="Services"
        subtitle="Global service health and dependency topology"
        icon={<Layers size={24} />}
      />

      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        className="services-tabs"
        items={[
          {
            key: 'overview',
            label: <span><Layers size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Overview</span>,
            children: (
              <ServiceOverviewTab
                totalServices={totalServices}
                healthyServices={healthyServices}
                degradedServices={degradedServices}
                unhealthyServices={unhealthyServices}
                avgErrorRate={avgErrorRate}
                avgLatency={avgLatency}
                isLoading={isLoading}
                dashboardConfig={dashboardConfig}
                chartDataSources={chartDataSources}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                viewMode={viewMode}
                setViewMode={setViewMode}
                tableData={tableData}
                onNodeClick={onNodeClick}
              />
            )
          },
          {
            key: 'topology',
            label: <span><Network size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Topology</span>,
            children: (
              <ServiceTopologyTab
                topologyStats={topologyStats}
                topologyLoading={topologyLoading}
                topologyError={topologyError}
                topologyNodes={topologyNodes}
                topologyEdges={topologyEdges}
                criticalServices={criticalServices}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                healthFilter={healthFilter}
                setHealthFilter={setHealthFilter}
                healthOptions={healthOptions}
                dependencyRows={dependencyRows}
                onNodeClick={onNodeClick}
              />
            )
          }
        ]}
      />
    </div>
  );
}
