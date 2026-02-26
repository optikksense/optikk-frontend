import { Card, Col, Empty, Row, Skeleton, Tag } from 'antd';
import { ArrowRight, GitBranch, Network, ShieldAlert } from 'lucide-react';
import { FilterBar, HealthIndicator, StatCardsGrid, DataTable } from '@components/common';
import ServiceGraph from '@components/charts/specialized/ServiceGraph';
import { formatNumber, formatDuration } from '@utils/formatters';

export function ServiceTopologyTab({
    topologyStats,
    topologyLoading,
    topologyError,
    topologyNodes,
    topologyEdges,
    criticalServices,
    searchQuery,
    setSearchQuery,
    healthFilter,
    setHealthFilter,
    healthOptions,
    dependencyColumns,
    dependencyRows,
    onNodeClick,
}) {
    return (
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
                                onNodeClick={(node) => onNodeClick(node.name)}
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
                                        onClick={() => onNodeClick(service.name)}
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
}
