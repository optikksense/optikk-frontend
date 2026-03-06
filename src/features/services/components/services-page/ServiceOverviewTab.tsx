import { Col, Progress, Row, Segmented, Tag } from 'antd';
import { Activity, AlertCircle, Layers, LayoutGrid, List, ShieldAlert } from 'lucide-react';

import SparklineChart from '@components/charts/micro/SparklineChart';
import { FilterBar, HealthIndicator, StatCardsGrid } from '@components/common';
import ObservabilityDataBoard, { boardHeight } from '@components/common/data-display/ObservabilityDataBoard';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { formatNumber, formatDuration } from '@utils/formatters';

const SERVICE_COLUMNS = [
    { key: 'serviceName', label: 'Service Name', defaultWidth: 200 },
    { key: 'status', label: 'Status', defaultWidth: 120 },
    { key: 'requestCount', label: 'Total Requests', defaultWidth: 150 },
    { key: 'errorRate', label: 'Error Rate', defaultWidth: 120 },
    { key: 'avgLatency', label: 'Avg Latency', defaultWidth: 120 },
    { key: 'p95Latency', label: 'P95 Latency', defaultWidth: 120 },
    { key: 'p99Latency', label: 'P99 Latency', defaultWidth: 120, flex: true },
];

/**
 *
 * @param root0
 * @param root0.totalServices
 * @param root0.healthyServices
 * @param root0.degradedServices
 * @param root0.unhealthyServices
 * @param root0.isLoading
 * @param root0.dashboardConfig
 * @param root0.chartDataSources
 * @param root0.searchQuery
 * @param root0.setSearchQuery
 * @param root0.viewMode
 * @param root0.setViewMode
 * @param root0.tableData
 * @param root0.onNodeClick
 */
export function ServiceOverviewTab({
    totalServices,
    healthyServices,
    degradedServices,
    unhealthyServices,
    isLoading,
    dashboardConfig,
    chartDataSources,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    tableData,
    onNodeClick,
}: any) {
    return (
        <>
            <StatCardsGrid
                style={{ marginBottom: 24 }}
                defaultColProps={{ xs: 24, sm: 12, lg: 6 }}
                stats={[
                    { title: 'Total Services', value: totalServices, icon: <Layers size={20} />, iconColor: '#6366F1', loading: isLoading },
                    { title: 'Healthy', value: healthyServices, icon: <Activity size={20} />, iconColor: '#73C991', loading: isLoading, description: `${totalServices > 0 ? Number(((healthyServices / totalServices) * 100)).toFixed(2) : 0}% of total` },
                    { title: 'Degraded', value: degradedServices, icon: <AlertCircle size={20} />, iconColor: '#F79009', loading: isLoading, description: `${totalServices > 0 ? Number(((degradedServices / totalServices) * 100)).toFixed(2) : 0}% of total` },
                    { title: 'Unhealthy', value: unhealthyServices, icon: <ShieldAlert size={20} />, iconColor: '#F04438', loading: isLoading, description: `${totalServices > 0 ? Number(((unhealthyServices / totalServices) * 100)).toFixed(2) : 0}% of total` },
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
                    },
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
                <div style={{ height: boardHeight(25) }}>
                    <ObservabilityDataBoard
                        columns={SERVICE_COLUMNS}
                        rows={tableData}
                        rowKey={(row) => row.serviceName}
                        entityName="service"
                        storageKey="services-overview-board-cols"
                        isLoading={isLoading}
                        renderRow={(row, { colWidths, visibleCols }) => (
                            <>
                                {visibleCols.serviceName && (
                                    <div
                                        style={{ width: colWidths.serviceName, flexShrink: 0, fontWeight: 600, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-primary, #5E60CE)' }}
                                        onClick={() => onNodeClick(row.serviceName)}
                                    >
                                        {row.serviceName}
                                    </div>
                                )}
                                {visibleCols.status && (
                                    <div style={{ width: colWidths.status, flexShrink: 0 }}>
                                        <HealthIndicator status={row.status} showLabel />
                                    </div>
                                )}
                                {visibleCols.requestCount && (
                                    <div style={{ width: colWidths.requestCount, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>{formatNumber(row.requestCount)}</span>
                                        {row.requestTrend && (
                                            <SparklineChart data={row.requestTrend} color="#1890ff" width={50} height={18} />
                                        )}
                                    </div>
                                )}
                                {visibleCols.errorRate && (
                                    <div style={{ width: colWidths.errorRate, flexShrink: 0, color: row.errorRate > 5 ? '#F04438' : row.errorRate > 1 ? '#F79009' : '#73C991', fontWeight: 600 }}>
                                        {Number(row.errorRate).toFixed(2)}%
                                    </div>
                                )}
                                {visibleCols.avgLatency && (
                                    <div style={{ width: colWidths.avgLatency, flexShrink: 0, fontFamily: 'monospace', fontSize: 12 }}>
                                        {formatDuration(row.avgLatency)}
                                    </div>
                                )}
                                {visibleCols.p95Latency && (
                                    <div style={{ width: colWidths.p95Latency, flexShrink: 0, fontFamily: 'monospace', fontSize: 12 }}>
                                        {formatDuration(row.p95Latency)}
                                    </div>
                                )}
                                {visibleCols.p99Latency && (
                                    <div style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }}>
                                        {formatDuration(row.p99Latency)}
                                    </div>
                                )}
                            </>
                        )}
                        emptyTips={[
                            { num: 1, text: <>Clear the <strong>search</strong> filter above</> },
                            { num: 2, text: <>Widen the <strong>time range</strong> in the top bar</> },
                            { num: 3, text: <>Ensure your services are sending <strong>OTLP telemetry</strong></> },
                        ]}
                    />
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    {tableData.map((service) => {
                        const status = service.status;
                        return (
                            <Col xs={24} sm={12} md={8} lg={6} key={service.serviceName}>
                                <div
                                    className="services-grid-card"
                                    onClick={() => onNodeClick(service.serviceName)}
                                    style={{
                                        borderLeft: `3px solid ${status === 'healthy' ? '#73C991' : status === 'degraded' ? '#F79009' : '#F04438'}`,
                                        height: '100%',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 8,
                                        padding: 16,
                                        cursor: 'pointer',
                                        transition: 'background 0.08s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary, #1A1A1A)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <HealthIndicator status={status} size={8} />
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
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </>
    );
}
