import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Row, Col, Card, Progress, Segmented, Tag, Input, Tabs, Empty, Skeleton } from 'antd';
import {
  Layers,
  Activity,
  AlertCircle,
  LayoutGrid,
  List,
  Search,
  Network,
  ArrowRight,
  ShieldAlert,
  GitBranch,
} from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { PageHeader, DataTable, StatCard, HealthIndicator, StatCardsGrid, FilterBar } from '@components/common';
import SparklineChart from '@components/charts/SparklineChart';
import ServiceGraph from '@components/charts/ServiceGraph';
import { v1Service } from '@services/v1Service';
import { serviceMapService } from '@services/serviceMapService';
import { formatNumber, formatDuration } from '@utils/formatters';
import './ServicesPage.css';

function getServiceStatus(errorRate) {
  if (errorRate > 5) return 'unhealthy';
  if (errorRate > 1) return 'degraded';
  return 'healthy';
}

function calcRiskScore({ errorRate, avgLatency, dependencyCount }) {
  const errFactor = Math.min(errorRate * 12, 100);
  const latencyFactor = Math.min((avgLatency || 0) / 80, 100);
  const dependencyFactor = Math.min((dependencyCount || 0) * 8, 100);
  return Number((errFactor * 0.5 + latencyFactor * 0.3 + dependencyFactor * 0.2).toFixed(1));
}

