/**
 * Fix 18: N1QueryDetector
 * Highlights services/operations making an unusually high number of repeated
 * DB queries — the classic N+1 pattern.
 * Data comes from the /api/v1/spans/n1 endpoint (aggregated query counts).
 */
import React from 'react';
import { Card, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

export interface N1QueryRow {
    service: string;
    operation: string;
    queryPattern: string;
    callCount: number;       // number of times this query ran in the window
    distinctCallers: number; // unique parent spans that triggered it
    avgLatencyMs: number;
    p99LatencyMs: number;
}

interface N1QueryDetectorProps {
    data: N1QueryRow[];
    loading?: boolean;
    title?: string;
    /** Threshold above which a call count is flagged as N+1. Default 20. */
    threshold?: number;
}

const N1QueryDetector: React.FC<N1QueryDetectorProps> = ({
    data, loading = false, title = 'N+1 Query Detector', threshold = 20,
}) => {
    const columns: ColumnsType<N1QueryRow> = [
        {
            title: 'Service',
            dataIndex: 'service',
            key: 'service',
            width: 120,
            render: v => <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{v}</span>,
        },
        {
            title: 'Operation',
            dataIndex: 'operation',
            key: 'operation',
            width: 140,
            render: v => <code style={{ fontSize: 'var(--text-xs)', color: 'var(--color-info)' }}>{v}</code>,
        },
        {
            title: 'Query Pattern',
            dataIndex: 'queryPattern',
            key: 'queryPattern',
            ellipsis: true,
            render: v => (
                <Tooltip title={v}>
                    <code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{v}</code>
                </Tooltip>
            ),
        },
        {
            title: 'Calls',
            dataIndex: 'callCount',
            key: 'callCount',
            width: 80,
            sorter: (a, b) => b.callCount - a.callCount,
            defaultSortOrder: 'ascend',
            render: v => (
                <Tag
                    color={v >= threshold ? 'var(--severity-critical)' : 'var(--severity-medium)'}
                    style={{
                        background: v >= threshold ? 'var(--severity-critical-subtle)' : 'var(--severity-medium-subtle)',
                        border: `1px solid ${v >= threshold ? 'var(--severity-critical)' : 'var(--severity-medium)'}`,
                        color: v >= threshold ? 'var(--severity-critical)' : 'var(--severity-medium)',
                        fontWeight: 600,
                    }}
                >
                    {v}
                </Tag>
            ),
        },
        {
            title: 'Callers',
            dataIndex: 'distinctCallers',
            key: 'distinctCallers',
            width: 80,
            render: v => <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{v}</span>,
        },
        {
            title: 'Avg (ms)',
            dataIndex: 'avgLatencyMs',
            key: 'avgLatencyMs',
            width: 90,
            render: v => <span style={{ color: v > 100 ? 'var(--severity-high)' : 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{v.toFixed(1)}</span>,
        },
        {
            title: 'p99 (ms)',
            dataIndex: 'p99LatencyMs',
            key: 'p99LatencyMs',
            width: 90,
            render: v => <span style={{ color: v > 500 ? 'var(--severity-critical)' : 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{v.toFixed(1)}</span>,
        },
    ];

    return (
        <Card title={title} className="chart-card" size="small">
            <Table
                dataSource={data}
                columns={columns}
                loading={loading}
                rowKey={r => `${r.service}::${r.operation}::${r.queryPattern}`}
                size="small"
                pagination={{ pageSize: 10, size: 'small' }}
                style={{ fontSize: 'var(--text-sm)' }}
                scroll={{ x: true }}
            />
        </Card>
    );
};

export default N1QueryDetector;
