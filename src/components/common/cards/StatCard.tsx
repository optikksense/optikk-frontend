import { APP_COLORS } from '@config/colorLiterals';
import { Card, Skeleton } from 'antd';
import React from 'react';

import { TrendIndicator } from '@components/common';

import SparklineChart from '../../charts/micro/SparklineChart';
import './StatCard.css';

/**
 * Reusable metric card for displaying a single statistic with trend.
 * Used in OverviewPage, ServiceDetailPage, InfrastructurePage, etc.
 */
interface StatCardProps {
  title: string;
  value: any;
  formatter?: (val: any) => string | number;
  trend?: number | null;
  trendInverted?: boolean;
  icon?: React.ReactNode;
  iconColor?: string;
  loading?: boolean;
  suffix?: string;
  description?: string;
  sparklineData?: number[];
  sparklineColor?: string;
}

/**
 *
 * @param root0
 * @param root0.title
 * @param root0.value
 * @param root0.formatter
 * @param root0.trend
 * @param root0.trendInverted
 * @param root0.icon
 * @param root0.iconColor
 * @param root0.loading
 * @param root0.suffix
 * @param root0.description
 * @param root0.sparklineData
 * @param root0.sparklineColor
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
}: StatCardProps) {
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
                {React.isValidElement(icon) ? icon : React.createElement(icon as any, { size: 20 })}
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
                color={sparklineColor || iconColor || APP_COLORS.hex_5e60ce}
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
