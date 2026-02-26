import { Table, Tag, Space, Alert } from 'antd';
import { formatTimestamp, formatDuration } from '@utils/formatters';

export function TracesResultView({ tracesRows, tracesLoading, tracesData, traceParsed }) {
    const tracesColumns = [
        {
            title: 'Trace ID',
            dataIndex: 'trace_id',
            key: 'trace_id',
            width: 220,
            render: (value) => <code>{value}</code>,
        },
        {
            title: 'Service',
            dataIndex: 'service_name',
            key: 'service_name',
            width: 150,
        },
        {
            title: 'Operation',
            dataIndex: 'operation_name',
            key: 'operation_name',
            width: 220,
            ellipsis: true,
        },
        {
            title: 'HTTP',
            dataIndex: 'http_status_code',
            key: 'http_status_code',
            width: 100,
            render: (value) => value || '-',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            render: (value) => <Tag color={value === 'ERROR' ? 'red' : 'green'}>{value || 'OK'}</Tag>,
        },
        {
            title: 'Duration',
            dataIndex: 'duration_ms',
            key: 'duration_ms',
            width: 130,
            render: (value) => formatDuration(value),
        },
        {
            title: 'Start',
            dataIndex: 'start_time',
            key: 'start_time',
            width: 180,
            render: (value) => formatTimestamp(value),
        },
    ];

    return (
        <>
            {traceParsed.error && (
                <Alert
                    type="error"
                    showIcon
                    style={{ marginBottom: 12 }}
                    message={traceParsed.error}
                />
            )}

            {!traceParsed.error && traceParsed.conditions.length > 0 && (
                <Space size={[8, 8]} wrap style={{ marginBottom: 12 }}>
                    {traceParsed.conditions.map((condition, index) => (
                        <Tag key={`${condition.key}-${index}`}>{`${condition.key} ${condition.operator} ${condition.value}`}</Tag>
                    ))}
                </Space>
            )}

            <Table
                size="small"
                columns={tracesColumns}
                dataSource={tracesRows}
                loading={tracesLoading}
                pagination={{ pageSize: 20, showSizeChanger: true, total: tracesData?.total || tracesRows.length }}
                rowKey={(row, idx) => row.trace_id || `${row.start_time}-${idx}`}
            />
        </>
    );
}
