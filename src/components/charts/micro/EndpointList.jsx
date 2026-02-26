import React from 'react';
import { formatNumber, formatDuration } from '@utils/formatters';

/**
 * Reusable component for displaying endpoint lists below charts
 * Reduces code duplication across RequestChart, ErrorRateChart, and LatencyChart
 */
export default function EndpointList({ 
  endpoints, 
  selectedEndpoints, 
  onToggle, 
  type = 'requests', // 'requests', 'errorRate', 'latency'
  maxHeight = '200px' 
}) {
  if (!endpoints || endpoints.length === 0) return null;

  const getEndpointValue = (endpoint) => {
    switch (type) {
      case 'errorRate':
        const errorRate = endpoint.request_count > 0 
          ? (endpoint.error_count / endpoint.request_count) * 100 
          : 0;
        return { value: errorRate, formatted: `${Number(errorRate).toFixed(2)}%` };
      case 'latency':
        const latency = endpoint.avg_latency || endpoint.p95_latency || 0;
        return { value: latency, formatted: formatDuration(latency) };
      default: // requests
        return { value: endpoint.request_count || 0, formatted: formatNumber(endpoint.request_count || 0) };
    }
  };

  const getValueColor = (value) => {
    switch (type) {
      case 'errorRate':
        if (value > 5) return 'var(--color-error)';
        if (value > 1) return 'var(--color-warning)';
        return 'var(--color-success)';
      case 'latency':
        if (value > 500) return 'var(--color-error)';
        if (value > 200) return 'var(--color-warning)';
        return 'var(--color-success)';
      default:
        return 'var(--color-primary)';
    }
  };

  const getBackgroundColor = (endpointKey, isSelected) => {
    if (isSelected) {
      switch (type) {
        case 'errorRate':
          return 'rgba(255, 77, 79, 0.2)';
        case 'latency':
          return 'rgba(250, 173, 20, 0.2)';
        default:
          return 'rgba(94, 96, 206, 0.2)';
      }
    }
    return 'var(--bg-secondary)';
  };

  const getBorderColor = (endpointKey, isSelected) => {
    if (isSelected) {
      switch (type) {
        case 'errorRate':
          return '#F04438';
        case 'latency':
          return '#F79009';
        default:
          return '#5E60CE';
      }
    }
    return 'transparent';
  };

  return (
    <div style={{ 
      marginTop: 16, 
      paddingTop: 16, 
      borderTop: '1px solid var(--border-color)' 
    }}>
      <div style={{ 
        fontSize: 12, 
        fontWeight: 600, 
        color: 'var(--text-muted)', 
        marginBottom: 12, 
        textTransform: 'uppercase', 
        letterSpacing: '0.5px' 
      }}>
        Top Endpoints by {type === 'errorRate' ? 'Error Rate' : type === 'latency' ? 'Latency' : 'Requests'}
      </div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 8, 
        maxHeight, 
        overflowY: 'auto', 
        paddingRight: 4,
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-color) var(--bg-secondary)'
      }}>
        {endpoints.map((ep, idx) => {
          const endpointKey = ep.key || `${ep.http_method || 'N/A'}_${ep.operation_name || ep.endpoint_name || 'Unknown'}_${ep.service_name || ''}`;
          const isSelected = selectedEndpoints.includes(endpointKey);
          const isFaded = selectedEndpoints.length > 0 && !isSelected;
          const { value, formatted } = getEndpointValue(ep);
          
          return (
            <div
              key={endpointKey}
              onClick={() => onToggle(endpointKey)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: getBackgroundColor(endpointKey, isSelected),
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.2s',
                opacity: isFaded ? 0.3 : 1,
                border: `1px solid ${getBorderColor(endpointKey, isSelected)}`,
              }}
              onMouseEnter={(e) => {
                if (!isFaded) {
                  e.currentTarget.style.background = isSelected 
                    ? getBackgroundColor(endpointKey, true).replace('0.2', '0.3')
                    : 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = getBackgroundColor(endpointKey, isSelected);
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontSize: 12, 
                  fontFamily: 'monospace', 
                  color: 'var(--text-primary)', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {ep.http_method || 'N/A'} {ep.operation_name || ep.endpoint_name || 'Unknown'}
                </div>
                {ep.service && ep.service !== 'unknown' && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {ep.service}
                  </div>
                )}
              </div>
              <div style={{ 
                fontSize: 12, 
                fontWeight: 600, 
                color: getValueColor(value), 
                marginLeft: 12 
              }}>
                {formatted}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
