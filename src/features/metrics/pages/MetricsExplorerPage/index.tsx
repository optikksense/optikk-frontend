import { BarChart3, Share2 } from "lucide-react";
import { useCallback } from "react";
import toast from "react-hot-toast";

import { Button } from "@shared/components/primitives/ui/button";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";

import { MetricQueryBuilder } from "../../components/MetricQueryBuilder/MetricQueryBuilder";
import { MetricsExplorerChart } from "../../components/MetricsExplorerChart";
import { MetricsExplorerToolbar } from "../../components/MetricsExplorerToolbar";
import { useMetricsExplorer } from "../../hooks/useMetricsExplorer";
import { useMetricsExplorerQuery } from "../../hooks/useMetricsExplorerQuery";
import type { MetricExplorerResults } from "../../types";

export default function MetricsExplorerPage() {
  const {
    queries,
    formulas,
    chartType,
    step,
    spaceAgg,
    addQuery,
    removeQuery,
    updateQueryAggregation,
    updateQueryMetric,
    updateQueryWhere,
    updateQueryGroupBy,
    addFormula,
    removeFormula,
    updateFormulaExpression,
    setChartType,
    setStep,
    setSpaceAgg,
  } = useMetricsExplorer();

  const { data, isLoading, isError, refetch } = useMetricsExplorerQuery(queries, step, spaceAgg);

  const handleShare = useCallback(() => {
    void navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  }, []);

  return (
    <PageShell>
      <PageHeader
        title="Metrics"
        icon={<BarChart3 size={22} />}
        subtitle="Query, visualize, and compare metrics across your services."
        actions={
          <Button variant="ghost" size="sm" icon={<Share2 size={14} />} onClick={handleShare}>
            Share
          </Button>
        }
      />

      <PageSurface padding="lg" className="relative z-[40] overflow-visible">
        <div className="flex flex-col gap-4">
          <MetricQueryBuilder
            queries={queries}
            formulas={formulas}
            onAddQuery={addQuery}
            onRemoveQuery={removeQuery}
            onAggregationChange={updateQueryAggregation}
            onMetricChange={updateQueryMetric}
            onWhereChange={updateQueryWhere}
            onGroupByChange={updateQueryGroupBy}
            onAddFormula={addFormula}
            onRemoveFormula={removeFormula}
            onFormulaExpressionChange={updateFormulaExpression}
          />

          <MetricsExplorerToolbar
            chartType={chartType}
            step={step}
            spaceAgg={spaceAgg}
            onChartTypeChange={setChartType}
            onStepChange={setStep}
            onSpaceAggChange={setSpaceAgg}
          />
        </div>
      </PageSurface>

      <MetricsExplorerChart
        queries={queries}
        formulas={formulas}
        results={(data?.results ?? {}) as MetricExplorerResults}
        chartType={chartType}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
      />
    </PageShell>
  );
}
