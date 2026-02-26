import { useMemo } from 'react';
import { Card, Row, Col, Statistic, Empty } from 'antd';
import { Line } from 'react-chartjs-2';

export function MetricsResultView({ metricsSeries, metricsExpression, metricsLoading }) {
    const metricLineData = useMemo(() => ({
        labels: metricsSeries.map((point) => new Date(point.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: metricsExpression,
                data: metricsSeries.map((point) => Number(point.value.toFixed(6))),
                borderColor: '#06AED5',
                backgroundColor: 'rgba(6, 174, 213, 0.2)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.25,
                fill: true,
            },
        ],
    }), [metricsSeries, metricsExpression]);

    const metricLineOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: {
                ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
                grid: { color: 'rgba(148, 163, 184, 0.15)' },
            },
            y: {
                grid: { color: 'rgba(148, 163, 184, 0.15)' },
            },
        },
    }), []);

    const latestMetricValue = metricsSeries.length ? metricsSeries[metricsSeries.length - 1].value : 0;

    return (
        <>
            <Row gutter={[16, 16]} style={{ marginBottom: 12 }}>
                <Col xs={24} sm={12} md={8}>
                    <Card size="small">
                        <Statistic title="Points" value={metricsSeries.length} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card size="small">
                        <Statistic title="Latest Value" value={latestMetricValue} precision={4} />
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={8}>
                    <Card size="small">
                        <Statistic title="Refresh State" value={metricsLoading ? 'Fetching' : 'Ready'} />
                    </Card>
                </Col>
            </Row>

            <Card size="small">
                {metricsSeries.length > 0 ? (
                    <div className="explore-chart-wrap" style={{ height: 300 }}>
                        <Line data={metricLineData} options={metricLineOptions} />
                    </div>
                ) : (
                    <Empty description="No metric points for selected expression" />
                )}
            </Card>
        </>
    );
}
