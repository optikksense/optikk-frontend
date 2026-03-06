import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

interface KpiCardStyle extends CSSProperties {
  '--kpi-accent': string;
  '--kpi-accent-from': string;
  '--kpi-accent-bg': string;
}

interface TracesKpiCardProps {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  accentColor: string;
  accentBg: string;
  trend?: number;
}

/**
 * KPI card used by the traces page header row.
 */
export default function TracesKpiCard({
  title,
  value,
  icon: Icon,
  accentColor,
  accentBg,
  trend,
}: TracesKpiCardProps): JSX.Element {
  const cardStyle: KpiCardStyle = {
    '--kpi-accent': accentColor,
    '--kpi-accent-from': `${accentColor}33`,
    '--kpi-accent-bg': accentBg,
  };

  return (
    <div className="traces-kpi-card" style={cardStyle}>
      <div className="traces-kpi-card-header">
        <span className="traces-kpi-label">{title}</span>
        <span className="traces-kpi-icon" style={{ background: accentBg, color: accentColor }}>
          <Icon size={15} />
        </span>
      </div>
      <div className="traces-kpi-value">{value}</div>
      {trend !== undefined && trend !== 0 && (
        <div className={`traces-kpi-pill ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

