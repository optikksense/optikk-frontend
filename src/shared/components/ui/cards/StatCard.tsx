import { APP_COLORS } from "@config/colorLiterals";
import { Skeleton, Surface } from "@shared/components/primitives/ui";
import { TrendIndicator } from "@shared/components/ui";
import { cn } from "@shared/lib/utils";
import React from "react";
import SparklineChart from "../charts/micro/SparklineChart";

export type KpiTone = "ok" | "success" | "warn" | "err" | "neutral" | "muted";

const VALUE_TONE: Record<KpiTone, string> = {
  ok: "text-foreground",
  success: "text-success",
  warn: "text-warning",
  err: "text-error",
  neutral: "text-foreground",
  muted: "text-foreground-muted",
};

interface StatCardMetric {
  title: React.ReactNode;
  value: string | number;
  formatter?: (val: string | number) => string | number;
  suffix?: string;
  description?: string;
}

interface StatCardTrend {
  value?: number | null;
  inverted?: boolean;
}

interface StatCardVisuals {
  icon?: React.ReactNode;
  iconColor?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  loading?: boolean;
}

// Icon-and-trend stat variant, used by dashboards and hub pages.
interface StatVariantProps {
  metric: StatCardMetric;
  trend?: StatCardTrend;
  visuals?: StatCardVisuals;
}

// Compact KPI-strip variant with tone-colored value, used by detail pages.
interface KpiVariantProps {
  readonly label: string;
  readonly value: string;
  readonly secondary?: string;
  readonly subtext?: string;
  readonly tone?: KpiTone;
  readonly sparkline?: React.ReactNode;
  readonly delta?: React.ReactNode;
}

export type StatCardProps = StatVariantProps | KpiVariantProps;

function StatBody({ metric, trend = {}, visuals = {} }: StatVariantProps) {
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
                {React.isValidElement(icon)
                  ? icon
                  : React.createElement(icon as unknown as React.ComponentType<{ size: number }>, {
                      size: 20,
                    })}
              </span>
            )}
          </div>
          <div
            aria-live="polite"
            aria-atomic="true"
            className="font-light text-foreground text-xl tabular-nums leading-[1.2]"
          >
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
}

function KpiBody({
  label,
  value,
  secondary,
  subtext,
  tone = "ok",
  sparkline,
  delta,
}: KpiVariantProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-card px-3.5 py-3">
      <div className="text-[10.5px] text-foreground-muted uppercase tracking-[0.08em]">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div
          className={cn(
            "flex items-baseline gap-1.5 font-semibold text-[28px] leading-none",
            VALUE_TONE[tone]
          )}
        >
          <span>{value}</span>
          {secondary && (
            <span className="font-normal text-[13px] text-foreground-muted">{secondary}</span>
          )}
        </div>
        {sparkline && <div className="h-[24px] w-[80px] flex-shrink-0">{sparkline}</div>}
      </div>
      <div className="flex items-baseline gap-2 text-[11px] text-foreground-muted">
        {subtext && <span>{subtext}</span>}
        {delta}
      </div>
    </div>
  );
}

/**
 * The single shared stat/KPI card. Two prop shapes select the two layouts:
 * `{ metric, trend?, visuals? }` renders the dashboard stat card, while
 * `{ label, value, ... }` renders the compact tone-colored KPI card.
 */
const StatCard = React.memo(function StatCard(props: StatCardProps) {
  return "metric" in props ? <StatBody {...props} /> : <KpiBody {...props} />;
});

export default StatCard;

// Named alias for KPI-strip call sites.
export const KpiCard = StatCard;
