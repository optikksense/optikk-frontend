/**
 * Fix 18: BurnRateChart
 * Renders an SLO burn rate gauge + trend sparkline.
 * Shows the 1h and 6h burn rate windows with threshold indicators.
 */
import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
    LineChart, Line, XAxis, YAxis, ReferenceLine,
    Tooltip as ChartTooltip, ResponsiveContainer
} from 'recharts';

export interface BurnRatePoint {
    ts: string;          // display label
    burnRate1h: number;  // current 1h window
    burnRate6h: number;  // current 6h window
}

interface BurnRateChartProps {
    data: BurnRatePoint[];
    fastBurnThreshold?: number;  // e.g. 14.4 (for 2% budget in 1h = 14.4× burn)
    slowBurnThreshold?: number;  // e.g. 1.0
    sloTarget?: number;          // e.g. 99.9
    title?: string;
}

function burnRateColor(rate: number, fast: number, slow: number): string {
    if (rate >= fast) return 'var(--severity-critical)';
    if (rate >= slow) return 'var(--severity-high)';
    return 'var(--severity-low)';
}

const BurnRateChart: React.FC<BurnRateChartProps> = ({
    data,
    fastBurnThreshold = 14.4,
    slowBurnThreshold = 1.0,
    sloTarget = 99.9,
    title = 'SLO Burn Rate',
}) => {
    const latest = data[data.length - 1];
    const current1h = latest?.burnRate1h ?? 0;
    const current6h = latest?.burnRate6h ?? 0;

    return (
        <Card title={title} className="chart-card" size="small">
            <Row gutter={16} style={{ marginBottom: 12 }}>
                <Col span={8}>
                    <Statistic
                        title={<span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>1h Burn Rate</span>}
                        value={current1h.toFixed(2)}
                        suffix="×"
                        valueStyle={{
                            fontSize: 'var(--text-xl)',
                            color: burnRateColor(current1h, fastBurnThreshold, slowBurnThreshold),
                            fontWeight: 'var(--font-bold)',
                        }}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={<span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>6h Burn Rate</span>}
                        value={current6h.toFixed(2)}
                        suffix="×"
                        valueStyle={{
                            fontSize: 'var(--text-xl)',
                            color: burnRateColor(current6h, fastBurnThreshold * 0.5, slowBurnThreshold),
                            fontWeight: 'var(--font-bold)',
                        }}
                    />
                </Col>
                <Col span={8}>
                    <Statistic
                        title={<span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>SLO Target</span>}
                        value={sloTarget}
                        suffix="%"
                        valueStyle={{
                            fontSize: 'var(--text-xl)',
                            color: 'var(--color-success)',
                            fontWeight: 'var(--font-bold)',
                        }}
                    />
                </Col>
            </Row>

            <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data}>
                    <XAxis dataKey="ts" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                    <ChartTooltip
                        contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 6 }}
                        labelStyle={{ color: 'var(--text-muted)', fontSize: 11 }}
                    />
                    {/* Fast burn threshold line */}
                    <ReferenceLine y={fastBurnThreshold} stroke="var(--severity-critical)" strokeDasharray="4 2" label={{ value: 'Fast', fill: 'var(--severity-critical)', fontSize: 9 }} />
                    {/* Slow burn threshold line */}
                    <ReferenceLine y={slowBurnThreshold} stroke="var(--severity-medium)" strokeDasharray="4 2" label={{ value: 'Slow', fill: 'var(--severity-medium)', fontSize: 9 }} />
                    <Line dataKey="burnRate1h" stroke="var(--chart-1)" strokeWidth={2} dot={false} name="1h" />
                    <Line dataKey="burnRate6h" stroke="var(--chart-2)" strokeWidth={2} dot={false} name="6h" strokeDasharray="4 2" />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default BurnRateChart;
