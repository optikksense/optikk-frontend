import { formatNumber } from '@utils/formatters';

const CHART_COLORS = [
  '#5E60CE',
  '#48CAE4',
  '#06D6A0',
  '#FFD166',
  '#EF476F',
  '#118AB2',
  '#073B4C',
  '#F78C6B',
  '#83D483',
  '#5E35B1',
];

type QueueMetricsListType =
  | 'depth'
  | 'consumerLag'
  | 'productionRate'
  | 'consumptionRate';

interface QueueMetricsItem {
  key?: string;
  queue_name?: string;
  service_name?: string;
  avg_queue_depth?: number;
  max_consumer_lag?: number;
  avg_publish_rate?: number;
  avg_receive_rate?: number;
}

interface QueueMetricsListProps {
  title?: string;
  queues?: QueueMetricsItem[];
  selectedQueues?: string[];
  onToggle?: (queueKey: string) => void;
  type?: QueueMetricsListType;
}

interface QueueRowDisplayConfig {
  selectedBg: string;
  hoverBg: string;
  valueColor: string;
  displayValue: string;
}

function formatRate(value: number): string {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0';
  if (Math.abs(numericValue) >= 1000) return formatNumber(numericValue);
  return numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatDepth(value: number): string {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0';
  if (Math.abs(numericValue) >= 1000) return formatNumber(numericValue);
  return numericValue.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function getQueueDisplayConfig(
  type: QueueMetricsListType,
  queue: QueueMetricsItem,
): QueueRowDisplayConfig {
  if (type === 'consumerLag') {
    const lag = queue.max_consumer_lag ?? 0;
    return {
      selectedBg: 'rgba(240, 68, 56, 0.2)',
      hoverBg: 'rgba(255, 255, 255, 0.05)',
      valueColor: lag > 100 ? '#F04438' : '#e0e0e0',
      displayValue: formatNumber(lag),
    };
  }

  if (type === 'productionRate') {
    return {
      selectedBg: 'rgba(247, 144, 9, 0.2)',
      hoverBg: 'rgba(255, 255, 255, 0.05)',
      valueColor: '#e0e0e0',
      displayValue: `${formatRate(queue.avg_publish_rate ?? 0)}/s`,
    };
  }

  if (type === 'consumptionRate') {
    return {
      selectedBg: 'rgba(6, 214, 160, 0.2)',
      hoverBg: 'rgba(255, 255, 255, 0.05)',
      valueColor: '#e0e0e0',
      displayValue: `${formatRate(queue.avg_receive_rate ?? 0)}/s`,
    };
  }

  return {
    selectedBg: 'rgba(94, 96, 206, 0.2)',
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    valueColor: '#e0e0e0',
    displayValue: formatDepth(queue.avg_queue_depth ?? 0),
  };
}

/**
 * Renders queue metric rows for queue depth and throughput charts.
 * @param props Component props.
 * @returns Rendered queue metrics table.
 */
export default function QueueMetricsList({
  title,
  queues = [],
  selectedQueues = [],
  onToggle,
  type = 'depth', // 'depth', 'consumerLag', 'productionRate', 'consumptionRate'
}: QueueMetricsListProps): JSX.Element | null {
  if (queues.length === 0) return null;

  return (
    <div style={{ marginTop: 0, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div
        style={{
          maxHeight: '180px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-color, #2D2D2D) transparent',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                color: '#8e8e8e',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <th style={{ padding: '4px 8px', fontWeight: 500 }}>Topic Name</th>
              <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>
                {title}
              </th>
            </tr>
          </thead>
          <tbody>
            {queues.map((queue, index) => {
              const queueKey =
                queue.key ??
                `${queue.queue_name ?? 'unknown'}::${queue.service_name ?? 'unknown'}::${index}`;
              const isSelected = selectedQueues.includes(queueKey);
              const isFaded = selectedQueues.length > 0 && !isSelected;
              const { selectedBg, hoverBg, valueColor, displayValue } = getQueueDisplayConfig(
                type,
                queue,
              );
              const seriesColor = CHART_COLORS[index % CHART_COLORS.length];

              return (
                <tr
                  key={queueKey}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle?.(queueKey);
                  }}
                  style={{
                    background: isSelected ? selectedBg : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    opacity: isFaded ? 0.4 : 1,
                  }}
                  onMouseEnter={(event) => {
                    if (!isFaded) {
                      event.currentTarget.style.background = isSelected ? selectedBg : hoverBg;
                    }
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = isSelected ? selectedBg : 'transparent';
                  }}
                >
                  <td
                    style={{
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '2px',
                        backgroundColor: seriesColor,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#e0e0e0', fontWeight: 500 }}>
                        {queue.queue_name}
                      </span>
                      {queue.service_name && queue.service_name !== 'unknown' && (
                        <span style={{ color: '#8e8e8e', fontSize: '11px' }}>
                          {queue.service_name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: '4px 8px',
                      textAlign: 'right',
                      color: valueColor,
                      fontFamily: 'monospace',
                    }}
                  >
                    {displayValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
