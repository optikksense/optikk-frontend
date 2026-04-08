import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accentColor: string;
  accentBg: string;
  trend?: number;
  subtitle?: string | undefined;
}

/**
 *
 * @param root0
 * @param root0.title
 * @param root0.value
 * @param root0.icon
 * @param root0.accentColor
 * @param root0.accentBg
 * @param root0.trend
 * @param root0.subtitle
 */
export default function KpiCard({
  title,
  value,
  icon: Icon,
  accentColor,
  accentBg,
  trend,
  subtitle,
}: KpiCardProps) {
  return (
    <div
      className="logs-kpi-card"
      style={{ "--kpi-accent": accentColor, "--kpi-accent-bg": accentBg } as React.CSSProperties}
    >
      <div className="logs-kpi-card-header">
        <span className="logs-kpi-label">{title}</span>
        <span className="logs-kpi-icon" style={{ background: accentBg, color: accentColor }}>
          <Icon size={15} />
        </span>
      </div>
      <div className="logs-kpi-value">{value}</div>
      {subtitle && <div className="logs-kpi-subtitle">{subtitle}</div>}
      {trend != null && trend !== 0 && (
        <div className={`logs-kpi-pill ${trend > 0 ? "up" : "down"}`}>
          {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
