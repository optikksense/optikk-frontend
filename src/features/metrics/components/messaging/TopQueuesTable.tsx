import { Empty } from 'antd';

import { formatNumber } from '@utils/formatters';

import { getMqMeta, n } from './messagingMeta';

interface TopQueuesTableProps {
  queues: any[];
}

/**
 *
 * @param root0
 * @param root0.queues
 */
export default function TopQueuesTable({ queues }: TopQueuesTableProps) {
  if (!queues || queues.length === 0) {
    return <Empty description="No queue data in selected time range" style={{ padding: '40px 0' }} />;
  }

  return (
    <div
      style={{
        maxHeight: '320px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-color, #2D2D2D) transparent',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
        <thead>
          <tr style={{ color: '#8e8e8e', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>Queue / Topic</th>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>System</th>
            <th style={{ padding: '8px 10px', fontWeight: 500, textAlign: 'right' }}>Avg Depth</th>
            <th style={{ padding: '8px 10px', fontWeight: 500, textAlign: 'right' }}>Max Lag</th>
            <th style={{ padding: '8px 10px', fontWeight: 500, textAlign: 'right' }}>Pub Rate</th>
            <th style={{ padding: '8px 10px', fontWeight: 500, textAlign: 'right' }}>Recv Rate</th>
          </tr>
        </thead>
        <tbody>
          {queues.map((queue, index) => {
            const mqMeta = getMqMeta(queue.messaging_system);
            const colors = ['#5E60CE', '#48CAE4', '#06D6A0', '#FFD166', '#EF476F', '#118AB2', '#073B4C', '#F78C6B'];
            const dotColor = colors[index % colors.length];

            return (
              <tr
                key={`${queue.queue_name}-${queue.service_name}-${index}`}
                style={{
                  transition: 'background 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(event) => { event.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: '6px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
                    <div>
                      <span style={{ color: '#e0e0e0', fontWeight: 500 }}>{queue.queue_name || 'unknown'}</span>
                      {queue.service_name && queue.service_name !== 'unknown' && (
                        <div style={{ color: '#8e8e8e', fontSize: '10px' }}>{queue.service_name}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '6px 10px' }}>
                  {queue.messaging_system && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.3px',
                        color: mqMeta.badgeColor,
                        background: `${mqMeta.badgeColor}18`,
                        border: `1px solid ${mqMeta.badgeColor}33`,
                        textTransform: 'capitalize',
                      }}
                    >
                      {mqMeta.label}
                    </span>
                  )}
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#e0e0e0', fontFamily: 'monospace' }}>
                  {n(queue.avg_queue_depth).toFixed(0)}
                </td>
                <td
                  style={{
                    padding: '6px 10px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    color: n(queue.max_consumer_lag) > 1000 ? '#F04438' : n(queue.max_consumer_lag) > 100 ? '#F79009' : '#e0e0e0',
                  }}
                >
                  {formatNumber(n(queue.max_consumer_lag))}
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#48CAE4', fontFamily: 'monospace' }}>
                  {n(queue.avg_publish_rate).toFixed(1)}/s
                </td>
                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#06D6A0', fontFamily: 'monospace' }}>
                  {n(queue.avg_receive_rate).toFixed(1)}/s
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
