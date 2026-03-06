import { Card, Col, Empty, Row, Skeleton, Tag } from 'antd';
import { ArrowRight, GitBranch, Network, ShieldAlert } from 'lucide-react';

import ServiceGraph from '@components/charts/specialized/ServiceGraph';
import { FilterBar, HealthIndicator, StatCardsGrid } from '@components/common';
import ObservabilityDataBoard, { boardHeight } from '@components/common/data-display/ObservabilityDataBoard';

import { formatNumber, formatDuration } from '@utils/formatters';

const DEP_COLUMNS = [
    { key: 'source', label: 'Source', defaultWidth: 180 },
    { key: 'target', label: 'Target', defaultWidth: 180 },
    { key: 'callCount', label: 'Calls', defaultWidth: 120 },
    { key: 'avgLatency', label: 'Avg Latency', defaultWidth: 120 },
    { key: 'errorRate', label: 'Error Rate', defaultWidth: 120 },
    { key: 'risk', label: 'Risk Score', defaultWidth: 120, flex: true },
];

/**
 *
 * @param root0
 * @param root0.topologyStats
 * @param root0.topologyLoading
 * @param root0.topologyError
 * @param root0.topologyNodes
 * @param root0.topologyEdges
 * @param root0.criticalServices
 * @param root0.searchQuery
 * @param root0.setSearchQuery
 * @param root0.healthFilter
 * @param root0.setHealthFilter
 * @param root0.healthOptions
 * @param root0.dependencyRows
 * @param root0.onNodeClick
 */
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
    dependencyRows,
    onNodeClick,
}: any) {
    return (
        <>
            <StatCardsGrid
                style={{ marginBottom: 16 }}
                stats={[
                    { title: 'Services in Graph', value: formatNumber(topologyStats.graphServices), icon: <Network size={20} />, iconColor: '#5E60CE', loading: topologyLoading },
                    { title: 'Dependencies', value: formatNumber(topologyStats.dependencies), icon: <GitBranch size={20} />, iconColor: '#06AED5', loading: topologyLoading },
                    { title: 'Critical Services', value: formatNumber(topologyStats.criticalServices), icon: <ShieldAlert size={20} />, iconColor: '#F79009', loading: topologyLoading },
                    { title: 'High-Risk Edges', value: formatNumber(topologyStats.highRiskEdges), icon: <ArrowRight size={20} />, iconColor: '#F04438', loading: topologyLoading },
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
                    },
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
                <Col xs={24}>
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
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24}>
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
                <div style={{ height: boardHeight(15) }}>
                    <ObservabilityDataBoard
                        columns={DEP_COLUMNS}
                        rows={dependencyRows}
                        rowKey={(row) => row.key}
                        entityName="dependency"
                        storageKey="services-deps-board-cols"
                        isLoading={topologyLoading}
                        renderRow={(row, { colWidths, visibleCols }) => (
                            <>
                                {visibleCols.source && (
                                    <div style={{ width: colWidths.source, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <HealthIndicator status={row.sourceStatus} size={7} />
                                        <a onClick={() => onNodeClick(row.source)} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.source}</a>
                                    </div>
                                )}
                                {visibleCols.target && (
                                    <div style={{ width: colWidths.target, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <HealthIndicator status={row.targetStatus} size={7} />
                                        <a onClick={() => onNodeClick(row.target)} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.target}</a>
                                    </div>
                                )}
                                {visibleCols.callCount && (
                                    <div style={{ width: colWidths.callCount, flexShrink: 0 }}>{formatNumber(row.callCount)}</div>
                                )}
                                {visibleCols.avgLatency && (
                                    <div style={{ width: colWidths.avgLatency, flexShrink: 0 }}>{formatDuration(row.avgLatency)}</div>
                                )}
                                {visibleCols.errorRate && (
                                    <div style={{ width: colWidths.errorRate, flexShrink: 0, color: row.errorRate > 5 ? '#F04438' : row.errorRate > 1 ? '#F79009' : '#73C991', fontWeight: 600 }}>
                                        {row.errorRate.toFixed(2)}%
                                    </div>
                                )}
                                {visibleCols.risk && (
                                    <div style={{ flex: 1, color: row.risk > 70 ? '#F04438' : row.risk > 45 ? '#F79009' : '#73C991', fontWeight: 600 }}>
                                        {row.risk}
                                    </div>
                                )}
                            </>
                        )}
                        emptyTips={[
                            { num: 1, text: <>No service dependencies detected yet</> },
                            { num: 2, text: <>Ensure services are making <strong>outbound calls</strong> to each other</> },
                        ]}
                    />
                </div>
            </Card>
        </>
    );
}
