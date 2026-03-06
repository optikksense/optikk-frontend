import { APP_COLORS } from '@config/colorLiterals';
import { formatNumber, formatDuration } from '@utils/formatters';

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

type TopEndpointsListType = 'requests' | 'errorRate' | 'latency';

interface TopEndpointListItem {
  key?: string;
  endpoint?: string;
  service?: string;
  request_count?: number;
  errorRate?: number;
  value?: number;
  latency?: number;
}

interface TopEndpointsListProps {
  title?: string;
  endpoints?: TopEndpointListItem[];
  selectedEndpoints?: string[];
  onToggle?: (endpointKey: string) => void;
  type?: TopEndpointsListType;
}

interface RowDisplayConfig {
  selectedBg: string;
  hoverBg: string;
  valueColor: string;
  displayValue: string;
}

function getRowDisplayConfig(
  type: TopEndpointsListType,
  endpoint: TopEndpointListItem,
): RowDisplayConfig {
  if (type === 'errorRate') {
    const rate = endpoint.errorRate ?? endpoint.value ?? 0;
    return {
      selectedBg: APP_COLORS.rgba_240_68_56_0p2,
      hoverBg: APP_COLORS.rgba_255_255_255_0p05,
      valueColor: rate > 5 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_e0e0e0,
      displayValue: `${Number(rate).toFixed(2)}%`,
    };
  }

  if (type === 'latency') {
    const latency = endpoint.latency ?? 0;
    return {
      selectedBg: APP_COLORS.rgba_247_144_9_0p2,
      hoverBg: APP_COLORS.rgba_255_255_255_0p05,
      valueColor: latency > 500 ? APP_COLORS.hex_f04438 : latency > 200 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_e0e0e0,
      displayValue: formatDuration(latency),
    };
  }

  return {
    selectedBg: APP_COLORS.rgba_94_96_206_0p2,
    hoverBg: APP_COLORS.rgba_255_255_255_0p05,
    valueColor: APP_COLORS.hex_e0e0e0,
    displayValue: formatNumber(endpoint.request_count ?? 0),
  };
}

/**
 * Reusable component for displaying top endpoints below charts
 * @param props Component props.
 * @returns Rendered endpoint table for the selected metric.
 */
export default function TopEndpointsList({
  title,
  endpoints = [],
  selectedEndpoints = [],
  onToggle,
  type = 'requests', // 'requests', 'errorRate', 'latency'
}: TopEndpointsListProps): JSX.Element | null {
  if (endpoints.length === 0) return null;

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
              <th style={{ padding: '4px 8px', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>
                {title}
              </th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((endpoint, index) => {
              const endpointKey = endpoint.key ?? `${endpoint.endpoint ?? 'unknown'}-${index}`;
              const isSelected = selectedEndpoints.includes(endpointKey);
              const isFaded = selectedEndpoints.length > 0 && !isSelected;
              const { selectedBg, hoverBg, valueColor, displayValue } = getRowDisplayConfig(
                type,
                endpoint,
              );
              const seriesColor = CHART_COLORS[index % CHART_COLORS.length];

              return (
                <tr
                  key={endpointKey}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle?.(endpointKey);
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
                      <span style={{ color: APP_COLORS.hex_e0e0e0, fontWeight: 500 }}>
                        {endpoint.endpoint}
                      </span>
                      {endpoint.service && endpoint.service !== 'unknown' && (
                        <span style={{ color: APP_COLORS.hex_8e8e8e, fontSize: '11px' }}>
                          {endpoint.service}
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
