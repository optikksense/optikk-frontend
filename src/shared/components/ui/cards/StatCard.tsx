import { Skeleton, Surface } from "@/components/ui";
import { APP_COLORS } from "@config/colorLiterals";
import { TrendIndicator } from "@shared/components/ui";
import React from "react";
import SparklineChart from "../charts/micro/SparklineChart";

export interface StatCardMetric {
  title: React.ReactNode;
  value: string | number;
  formatter?: (val: string | number) => string | number;
  suffix?: string;
  description?: string;
}

export interface StatCardTrend {
  value?: number | null;
  inverted?: boolean;
}

export interface StatCardVisuals {
  icon?: React.ReactNode;
  iconColor?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  loading?: boolean;
}

export interface StatCardProps {
  metric: StatCardMetric;
  trend?: StatCardTrend;
  visuals?: StatCardVisuals;
}

/**
 * Reusable metric card for displaying a single statistic with trend.
 */
const StatCard = React.memo(function StatCard({ metric, trend = {}, visuals = {} }: StatCardProps) {
  const { title, value, formatter, suffix, description } = metric;
  const { value: trendValue, inverted: trendInverted = false } = trend;
  const { icon, iconColor, sparklineData, sparklineColor, loading = false } = visuals;

  const displayValue = formatter ? formatter(value) : value;

  return (
    <Surface elevation={1} padding="sm" className="h-full">
      {loading ? (
        <div className="min-h-[80px] py-1">
          <Skeleton count={2} />
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="min-w-0 flex-1 font-medium text-[11px] text-[color:var(--text-secondary)] uppercase tracking-[0.5px]">
              {title}
            </span>
            {icon && (
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full opacity-90"
                style={{
                  color: iconColor,
                  backgroundColor: "color-mix(in srgb, var(--bg-tertiary) 88%, transparent)",
                }}
              >
                {React.isValidElement(icon) ? icon : React.createElement(icon as any, { size: 20 })}
              </span>
            )}
          </div>
          <div className="font-light text-foreground text-xl tabular-nums leading-[1.2]">
            {displayValue}
            {suffix && (
              <span className="ml-1 font-normal text-[color:var(--text-secondary)] text-base">
                {suffix}
              </span>
            )}
          </div>
          {description && <div className="mt-1 text-muted-foreground text-xs">{description}</div>}
          {sparklineData && sparklineData.length > 1 && (
            <div className="mt-2">
              <SparklineChart
                data={sparklineData}
                color={sparklineColor || iconColor || APP_COLORS.hex_5e60ce}
                width={120}
                height={28}
              />
            </div>
          )}
          {trendValue != null && <TrendIndicator value={trendValue} inverted={trendInverted} />}
        </>
      )}
    </Surface>
  );
});

export default StatCard;
