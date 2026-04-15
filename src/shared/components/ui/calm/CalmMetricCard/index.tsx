import { Skeleton, Surface } from "@/components/ui";
import { TrendingDown, TrendingUp } from "lucide-react";

import SparklineChart from "@shared/components/ui/charts/micro/SparklineChart";

import { APP_COLORS } from "@config/colorLiterals";

import type { HealthStatus } from "../HealthRing";

interface CalmMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendInverted?: boolean;
  sparkline?: number[];
  sparklineColor?: string;
  status?: HealthStatus;
  loading?: boolean;
}

function TrendIndicator({ trend, inverted }: { trend: number; inverted?: boolean }) {
  const isPositive = inverted ? trend <= 0 : trend >= 0;
  const color = isPositive ? "var(--color-healthy)" : "var(--color-critical)";
  const Icon = trend >= 0 ? TrendingUp : TrendingDown;
  const sign = trend >= 0 ? "+" : "";
  return (
    <span
      className="inline-flex items-center gap-[3px] whitespace-nowrap font-medium text-[var(--text-xs,11px)]"
      style={{ color }}
    >
      <Icon size={11} />
      {sign}
      {trend.toFixed(1)}%
    </span>
  );
}

export default function CalmMetricCard({
  label,
  value,
  unit,
  trend,
  trendInverted,
  sparkline,
  sparklineColor = APP_COLORS.hex_7c7ff2,
  loading = false,
}: CalmMetricCardProps) {
  if (loading) {
    return (
      <Surface elevation={1} padding="sm" className="flex h-full min-h-[100px] flex-col gap-2">
        <Skeleton count={2} />
      </Surface>
    );
  }

  return (
    <Surface elevation={1} padding="sm" className="flex h-full flex-col gap-2">
      <span className="font-[var(--label-weight,500)] text-[color:var(--text-label)] text-[var(--label-size,11px)] uppercase tracking-[0.5px]">
        {label}
      </span>
      <div className="flex items-baseline gap-2.5">
        <span className="font-[var(--metric-weight,300)] text-[color:var(--text-numeric,var(--text-primary))] text-[var(--text-2xl,32px)] tabular-nums leading-[1.1]">
          {value}
          {unit && (
            <span className="ml-1 font-normal text-[color:var(--text-secondary)] text-[var(--text-base,15px)]">
              {unit}
            </span>
          )}
        </span>
        {trend !== undefined && <TrendIndicator trend={trend} inverted={trendInverted} />}
      </div>
      {sparkline && sparkline.length >= 2 && (
        <div className="[&>div]:!w-full mt-1 w-full">
          <SparklineChart
            data={sparkline}
            color={sparklineColor}
            fill={false}
            width={undefined}
            height={36}
          />
        </div>
      )}
    </Surface>
  );
}
