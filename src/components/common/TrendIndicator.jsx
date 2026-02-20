import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Displays a trend arrow with percentage value.
 * Green = positive trend, Red = negative trend.
 * If inverted (e.g. error rate), down = good (green), up = bad (red).
 */
export default function TrendIndicator({ value, inverted = false, showValue = true }) {
  if (value == null || value === 0) {
    return (
      <span className="trend-indicator" style={{ color: '#98A2B3' }}>
        <Minus size={14} />
        {showValue && <span>0%</span>}
      </span>
    );
  }

  const isPositive = value > 0;
  const isGood = inverted ? !isPositive : isPositive;
  const color = isGood ? '#73C991' : '#F04438';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
        fontSize: 12,
        color,
      }}
    >
      <Icon size={14} />
      {showValue && <span>{Math.abs(value)}%</span>}
    </span>
  );
}
