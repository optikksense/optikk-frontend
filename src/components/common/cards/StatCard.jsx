import React from 'react';
import { Card, Skeleton } from 'antd';
import { TrendIndicator } from '@components/common';
import SparklineChart from '../../charts/micro/SparklineChart';
import './StatCard.css';

/**
 * Reusable metric card for displaying a single statistic with trend.
 * Used in OverviewPage, ServiceDetailPage, InfrastructurePage, etc.
 */
export default function StatCard({
  title,
  value,
  formatter,
  trend,
  trendInverted = false,
  icon,
  iconColor,
  loading = false,
  suffix,
  description,
  sparklineData,
  sparklineColor,
}) {
  const displayValue = formatter ? formatter(value) : value;

  return (
    <Card className="stat-card">
      {loading ? (
        <div className="stat-card-loading">
          <Skeleton active title={{ width: '50%' }} paragraph={{ rows: 1, width: '70%' }} />
        </div>
      ) : (
        <>
          <div className="stat-card-header">
            <span className="stat-card-title">{title}</span>
            {icon && (
              <span className="stat-card-icon" style={{ color: iconColor }}>
                {React.isValidElement(icon) ? icon : React.createElement(icon, { size: 20 })}
              </span>
            )}
          </div>
          <div className="stat-card-value">
            {displayValue}
            {suffix && <span className="stat-card-suffix">{suffix}</span>}
          </div>
          {description && (
            <div className="stat-card-description">{description}</div>
          )}
          {sparklineData && sparklineData.length > 1 && (
            <div className="stat-card-sparkline">
              <SparklineChart
                data={sparklineData}
                color={sparklineColor || iconColor || '#5E60CE'}
                width={120}
                height={28}
              />
            </div>
          )}
          {trend != null && (
            <TrendIndicator value={trend} inverted={trendInverted} />
          )}
        </>
      )}
    </Card>
  );
}
