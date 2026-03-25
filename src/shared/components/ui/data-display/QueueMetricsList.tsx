import { Link } from 'react-router-dom';

import { formatNumber } from '@shared/utils/formatters';
import { buildInterpolatedPath } from '@shared/utils/placeholderInterpolation';
import { CHART_COLORS } from '@config/constants';

import { APP_COLORS } from '@config/colorLiterals';

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
  [key: string]: unknown;
}

interface QueueMetricsListProps {
  title?: string;
  queues?: QueueMetricsItem[];
  selectedQueues?: string[];
  onToggle?: (queueKey: string) => void;
  type?: QueueMetricsListType;
  drilldownRouteTemplate?: string;
  maxVisibleRows?: number;
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
      selectedBg: 'rgba(240, 68, 56, 0.12)',
      hoverBg: 'rgba(255,255,255,0.04)',
      valueColor: lag > 100 ? 'var(--color-error)' : 'var(--text-primary)',
      displayValue: formatNumber(lag),
    };
  }

  if (type === 'productionRate') {
    return {
      selectedBg: 'rgba(247, 182, 58, 0.12)',
      hoverBg: 'rgba(255,255,255,0.04)',
      valueColor: 'var(--text-primary)',
      displayValue: `${formatRate(queue.avg_publish_rate ?? 0)}/s`,
    };
  }

  if (type === 'consumptionRate') {
    return {
      selectedBg: 'rgba(115, 201, 145, 0.12)',
      hoverBg: 'rgba(255,255,255,0.04)',
      valueColor: 'var(--text-primary)',
      displayValue: `${formatRate(queue.avg_receive_rate ?? 0)}/s`,
    };
  }

  return {
    selectedBg: 'rgba(124, 127, 242, 0.12)',
    hoverBg: 'rgba(255,255,255,0.04)',
    valueColor: 'var(--text-primary)',
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
  drilldownRouteTemplate,
  maxVisibleRows,
}: QueueMetricsListProps): JSX.Element | null {
  if (queues.length === 0) return null;
  const visibleQueues = maxVisibleRows ? queues.slice(0, maxVisibleRows) : queues;

  return (
    <div style={{ marginTop: 0, borderTop: '1px solid var(--border-color)' }}>
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
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <th style={{ padding: '4px 8px', fontWeight: 500 }}>Topic Name</th>
              <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>
                {title}
              </th>
              {drilldownRouteTemplate ? (
                <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>
                  Details
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {visibleQueues.map((queue, index) => {
              const queueKey =
                queue.key ??
                `${queue.queue_name ?? 'unknown'}::${queue.service_name ?? 'unknown'}::${index}`;
              const detailHref = buildInterpolatedPath(
                drilldownRouteTemplate,
                queue as Record<string, unknown>,
              );
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
              const maxValInList = Math.max(...visibleQueues.map(getVal), 1);
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
                    : `linear-gradient(90deg, ${CHART_COLORS[1]} 0%, ${CHART_COLORS[0]} 100%)`;

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
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {queue.queue_name}
                      </span>
                      {queue.service_name && queue.service_name !== 'unknown' && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                          {queue.service_name}
                        </span>
                      )}
                    </div>
                    {/* Proportional Gradient Intensity Bar */}
                    <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginTop: '2px' }}>
                      <div style={{ width: `${barWidth}%`, height: '100%', background: barBg, borderRadius: '2px' }} />
                    </div>
                  </td>
                  <td
                    className="font-mono"
                    style={{
                      padding: '4px 8px',
                      textAlign: 'right',
                      color: valueColor,
                    }}
                  >
                    {displayValue}
                  </td>
                  {drilldownRouteTemplate ? (
                    <td
                      style={{
                        padding: '4px 8px',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {detailHref ? (
                        <Link
                          to={detailHref}
                          onClick={(event) => event.stopPropagation()}
                          style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 500 }}
                        >
                          View
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