export default function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'topology' ? 'topology' : 'overview');
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  const { data, isLoading } = useTimeRangeQuery(
    'services-metrics',
    (teamId, startTime, endTime) => v1Service.getServiceMetrics(teamId, startTime, endTime)
  );

  const {
    data: topologyData,
    isLoading: topologyLoading,
    error: topologyError,
  } = useTimeRangeQuery(
    'service-topology',
    (teamId, startTime, endTime) => serviceMapService.getTopology(teamId, startTime, endTime)
  );

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

  const services = Array.isArray(data) ? data : [];
  const allTopologyNodes = Array.isArray(topologyData?.nodes) ? topologyData.nodes : [];
  const allTopologyEdges = Array.isArray(topologyData?.edges) ? topologyData.edges : [];

  const serviceRows = useMemo(() => {
    return services.map((service) => {
      const requestCount = Number(service.request_count) || 0;
      const errorCount = Number(service.error_count) || 0;
      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
      const avgLatency = Number(service.avg_latency) || 0;

      return {
        serviceName: service.service_name,
        errorRate,
        requestCount,
        errorCount,
        avgLatency,
        p95Latency: Number(service.p95_latency) || 0,
        p99Latency: Number(service.p99_latency) || 0,
        status: getServiceStatus(errorRate),
        requestTrend: Array.from({ length: 20 }, () => Math.random() * requestCount * 0.2 + requestCount * 0.8),
      };
    });
  }, [services]);

  const servicesByName = useMemo(
    () => new Map(serviceRows.map((row) => [row.serviceName, row])),
    [serviceRows]
  );

  const adjacency = useMemo(() => {
    const out = new Map();
    const inbound = new Map();

    allTopologyEdges.forEach((edge) => {
      out.set(edge.source, (out.get(edge.source) || 0) + 1);
      inbound.set(edge.target, (inbound.get(edge.target) || 0) + 1);
    });

    return { out, inbound };
  }, [allTopologyEdges]);

  const normalizedTopologyNodes = useMemo(() => {
    const nodeMap = new Map();

    allTopologyNodes.forEach((node) => {
      const serviceMetrics = servicesByName.get(node.name);
      const errorRate = Number(node.errorRate ?? serviceMetrics?.errorRate ?? 0);
      const avgLatency = Number(node.avgLatency ?? serviceMetrics?.avgLatency ?? 0);
      const requestCount = Number(node.requestCount ?? serviceMetrics?.requestCount ?? 0);
      const status = node.status || serviceMetrics?.status || getServiceStatus(errorRate);
      const dependencyCount = (adjacency.out.get(node.name) || 0) + (adjacency.inbound.get(node.name) || 0);

      nodeMap.set(node.name, {
        ...node,
        name: node.name,
        requestCount,
        errorRate,
        avgLatency,
        status,
        dependencyCount,
        riskScore: calcRiskScore({ errorRate, avgLatency, dependencyCount }),
      });
    });

    serviceRows.forEach((row) => {
      if (nodeMap.has(row.serviceName)) return;
      const dependencyCount = (adjacency.out.get(row.serviceName) || 0) + (adjacency.inbound.get(row.serviceName) || 0);

      nodeMap.set(row.serviceName, {
        name: row.serviceName,
        requestCount: row.requestCount,
        errorRate: row.errorRate,
        avgLatency: row.avgLatency,
        status: row.status,
        dependencyCount,
        riskScore: calcRiskScore({
          errorRate: row.errorRate,
          avgLatency: row.avgLatency,
          dependencyCount,
        }),
      });
    });

    return Array.from(nodeMap.values());
  }, [allTopologyNodes, servicesByName, serviceRows, adjacency]);

  const {
    totalServices,
    healthyServices,
    degradedServices,
    unhealthyServices,
    avgErrorRate,
    avgLatency,
    tableData,
  } = useMemo(() => {
    const total = serviceRows.length;
    const healthy = serviceRows.filter((s) => s.status === 'healthy').length;
    const degraded = serviceRows.filter((s) => s.status === 'degraded').length;
    const unhealthy = serviceRows.filter((s) => s.status === 'unhealthy').length;

    const errSum = serviceRows.reduce((acc, row) => acc + row.errorRate, 0);
    const latSum = serviceRows.reduce((acc, row) => acc + row.avgLatency, 0);

    const filteredBySearch = searchQuery
      ? serviceRows.filter((s) => s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
      : serviceRows;

    const sorted = sortField && sortOrder
      ? [...filteredBySearch].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortOrder === 'ascend' ? comparison : -comparison;
      })
      : filteredBySearch;

    return {
      totalServices: total,
      healthyServices: healthy,
      degradedServices: degraded,
      unhealthyServices: unhealthy,
      avgErrorRate: total > 0 ? errSum / total : 0,
      avgLatency: total > 0 ? latSum / total : 0,
      tableData: sorted,
    };
  }, [serviceRows, searchQuery, sortField, sortOrder]);

  const topologyNodes = useMemo(() => {
    let rows = normalizedTopologyNodes;

    if (searchQuery) {
      rows = rows.filter((row) => row.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (healthFilter !== 'all') {
      rows = rows.filter((row) => row.status?.toLowerCase() === healthFilter);
    }

    return rows;
  }, [normalizedTopologyNodes, searchQuery, healthFilter]);

  const topologyNodeNames = useMemo(() => new Set(topologyNodes.map((n) => n.name)), [topologyNodes]);

  const topologyEdges = useMemo(
    () => allTopologyEdges.filter((edge) => topologyNodeNames.has(edge.source) && topologyNodeNames.has(edge.target)),
    [allTopologyEdges, topologyNodeNames]
  );

  const topologyStats = useMemo(() => {
    const unhealthy = topologyNodes.filter((n) => n.status === 'unhealthy').length;
    const degraded = topologyNodes.filter((n) => n.status === 'degraded').length;
    const highRiskEdges = topologyEdges.filter((e) => Number(e.errorRate) > 5).length;
    return {
      graphServices: topologyNodes.length,
      dependencies: topologyEdges.length,
      criticalServices: unhealthy + degraded,
      highRiskEdges,
    };
  }, [topologyNodes, topologyEdges]);

  const criticalServices = useMemo(() => {
    return [...topologyNodes]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 8);
  }, [topologyNodes]);

  const dependencyRows = useMemo(() => {
    return topologyEdges.map((edge, index) => {
      const source = normalizedTopologyNodes.find((n) => n.name === edge.source);
      const target = normalizedTopologyNodes.find((n) => n.name === edge.target);
      const errorRate = Number(edge.errorRate) || 0;
      const avgLatency = Number(edge.avgLatency) || 0;
      const callCount = Number(edge.callCount) || 0;

      return {
        key: `${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        sourceStatus: source?.status || 'unknown',
        targetStatus: target?.status || 'unknown',
        callCount,
        avgLatency,
        errorRate,
        risk: calcRiskScore({
          errorRate,
          avgLatency,
          dependencyCount: Number(source?.dependencyCount || 0) + Number(target?.dependencyCount || 0),
        }),
      };
    }).sort((a, b) => b.risk - a.risk);
  }, [topologyEdges, normalizedTopologyNodes]);

  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 200,
      render: (name) => (
        <a onClick={() => navigate(`/services/${encodeURIComponent(name)}`)} style={{ fontWeight: 600 }}>
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
      width: 200,
      render: (rate) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={Math.min(rate, 100)}
            size="small"
            strokeColor={rate > 5 ? '#F04438' : rate > 1 ? '#F79009' : '#73C991'}
            format={() => ''}
            style={{ flex: 1 }}
          />
          <span
            style={{
              color: rate > 5 ? '#F04438' : rate > 1 ? '#F79009' : '#73C991',
              minWidth: 50,
              fontSize: 12,
              fontWeight: rate > 5 ? 600 : 400,
            }}
          >
            {Number(rate).toFixed(2)}%
          </span>
        </div>
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

  const healthOptions = [
    { key: 'all', label: 'All', count: normalizedTopologyNodes.length },
    {
      key: 'healthy',
      label: 'Healthy',
      count: normalizedTopologyNodes.filter((n) => n.status === 'healthy').length,
      color: '#73C991',
    },
    {
      key: 'degraded',
      label: 'Degraded',
      count: normalizedTopologyNodes.filter((n) => n.status === 'degraded').length,
      color: '#F79009',
    },
    {
      key: 'unhealthy',
      label: 'Unhealthy',
      count: normalizedTopologyNodes.filter((n) => n.status === 'unhealthy').length,
      color: '#F04438',
    },
  ];

  const renderOverviewTab = () => (
    <>
      <StatCardsGrid
        style={{ marginBottom: 24 }}
        defaultColProps={{ xs: 24, sm: 12, lg: 4 }}
        stats={[
          { title: "Total Services", value: totalServices, icon: <Layers size={20} />, iconColor: "#6366F1", loading: isLoading },
          { title: "Healthy", value: healthyServices, icon: <Activity size={20} />, iconColor: "#73C991", loading: isLoading, description: `${totalServices > 0 ? Number(((healthyServices / totalServices) * 100)).toFixed(2) : 0}% of total` },
          { title: "Degraded", value: degradedServices, icon: <AlertCircle size={20} />, iconColor: "#F79009", loading: isLoading, description: `${totalServices > 0 ? Number(((degradedServices / totalServices) * 100)).toFixed(2) : 0}% of total` },
          { title: "Unhealthy", value: unhealthyServices, icon: <ShieldAlert size={20} />, iconColor: "#F04438", loading: isLoading, description: `${totalServices > 0 ? Number(((unhealthyServices / totalServices) * 100)).toFixed(2) : 0}% of total` },
          { title: "Avg Error Rate", value: `${avgErrorRate.toFixed(2)}%`, icon: <AlertCircle size={20} />, iconColor: avgErrorRate > 5 ? '#F04438' : avgErrorRate > 1 ? '#F79009' : '#73C991', loading: isLoading },
          { title: "Avg Latency", value: formatDuration(avgLatency), icon: <Activity size={20} />, iconColor: avgLatency > 1000 ? '#F79009' : '#06AED5', loading: isLoading }
        ]}
      />

      <FilterBar
        filters={[
          {
            type: 'search',
            key: 'search',
            placeholder: 'Search services...',
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            width: 460,
          }
        ]}
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

      <div className="services-health-tags" style={{ marginBottom: 16 }}>
        <Tag color="green">Healthy ({healthyServices})</Tag>
        <Tag color="orange">Degraded ({degradedServices})</Tag>
        <Tag color="red">Unhealthy ({unhealthyServices})</Tag>
      </div>

      {viewMode === 'table' ? (
        <Card className="services-panel-card">
          <DataTable
            columns={columns}
            data={tableData}
            loading={isLoading}
            rowKey="serviceName"
            showPagination={false}
          />
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {tableData.map((service) => {
            const status = service.status;
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={service.serviceName}>
                <Card
                  className="services-grid-card"
                  hoverable
                  onClick={() => navigate(`/services/${encodeURIComponent(service.serviceName)}`)}
                  style={{
                    borderLeft: `3px solid ${status === 'healthy' ? '#73C991' : status === 'degraded' ? '#F79009' : '#F04438'}`,
                    height: '100%',
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <HealthIndicator status={status} size="small" />
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {service.serviceName}
                    </span>
                  </div>

                  {service.requestTrend && (
                    <div style={{ marginBottom: 12 }}>
                      <SparklineChart
                        data={service.requestTrend}
                        color={status === 'healthy' ? '#73C991' : status === 'degraded' ? '#F79009' : '#F04438'}
                        width={200}
                        height={40}
                      />
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginBottom: 8,
                    }}
                  >
                    <span>{formatNumber(service.requestCount)} req</span>
                    <span
                      style={{
                        color: service.errorRate > 1 ? '#F04438' : 'var(--text-muted)',
                        fontWeight: service.errorRate > 5 ? 600 : 400,
                      }}
                    >
                      {service.errorRate.toFixed(2)}% err
                    </span>
                  </div>

                  <Progress
                    percent={Math.min(service.errorRate, 100)}
                    size="small"
                    showInfo={false}
                    strokeColor={service.errorRate > 5 ? '#F04438' : service.errorRate > 1 ? '#F79009' : '#73C991'}
                    style={{ marginBottom: 8 }}
                  />

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>Avg: {formatDuration(service.avgLatency)}</span>
                    <span>P95: {formatDuration(service.p95Latency)}</span>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );

  const renderTopologyTab = () => (
    <>
      <StatCardsGrid
        style={{ marginBottom: 16 }}
        stats={[
          { title: "Services in Graph", value: formatNumber(topologyStats.graphServices), icon: <Network size={20} />, iconColor: "#5E60CE", loading: topologyLoading },
          { title: "Dependencies", value: formatNumber(topologyStats.dependencies), icon: <GitBranch size={20} />, iconColor: "#06AED5", loading: topologyLoading },
          { title: "Critical Services", value: formatNumber(topologyStats.criticalServices), icon: <ShieldAlert size={20} />, iconColor: "#F79009", loading: topologyLoading },
          { title: "High-Risk Edges", value: formatNumber(topologyStats.highRiskEdges), icon: <ArrowRight size={20} />, iconColor: "#F04438", loading: topologyLoading }
        ]}
      />

      <FilterBar
        filters={[
          {
            type: 'search',
            key: 'searchGraph',
            placeholder: 'Filter graph by service name...',
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            width: 460,
          }
        ]}
        actions={
          <div className="services-health-tags">
            {healthOptions.map((opt) => (
              <Tag
                key={opt.key}
                style={{ cursor: 'pointer', borderColor: opt.color }}
                color={healthFilter === opt.key ? (opt.color || 'blue') : 'default'}
                onClick={() => setHealthFilter(opt.key)}
              >
                {opt.label} ({opt.count})
              </Tag>
            ))}
          </div>
        }
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Service Dependency Graph" className="services-panel-card services-graph-card" bordered={false} styles={{ body: { padding: '8px' } }}>
            {topologyLoading ? (
              <div className="services-loading-container">
                <Skeleton active paragraph={{ rows: 9 }} />
              </div>
            ) : topologyError ? (
              <Empty description="Failed to load topology" className="services-empty" />
            ) : topologyNodes.length === 0 ? (
              <Empty description="No services found for this filter" className="services-empty" />
            ) : (
              <ServiceGraph
                nodes={topologyNodes}
                edges={topologyEdges}
                onNodeClick={(node) => navigate(`/services/${encodeURIComponent(node.name)}`)}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Critical Service Risks" className="services-panel-card services-risk-card" bordered={false}>
            {topologyLoading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : criticalServices.length === 0 ? (
              <Empty description="No service risks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="services-risk-list">
                {criticalServices.map((service) => (
                  <button
                    key={service.name}
                    className="services-risk-item"
                    onClick={() => navigate(`/services/${encodeURIComponent(service.name)}`)}
                  >
                    <div className="services-risk-item-top">
                      <div className="services-risk-service">
                        <HealthIndicator status={service.status} size={8} />
                        <span>{service.name}</span>
                      </div>
                      <ArrowRight size={15} />
                    </div>
                    <div className="services-risk-meta">
                      <span>Risk {service.riskScore}</span>
                      <span>{service.errorRate.toFixed(2)}% errors</span>
                      <span>{formatDuration(service.avgLatency)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title="Dependency Contracts"
        className="services-panel-card"
        bordered={false}
        style={{ marginTop: 16 }}
        extra={<span className="services-card-extra">Top edges ranked by risk score</span>}
      >
        <DataTable
          columns={dependencyColumns}
          data={dependencyRows}
          loading={topologyLoading}
          rowKey="key"
          scroll={{ x: 900 }}
          showPagination={false}
          emptyText="No dependencies found"
        />
      </Card>
    </>
  );

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <Layers size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Overview
        </span>
      ),
      children: renderOverviewTab(),
    },
    {
      key: 'topology',
      label: (
        <span>
          <Network size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Topology
        </span>
      ),
      children: renderTopologyTab(),
    },
  ];

  return (
    <div className="services-page">
      <PageHeader
        title="Services"
        icon={<Layers size={24} />}
        subtitle="Unified health, performance, and dependency governance for production services"
      />

      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={tabItems}
        className="services-tabs"
      />
    </div>
  );
}
