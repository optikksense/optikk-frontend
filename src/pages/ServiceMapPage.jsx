import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Skeleton, Empty, List, Tag } from 'antd';
import { Network, Activity, AlertCircle, ArrowRight } from 'lucide-react';
import { useTimeRangeQuery } from '../hooks/useTimeRangeQuery';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import HealthIndicator from '../components/common/HealthIndicator';
import ServiceGraph from '../components/charts/ServiceGraph';
import { serviceMapService } from '../services/serviceMapService';
import { formatNumber } from '../utils/formatters';
import './ServiceMapPage.css';

export default function ServiceMapPage() {
  const navigate = useNavigate();
  const [healthFilter, setHealthFilter] = useState('all');

  const {
    data: topologyData,
    isLoading,
    error,
  } = useTimeRangeQuery(
    'service-topology',
    (teamId, startTime, endTime) =>
      serviceMapService.getTopology(teamId, startTime, endTime)
  );

  const allNodes = topologyData?.nodes || [];
  const allEdges = topologyData?.edges || [];

  // Filter nodes by health status
  const filteredNodes = useMemo(() => {
    if (healthFilter === 'all') return allNodes;
    return allNodes.filter((n) => n.status?.toLowerCase() === healthFilter);
  }, [allNodes, healthFilter]);

  // Filter edges to only include filtered nodes
  const filteredEdges = useMemo(() => {
    const nodeNames = new Set(filteredNodes.map((n) => n.name));
    return allEdges.filter((e) => nodeNames.has(e.source) && nodeNames.has(e.target));
  }, [allEdges, filteredNodes]);

  const stats = useMemo(() => {
    const totalServices = allNodes.length;
    const healthyServices = allNodes.filter((n) => n.status?.toLowerCase() === 'healthy').length;
    const totalDependencies = allEdges.length;
    return { totalServices, healthyServices, totalDependencies };
  }, [allNodes, allEdges]);

  const handleNodeClick = (node) => navigate(`/services/${node.name}`);
  const handleServiceClick = (serviceName) => navigate(`/services/${serviceName}`);

  const healthOptions = [
    { key: 'all', label: 'All', count: allNodes.length },
    { key: 'healthy', label: 'Healthy', count: allNodes.filter((n) => n.status?.toLowerCase() === 'healthy').length, color: '#73C991' },
    { key: 'degraded', label: 'Degraded', count: allNodes.filter((n) => n.status?.toLowerCase() === 'degraded').length, color: '#F79009' },
    { key: 'unhealthy', label: 'Unhealthy', count: allNodes.filter((n) => n.status?.toLowerCase() === 'unhealthy').length, color: '#F04438' },
  ];

  return (
    <div className="service-map-page">
      <PageHeader
        title="Service Map"
        icon={<Network size={24} />}
        subtitle="Visualize service dependencies and health"
      />

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <StatCard title="Total Services" value={formatNumber(stats.totalServices)} icon={<Network size={20} />} iconColor="#5E60CE" />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard title="Healthy Services" value={formatNumber(stats.healthyServices)} icon={<Activity size={20} />} iconColor="#73C991" />
        </Col>
        <Col xs={24} sm={8}>
          <StatCard title="Dependencies" value={formatNumber(stats.totalDependencies)} icon={<ArrowRight size={20} />} iconColor="#06AED5" />
        </Col>
      </Row>

      {/* Health Filter Chips */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
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

      {/* Main Content */}
      <Row gutter={[16, 16]} className="content-row">
        <Col xs={24} lg={16}>
          <Card title="Service Dependency Graph" className="service-graph-card" bordered={false}>
            {isLoading ? (
              <div className="loading-container">
                <Skeleton active paragraph={{ rows: 10 }} />
              </div>
            ) : error ? (
              <div className="error-container">
                <Empty
                  description={
                    <span className="error-message">
                      <AlertCircle size={48} />
                      <p>Failed to load service topology</p>
                      <p className="error-details">{error.message}</p>
                    </span>
                  }
                />
              </div>
            ) : filteredNodes.length === 0 ? (
              <Empty description="No services found for the selected filter" className="empty-state" />
            ) : (
              <ServiceGraph
                nodes={filteredNodes}
                edges={filteredEdges}
                onNodeClick={handleNodeClick}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Service List" className="service-list-card" bordered={false}>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : filteredNodes.length === 0 ? (
              <Empty description="No services" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                className="service-list"
                dataSource={filteredNodes}
                renderItem={(node) => (
                  <List.Item className="service-list-item" onClick={() => handleServiceClick(node.name)}>
                    <div className="service-list-item-content">
                      <div className="service-info">
                        <HealthIndicator status={node.status} size="small" />
                        <span className="service-name">{node.name}</span>
                      </div>
                      <div className="service-metrics">
                        <div className="metric">
                          <span className="metric-label">Requests:</span>
                          <span className="metric-value">{formatNumber(node.requestCount || 0)}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Error:</span>
                          <span className={`metric-value ${node.errorRate > 5 ? 'error-high' : ''}`}>
                            {node.errorRate?.toFixed(2) || 0}%
                          </span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Latency:</span>
                          <span className="metric-value">{node.avgLatency?.toFixed(0) || 0}ms</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="arrow-icon" />
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
