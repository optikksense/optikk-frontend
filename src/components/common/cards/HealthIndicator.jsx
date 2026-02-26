import { getHealthColor } from '@utils/formatters';

/**
 * Simple colored dot indicator for service health status.
 */
export default function HealthIndicator({ status, showLabel = false, size = 8 }) {
  const color = getHealthColor(status);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {showLabel && (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
          {status}
        </span>
      )}
    </span>
  );
}
