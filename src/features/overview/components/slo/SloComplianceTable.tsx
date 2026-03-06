import { Card, Table, Tag } from 'antd';

interface SloComplianceTableProps {
  timeseries: any[];
  isLoading: boolean;
  availabilityTarget: number;
  p95TargetMs: number;
}

/**
 *
 * @param value
 */
const n = (value: any) => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

/**
 *
 * @param root0
 * @param root0.timeseries
 * @param root0.isLoading
 * @param root0.availabilityTarget
 * @param root0.p95TargetMs
 */
export default function SloComplianceTable({
  timeseries,
  isLoading,
  availabilityTarget,
  p95TargetMs,
}: SloComplianceTableProps) {
  const complianceColumns: any[] = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (value: any) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      align: 'right' as const,
      render: (value: any) => <span style={{ fontWeight: 600 }}>{Number(value || 0).toLocaleString()}</span>,
    },
    {
      title: 'Errors',
      dataIndex: 'error_count',
      key: 'error_count',
      align: 'right' as const,
      render: (value: any) => (
        <span style={{ color: Number(value) > 0 ? '#F04438' : 'var(--text-muted)', fontWeight: 600 }}>
          {Number(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Availability',
      dataIndex: 'availability_percent',
      key: 'availability_percent',
      align: 'right' as const,
      sorter: (a: any, b: any) => n(a.availability_percent) - n(b.availability_percent),
      render: (value: any) => {
        const normalized = n(value);
        return (
          <span style={{ color: normalized >= availabilityTarget ? '#12B76A' : '#F04438', fontWeight: 700 }}>
            {normalized.toFixed(3)}%
          </span>
        );
      },
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avg_latency_ms',
      key: 'avg_latency_ms',
      align: 'right' as const,
      sorter: (a: any, b: any) => n(a.avg_latency_ms) - n(b.avg_latency_ms),
      render: (value: any) => {
        const normalized = n(value);
        return (
          <span style={{ color: normalized > p95TargetMs ? '#F04438' : normalized > 100 ? '#F79009' : '#12B76A', fontWeight: 600 }}>
            {normalized.toFixed(1)}ms
          </span>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center' as const,
      render: (_value: any, record: any) => {
        const compliant = n(record.availability_percent) >= availabilityTarget;
        return (
          <Tag
            style={{
              background: compliant ? 'rgba(18,183,106,0.12)' : 'rgba(240,68,56,0.12)',
              color: compliant ? '#12B76A' : '#F04438',
              border: `1px solid ${compliant ? 'rgba(18,183,106,0.3)' : 'rgba(240,68,56,0.3)'}`,
              borderRadius: 12,
              fontSize: 11,
            }}
          >
            {compliant ? 'Compliant' : 'Breached'}
          </Tag>
        );
      },
    },
  ];

  return (
    <Card
      title={(
        <span>
          Historical Compliance
          {timeseries.length > 0 && (
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 12 }}>
              {timeseries.length} windows
            </span>
          )}
        </span>
      )}
    >
      <Table
        columns={complianceColumns}
        dataSource={timeseries.map((row, index) => ({ ...row, key: `slo-${index}` }))}
        rowKey="key"
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 20, showSizeChanger: true }}
        rowClassName={(record: any) =>
          n(record.availability_percent) < availabilityTarget ? 'high-error-row' : ''
        }
        locale={{ emptyText: 'No compliance data — check that services are sending OTLP traces' }}
      />
    </Card>
  );
}
