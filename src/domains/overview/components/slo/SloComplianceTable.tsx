import { APP_COLORS } from '@config/colorLiterals';
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
        <span style={{ color: Number(value) > 0 ? APP_COLORS.hex_f04438 : 'var(--text-muted)', fontWeight: 600 }}>
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
          <span style={{ color: normalized >= availabilityTarget ? APP_COLORS.hex_12b76a : APP_COLORS.hex_f04438, fontWeight: 700 }}>
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
          <span style={{ color: normalized > p95TargetMs ? APP_COLORS.hex_f04438 : normalized > 100 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_12b76a, fontWeight: 600 }}>
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
              background: compliant ? APP_COLORS.rgba_18_183_106_0p12 : APP_COLORS.rgba_240_68_56_0p12_2,
              color: compliant ? APP_COLORS.hex_12b76a : APP_COLORS.hex_f04438,
              border: `1px solid ${compliant ? APP_COLORS.rgba_18_183_106_0p3 : APP_COLORS.rgba_240_68_56_0p3_2}`,
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
