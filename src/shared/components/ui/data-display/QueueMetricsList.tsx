import { formatNumber } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

const CHART_COLORS = [
  APP_COLORS.hex_5e60ce,
  APP_COLORS.hex_48cae4,
  APP_COLORS.hex_06d6a0,
  APP_COLORS.hex_ffd166,
  APP_COLORS.hex_ef476f,
  APP_COLORS.hex_118ab2,
  APP_COLORS.hex_073b4c,
  APP_COLORS.hex_f78c6b,
  APP_COLORS.hex_83d483,
  APP_COLORS.hex_5e35b1,
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
      selectedBg: APP_COLORS.rgba_240_68_56_0p2,
      hoverBg: APP_COLORS.rgba_255_255_255_0p05,
      valueColor: lag > 100 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_e0e0e0,
      displayValue: formatNumber(lag),
    };
  }

  if (type === 'productionRate') {
    return {
      selectedBg: APP_COLORS.rgba_247_144_9_0p2,
      hoverBg: APP_COLORS.rgba_255_255_255_0p05,
      valueColor: APP_COLORS.hex_e0e0e0,
      displayValue: `${formatRate(queue.avg_publish_rate ?? 0)}/s`,
    };
  }

  if (type === 'consumptionRate') {
    return {
      selectedBg: APP_COLORS.rgba_6_214_160_0p2,
      hoverBg: APP_COLORS.rgba_255_255_255_0p05,
      valueColor: APP_COLORS.hex_e0e0e0,
      displayValue: `${formatRate(queue.avg_receive_rate ?? 0)}/s`,
    };
  }

  return {
    selectedBg: APP_COLORS.rgba_94_96_206_0p2,
    hoverBg: APP_COLORS.rgba_255_255_255_0p05,
    valueColor: APP_COLORS.hex_e0e0e0,
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
    <div style={{ marginTop: 0, borderTop: `1px solid ${APP_COLORS.rgba_255_255_255_0p05}` }}>
      <div
        style={{
          maxHeight: '180px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `var(--border-color, ${APP_COLORS.hex_2d2d2d}) transparent`,
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
                color: APP_COLORS.hex_8e8e8e,
                borderBottom: `1px solid ${APP_COLORS.rgba_255_255_255_0p05}`,
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
              
              // Find max value in list for proportional bar calculation
              const getVal = (q: QueueMetricsItem) => {
                if (type === 'consumerLag') return q.max_consumer_lag ?? 0;
                if (type === 'productionRate') return q.avg_publish_rate ?? 0;
                if (type === 'consumptionRate') return q.avg_receive_rate ?? 0;
                return q.avg_queue_depth ?? 0;
              };
              const maxValInList = Math.max(...queues.map(getVal), 1);
              const currentVal = getVal(queue);
              const pct = (currentVal / maxValInList) * 100;
              const barWidth = Math.max(Math.min(pct, 100), 2);
              
              // Gradient based on type
              const barBg = type === 'consumerLag' 
                ? `linear-gradient(90deg, ${APP_COLORS.hex_f79009} 0%, ${APP_COLORS.hex_f04438} 100%)`
                : type === 'productionRate'
                  ? `linear-gradient(90deg, ${APP_COLORS.hex_ffd166} 0%, ${APP_COLORS.hex_f79009} 100%)`
                  : type === 'consumptionRate'
                    ? `linear-gradient(90deg, ${APP_COLORS.hex_06d6a0} 0%, ${APP_COLORS.hex_73c991} 100%)`
                    : `linear-gradient(90deg, ${APP_COLORS.hex_48cae4} 0%, ${APP_COLORS.hex_5e60ce} 100%)`;

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
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: APP_COLORS.hex_e0e0e0, fontWeight: 500 }}>
                        {queue.queue_name}
                      </span>
                      {queue.service_name && queue.service_name !== 'unknown' && (
                        <span style={{ color: APP_COLORS.hex_8e8e8e, fontSize: '11px' }}>
                          {queue.service_name}
                        </span>
                      )}
                    </div>
                    {/* Proportional Gradient Intensity Bar */}
                    <div style={{ width: '100%', height: '3px', background: APP_COLORS.rgba_255_255_255_0p05, borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                      <div style={{ width: `${barWidth}%`, height: '100%', background: barBg, borderRadius: '2px' }} />
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
