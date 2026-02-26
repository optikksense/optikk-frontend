import { Table, Tag } from 'antd';
import { formatTimestamp } from '@utils/formatters';

export function LogsResultView({ logsRows, logsLoading }) {
    const logsColumns = [
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 190,
            render: (value) => formatTimestamp(value),
        },
        {
            title: 'Severity',
            dataIndex: 'level',
            key: 'level',
            width: 110,
            render: (value) => <Tag color={value === 'ERROR' ? 'red' : value === 'WARN' ? 'orange' : 'blue'}>{value}</Tag>,
        },
        {
            title: 'Service',
            dataIndex: 'service_name',
            key: 'service_name',
            width: 180,
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            ellipsis: true,
        },
    ];

    return (
        <Table
            size="small"
            columns={logsColumns}
            dataSource={logsRows}
            loading={logsLoading}
            pagination={{ pageSize: 20, showSizeChanger: true }}
            rowKey={(row, idx) => row.id || `${row.timestamp}-${idx}`}
        />
    );
}
