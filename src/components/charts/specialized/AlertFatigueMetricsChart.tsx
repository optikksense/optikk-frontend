/**
 * Fix 21: AlertFatigueMetricsChart
 * Shows MTTD/MTTR, noisy alert %, and per-service noise breakdown.
 * Data comes from GET /api/v1/alerts/fatigue
 */
import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip,
    ResponsiveContainer, Cell
} from 'recharts';

interface ServiceNoiseRow {
    service: string;
    count: number;
    mttrMinutes: number;
    noisyCount: number;
}

interface AlertFatigueMetrics {
    serviceNoise: ServiceNoiseRow[];
    mttdMinutes: number;
    mttrMinutes: number;
    totalFiring: number;
    noisyCount: number;
    noisyPct: number;
}

interface AlertFatigueMetricsChartProps {
    data: AlertFatigueMetrics;
    loading?: boolean;
    title?: string;
}

const columns: ColumnsType<ServiceNoiseRow> = [
    {
        title: 'Service',
        dataIndex: 'service',
        key: 'service',
        render: v => <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{v}</span>,
    },
    {
        title: 'Alerts',
        dataIndex: 'count',
        sorter: (a, b) => b.count - a.count,
        defaultSortOrder: 'ascend',
        render: v => <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{v}</span>,
    },
    {
        title: 'MTTR (min)',
        dataIndex: 'mttrMinutes',
        render: (v: number) => (
            <span style={{
                color: v > 60 ? 'var(--severity-critical)' : v > 15 ? 'var(--severity-high)' : 'var(--severity-low)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
            }}>
                {v.toFixed(1)}
            </span>
        ),
    },
    {
        title: 'Noisy',
        dataIndex: 'noisyCount',
        render: (v: number, row) => (
            <span style={{
                color: v / row.count > 0.3 ? 'var(--severity-high)' : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
            }}>
                {v} ({row.count > 0 ? ((v / row.count) * 100).toFixed(0) : 0}%)
            </span>
        ),
    },
];

const AlertFatigueMetricsChart: React.FC<AlertFatigueMetricsChartProps> = ({
    data, loading = false, title = 'Alert Fatigue Metrics',
}) => {
    const noiseColor = data.noisyPct > 30
        ? 'var(--severity-critical)'
        : data.noisyPct > 15
            ? 'var(--severity-high)'
            : 'var(--severity-low)';

    return (
        <Card title={title} className="chart-card" size="small" loading={loading}>
            {/* KPI row */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Statistic
                        title={<span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>MTTR</span>}
                        value={data.mttrMinutes.toFixed(1)}
                        suffix="min"
                        valueStyle={{
                            color: data.mttrMinutes > 60 ? 'var(--severity-critical)' : 'var(--severity-low)',
                            fontSize: 'var(--text-xl)',
                            fontWeight: 'var(--font-bold)',
                        }}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title={<span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>MTTD</span>}
                        value={data.mttdMinutes.toFixed(1)}
                        suffix="min"
                        valueStyle={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title={<span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>Total Alerts</span>}
                        value={data.totalFiring}
                        valueStyle={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}
                    />
                </Col>
                <Col span={6}>
                    <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>
                            Noise ({data.noisyCount}/{data.totalFiring})
                        </div>
                        <Progress
                            percent={parseFloat(data.noisyPct.toFixed(1))}
                            strokeColor={noiseColor}
                            trailColor="var(--bg-tertiary)"
                            size="small"
                            format={p => <span style={{ color: noiseColor, fontSize: 'var(--text-xs)' }}>{p}%</span>}
                        />
                    </div>
                </Col>
            </Row>

            {/* Per-service bar chart */}
            {data.serviceNoise?.length > 0 && (
                <ResponsiveContainer width="100%" height={100} style={{ marginBottom: 12 }}>
                    <BarChart data={data.serviceNoise} layout="vertical">
                        <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="service" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} width={90} axisLine={false} tickLine={false} />
                        <ChartTooltip
                            contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 6, fontSize: 11 }}
                        />
                        <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                            {data.serviceNoise.map((row, i) => (
                                <Cell key={i} fill={row.noisyCount / row.count > 0.3 ? 'var(--severity-high)' : 'var(--chart-1)'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}

            {/* Per-service table */}
            <Table
                dataSource={data.serviceNoise}
                columns={columns}
                size="small"
                rowKey="service"
                pagination={false}
                style={{ fontSize: 'var(--text-sm)' }}
            />
        </Card>
    );
};

export default AlertFatigueMetricsChart;
