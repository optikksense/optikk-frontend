import { Row, Col, Card, Progress } from 'antd';

import { formatNumber, formatDuration } from '@utils/formatters';

/**
 *
 * @param root0
 * @param root0.serviceMetrics
 * @param root0.onServiceSelect
 */
export function ServiceMetricsGrid({ serviceMetrics, onServiceSelect }) {
    if (!serviceMetrics || serviceMetrics.length === 0) return null;

    return (
        <Row gutter={[16, 16]}>
            {serviceMetrics.slice(0, 12).map((service) => {
                const errorRate = service.request_count > 0
                    ? (service.error_count / service.request_count) * 100
                    : 0;
                return (
                    <Col xs={24} sm={12} md={8} lg={6} key={service.service_name}>
                        <Card
                            size="small"
                            className="chart-card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onServiceSelect(service.service_name)}
                        >
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                                    {service.service_name}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                                    <span>Requests</span>
                                    <span>{formatNumber(service.request_count)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                                    <span>Error Rate</span>
                                    <span style={{ color: errorRate > 5 ? '#F04438' : errorRate > 1 ? '#F79009' : '#73C991' }}>
                                        {errorRate.toFixed(2)}%
                                    </span>
                                </div>
                                <Progress
                                    percent={Math.min(errorRate, 100)}
                                    size="small"
                                    strokeColor={errorRate > 5 ? '#F04438' : errorRate > 1 ? '#F79009' : '#73C991'}
                                    showInfo={false}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                                <span>Avg: {formatDuration(service.avg_latency)}</span>
                                <span>P95: {formatDuration(service.p95_latency)}</span>
                            </div>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
}
