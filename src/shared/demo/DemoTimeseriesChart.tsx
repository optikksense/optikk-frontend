import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";

import { DEMO_SERVICE_SERIES, DEMO_TIMESTAMPS_S, type DemoServiceSeries } from "./fixtures";

type Variant = "requests" | "errors" | "p95";

interface DemoTimeseriesChartProps {
  readonly variant: Variant;
  readonly height?: number;
  readonly legend?: boolean;
}

function pickValues(s: DemoServiceSeries, variant: Variant): number[] {
  if (variant === "requests") return s.requests;
  if (variant === "errors") return s.errors;
  return s.p95Ms;
}

function formatRequests(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toFixed(0);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatMs(value: number): string {
  return `${value.toFixed(0)}ms`;
}

export default function DemoTimeseriesChart({
  variant,
  height = 220,
  legend = true,
}: DemoTimeseriesChartProps) {
  const series = useMemo<ObservabilityChartSeries[]>(
    () =>
      DEMO_SERVICE_SERIES.map((s) => ({
        label: s.name,
        values: pickValues(s, variant),
        color: s.color,
        fill: false,
        width: 1.85,
      })),
    [variant]
  );

  const yFormatter =
    variant === "requests"
      ? formatRequests
      : variant === "errors"
        ? formatPercent
        : formatMs;

  const yMax = useMemo(() => {
    let max = 0;
    for (const s of series) {
      for (const v of s.values) {
        if (v != null && v > max) max = v;
      }
    }
    return Math.max(1, Math.ceil(max * 1.2));
  }, [series]);

  return (
    <ObservabilityChart
      timestamps={DEMO_TIMESTAMPS_S}
      series={series}
      yMin={0}
      yMax={yMax}
      yFormatter={yFormatter}
      height={height}
      legend={legend}
    />
  );
}
