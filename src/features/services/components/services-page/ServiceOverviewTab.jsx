import { Card, Col, Progress, Row, Segmented, Tag } from 'antd';
import { Activity, AlertCircle, Layers, LayoutGrid, List, ShieldAlert } from 'lucide-react';
import { DataTable, FilterBar, HealthIndicator, StatCardsGrid } from '@components/common';
import SparklineChart from '@components/charts/micro/SparklineChart';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { formatNumber, formatDuration } from '@utils/formatters';

export function ServiceOverviewTab({
    totalServices,
    healthyServices,
    degradedServices,
    unhealthyServices,
    avgErrorRate,
    avgLatency,
    isLoading,
    dashboardConfig,
    chartDataSources,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    columns,
    tableData,
    onNodeClick,
}) {
    return (
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

            {dashboardConfig && (
                <div style={{ marginBottom: 16 }}>
                    <ConfigurableDashboard
                        config={dashboardConfig}
                        dataSources={chartDataSources}
                    />
                </div>
            )}

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
                <Row gutter={[16, 16]}>
                    {tableData.map((service) => {
                        const status = service.status;
                        return (
                            <Col xs={24} sm={12} md={8} lg={6} key={service.serviceName}>
                                <Card
                                    className="services-grid-card"
                                    hoverable
                                    onClick={() => onNodeClick(service.serviceName)}
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
}
