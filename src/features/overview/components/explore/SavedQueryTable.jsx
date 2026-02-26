import { Table, Tag, Space, Button, Popconfirm } from 'antd';
import { Play, Trash2 } from 'lucide-react';
import { formatTimestamp } from '@utils/formatters';

export function SavedQueryTable({ savedQueries, savedQueriesLoading, runSavedQuery, deleteSavedQuery }) {
    const savedQueryColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (value, record) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{value}</div>
                    {record.description && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{record.description}</div>}
                </div>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'queryType',
            key: 'queryType',
            width: 92,
            render: (value) => <Tag>{String(value || '').toUpperCase()}</Tag>,
        },
        {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 180,
            render: (value) => formatTimestamp(value),
        },
        {
            title: '',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space size={8}>
                    <Button size="small" onClick={() => runSavedQuery(record)} icon={<Play size={12} />}>
                        Run
                    </Button>
                    <Popconfirm
                        title="Delete saved query?"
                        description="This removes it for everyone in this team."
                        onConfirm={() => deleteSavedQuery(record.id)}
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                    >
                        <Button size="small" danger icon={<Trash2 size={12} />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Table
            size="small"
            columns={savedQueryColumns}
            dataSource={savedQueries}
            loading={savedQueriesLoading}
            pagination={{ pageSize: 15 }}
            rowKey="id"
        />
    );
}
