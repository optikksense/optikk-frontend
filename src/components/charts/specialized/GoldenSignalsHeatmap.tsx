/**
 * Fix 18: GoldenSignalsHeatmap
 * Renders a colour-coded matrix of error rates bucketed by service × time.
 * Colours map to severity tokens from the design system (Fix 13).
 */
import { Card, Tooltip, Typography } from 'antd';
import React, { useMemo } from 'react';

interface HeatCell {
    service: string;
    time: string;     // ISO or display label
    errorRate: number; // 0–100 (percentage)
}

interface GoldenSignalsHeatmapProps {
    data: HeatCell[];
    services: string[];
    timeBuckets: string[];
    title?: string;
}

function cellColor(errorRate: number): string {
    if (errorRate >= 5) return 'var(--severity-critical)';
    if (errorRate >= 2) return 'var(--severity-high)';
    if (errorRate >= 0.5) return 'var(--severity-medium)';
    if (errorRate > 0) return 'var(--severity-low)';
    return 'var(--severity-info-subtle)';
}

const GoldenSignalsHeatmap: React.FC<GoldenSignalsHeatmapProps> = ({
    data, services, timeBuckets, title = 'Error Rate Heatmap',
}) => {
    // Build lookup: service+time → errorRate
    const lookup = useMemo(() => {
        const m = new Map<string, number>();
        data.forEach((d) => m.set(`${d.service}::${d.time}`, d.errorRate));
        return m;
    }, [data]);

    return (
        <Card
            title={title}
            className="chart-card"
            size="small"
            style={{ overflow: 'auto' }}
        >
            <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 'var(--text-xs)' }}>
                    <thead>
                        <tr>
                            <th style={{ padding: '4px 8px', textAlign: 'left', color: 'var(--text-secondary)', minWidth: 120 }}>
                                Service
                            </th>
                            {timeBuckets.map((t) => (
                                <th key={t} style={{ padding: '4px 6px', color: 'var(--text-muted)', fontWeight: 400, whiteSpace: 'nowrap' }}>
                                    {t}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((svc) => (
                            <tr key={svc}>
                                <td style={{ padding: '3px 8px', color: 'var(--text-primary)', fontWeight: 500 }}>
                                    {svc}
                                </td>
                                {timeBuckets.map((t) => {
                                    const rate = lookup.get(`${svc}::${t}`) ?? 0;
                                    return (
                                        <td key={t} style={{ padding: 2 }}>
                                            <Tooltip title={`${svc} @ ${t}: ${rate.toFixed(2)}% error rate`}>
                                                <div
                                                    style={{
                                                        width: 28,
                                                        height: 22,
                                                        borderRadius: 3,
                                                        background: cellColor(rate),
                                                        opacity: Math.max(0.2, Math.min(1, 0.2 + rate / 5)),
                                                        cursor: 'default',
                                                        transition: 'opacity 0.2s',
                                                    }}
                                                />
                                            </Tooltip>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                {[
                    { label: '0%', color: 'var(--severity-info-subtle)' },
                    { label: '<0.5%', color: 'var(--severity-low)' },
                    { label: '<2%', color: 'var(--severity-medium)' },
                    { label: '<5%', color: 'var(--severity-high)' },
                    { label: '≥5%', color: 'var(--severity-critical)' },
                ].map(({ label, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
                        <Typography.Text style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {label}
                        </Typography.Text>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default GoldenSignalsHeatmap;
