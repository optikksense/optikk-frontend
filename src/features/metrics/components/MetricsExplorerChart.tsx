import { AlertCircle, BarChart3, RefreshCw } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@shared/components/primitives/ui/button";
import { PageSurface } from "@shared/components/ui";
import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import { cn } from "@shared/lib/utils";

import type {
  ChartType,
  FormulaDefinition,
  MetricExplorerResults,
  MetricQueryDefinition,
  MetricYAxisScale,
} from "@shared/metrics/types";
import { buildSeries, toRenderType } from "@shared/metrics/utils/chartSeries";
import { useMetricsStore } from "../store/metricsStore";

const MAX_RENDERED_SERIES = 100;

interface MetricsExplorerChartProps {
  readonly queries: MetricQueryDefinition[];
  readonly formulas: FormulaDefinition[];
  readonly results: MetricExplorerResults | undefined;
  readonly chartType: ChartType;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly onRetry?: () => void;
}

function percentFormatter(value: number): string {
  return `${value.toFixed(value >= 100 ? 0 : 1)}%`;
}

function yFormatterFor(scale: MetricYAxisScale): ((value: number) => string) | undefined {
  return scale === "percent" ? percentFormatter : undefined;
}

export function MetricsExplorerChart({
  queries,
  formulas,
  results,
  chartType,
  isLoading,
  isError,
  onRetry,
}: MetricsExplorerChartProps) {
  const showLegend = useMetricsStore((s) => s.showLegend);
  const smooth = useMetricsStore((s) => s.smooth);
  const yAxisScale = useMetricsStore((s) => s.yAxisScale);

  const hasResults = results && Object.keys(results).length > 0;
  const hasActiveQuery = queries.some((q) => q.metricName);

  const { timestamps, series } = useMemo(
    () => buildSeries(queries, formulas, results ?? {}, chartType),
    [queries, formulas, results, chartType]
  );

  if (!hasActiveQuery) {
    return (
      <PageSurface padding="lg" className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <BarChart3 size={40} className="text-foreground-muted opacity-40" />
          <div className="font-medium text-[14px] text-foreground-secondary">
            Select a metric to start exploring
          </div>
          <div className="max-w-[320px] text-[12px] text-foreground-muted">
            Choose a metric name and aggregation function to visualize your data over time.
          </div>
        </div>
      </PageSurface>
    );
  }

  if (isLoading && !hasResults) {
    return (
      <PageSurface padding="lg" className="min-h-[400px]">
        <div className="flex h-[360px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground-muted border-t-primary" />
        </div>
      </PageSurface>
    );
  }

  if (isError) {
    return (
      <PageSurface padding="lg" className="min-h-[400px]">
        <div className="flex h-[360px] flex-col items-center justify-center gap-3">
          <AlertCircle size={32} className="text-error opacity-60" />
          <div className="text-[13px] text-error">Failed to load metrics data</div>
          {onRetry && (
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </PageSurface>
    );
  }

  if (!hasResults) {
    return (
      <PageSurface padding="lg" className="min-h-[400px]">
        <div className="flex h-[360px] items-center justify-center">
          <div className="text-[13px] text-foreground-muted">No data for the selected query.</div>
        </div>
      </PageSurface>
    );
  }

  const truncated = series.length > MAX_RENDERED_SERIES;
  const widthAdjusted = smooth ? series : series.map((s) => ({ ...s, width: 1 }));
  const renderedSeries = truncated ? widthAdjusted.slice(0, MAX_RENDERED_SERIES) : widthAdjusted;

  return (
    <PageSurface
      padding="lg"
      className={cn("min-h-[400px]", isLoading && "opacity-70 transition-opacity duration-200")}
    >
      {truncated ? (
        <div className="mb-3 rounded border border-border bg-secondary px-3 py-2 text-[12px] text-foreground-secondary">
          Showing first {MAX_RENDERED_SERIES} of {series.length} series. Add a filter or group-by to
          narrow results.
        </div>
      ) : null}
      <ObservabilityChart
        timestamps={timestamps}
        series={renderedSeries}
        type={toRenderType(chartType)}
        height={360}
        legend={showLegend}
        yFormatter={yFormatterFor(yAxisScale)}
      />
    </PageSurface>
  );
}
