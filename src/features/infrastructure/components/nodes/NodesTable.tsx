import { Tag } from 'antd';

import ObservabilityDataBoard, { boardHeight } from '@components/common/data-display/ObservabilityDataBoard';

import { formatNumber, formatTimestamp } from '@utils/formatters';

import { deriveNodeStatus, NODE_COLUMNS, STATUS_CONFIG } from './nodeConstants';

interface NodesTableProps {
  rows: any[];
  isLoading: boolean;
  onOpenNodeDetail: (node: any) => void;
}

/**
 *
 * @param root0
 * @param root0.rows
 * @param root0.isLoading
 * @param root0.onOpenNodeDetail
 */
export default function NodesTable({ rows, isLoading, onOpenNodeDetail }: NodesTableProps) {
  return (
    <div style={{ height: boardHeight(20) }}>
      <ObservabilityDataBoard
        columns={NODE_COLUMNS}
        rows={rows}
        rowKey={(row: any) => row.host}
        entityName="node"
        storageKey="nodes-board-cols"
        isLoading={isLoading}
        renderRow={(row: any, { colWidths, visibleCols }: any) => {
          const status = deriveNodeStatus(row.error_rate);
          const cfg = STATUS_CONFIG[status];
          const errorRate = Number(row.error_rate) || 0;
          const errorColor = errorRate > 10 ? '#F04438' : errorRate > 2 ? '#F79009' : '#73C991';
          const services = Array.isArray(row.services) ? row.services : [];
          return (
            <>
              {visibleCols.host && (
                <div
                  style={{ width: colWidths.host, flexShrink: 0, fontWeight: 600, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-primary, #5E60CE)' }}
                  onClick={() => onOpenNodeDetail(row)}
                >
                  {row.host}
                </div>
              )}
              {visibleCols.status && (
                <div style={{ width: colWidths.status, flexShrink: 0 }}>
                  <Tag color={cfg.color} icon={cfg.icon} style={{ color: '#fff' }}>{cfg.label}</Tag>
                </div>
              )}
              {visibleCols.pod_count && (
                <div style={{ width: colWidths.pod_count, flexShrink: 0 }}>
                  {formatNumber(Number(row.pod_count) || 0)}
                </div>
              )}
              {visibleCols.container_count && (
                <div style={{ width: colWidths.container_count, flexShrink: 0 }}>
                  {formatNumber(Number(row.container_count) || 0)}
                </div>
              )}
              {visibleCols.request_count && (
                <div style={{ width: colWidths.request_count, flexShrink: 0 }}>
                  {formatNumber(Number(row.request_count) || 0)}
                </div>
              )}
              {visibleCols.error_rate && (
                <div style={{ width: colWidths.error_rate, flexShrink: 0, color: errorColor, fontWeight: 600 }}>
                  {errorRate.toFixed(2)}%
                </div>
              )}
              {visibleCols.avg_latency_ms && (
                <div style={{ width: colWidths.avg_latency_ms, flexShrink: 0 }}>
                  {row.avg_latency_ms != null ? `${Number(row.avg_latency_ms).toFixed(1)}ms` : '-'}
                </div>
              )}
              {visibleCols.p95_latency_ms && (
                <div style={{ width: colWidths.p95_latency_ms, flexShrink: 0 }}>
                  {row.p95_latency_ms != null ? `${Number(row.p95_latency_ms).toFixed(1)}ms` : '-'}
                </div>
              )}
              {visibleCols.services && (
                <div style={{ width: colWidths.services, flexShrink: 0, overflow: 'hidden' }}>
                  {services.slice(0, 2).map((service: any) => (
                    <Tag key={service} style={{ marginBottom: 0, marginRight: 4 }}>{service}</Tag>
                  ))}
                  {services.length > 2 && <Tag>+{services.length - 2}</Tag>}
                </div>
              )}
              {visibleCols.last_seen && (
                <div style={{ flex: 1, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.last_seen ? formatTimestamp(row.last_seen) : '-'}
                </div>
              )}
            </>
          );
        }}
        emptyTips={[
          { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
          { num: 2, text: <>Clear the <strong>host filter</strong> above</> },
          { num: 3, text: <>Ensure your agents are reporting <strong>node metrics</strong></> },
        ]}
      />
    </div>
  );
}
