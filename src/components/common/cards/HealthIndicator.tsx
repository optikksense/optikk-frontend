import { getHealthColor } from '@utils/formatters';

interface HealthIndicatorProps {
  status: string;
  showLabel?: boolean;
  size?: number;
}

/**
 * Simple colored dot indicator for service health status.
 * @param props Component props.
 * @returns Health status dot with optional label.
 */
export default function HealthIndicator({
  status,
  showLabel = false,
  size = 8,
}: HealthIndicatorProps): JSX.Element {
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
