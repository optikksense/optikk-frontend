import { memo } from "react";

import type { ExplorerAnalyticsResult } from "@/features/explorer-core/api/explorerAnalyticsApi";
import type { ExplorerVizMode } from "@/features/explorer-core/components/AnalyticsToolbar";
import { AnalyticsPieChart } from "@/features/explorer-core/components/visualizations/AnalyticsPieChart";
import { AnalyticsTable } from "@/features/explorer-core/components/visualizations/AnalyticsTable";
import { AnalyticsTimeseries } from "@/features/explorer-core/components/visualizations/AnalyticsTimeseries";
import { AnalyticsTopList } from "@/features/explorer-core/components/visualizations/AnalyticsTopList";
import type { UseQueryResult } from "@tanstack/react-query";

import { PageSurface } from "@shared/components/ui";

type Props = {
  vizMode: ExplorerVizMode;
  analyticsQuery: UseQueryResult<ExplorerAnalyticsResult, Error>;
};

function LlmGenerationsAnalyticsSectionComponent({ vizMode, analyticsQuery }: Props) {
  if (analyticsQuery.isLoading) {
    return (
      <PageSurface padding="lg" className="min-h-[320px]">
        <div className="text-[13px] text-[var(--text-muted)]">Loading analytics...</div>
      </PageSurface>
    );
  }
  if (analyticsQuery.isError) {
    return (
      <PageSurface padding="lg" className="min-h-[320px]">
        <div className="text-[13px] text-[var(--color-error)]">Analytics request failed.</div>
      </PageSurface>
    );
  }
  if (!analyticsQuery.data) {
    return (
      <PageSurface padding="lg" className="min-h-[320px]">
        <div className="text-[13px] text-[var(--text-muted)]">Configure group by and metrics.</div>
      </PageSurface>
    );
  }

  return (
    <PageSurface padding="lg" className="min-h-[320px]">
      <div className="space-y-4">
        {vizMode === "timeseries" ? <AnalyticsTimeseries result={analyticsQuery.data} /> : null}
        {vizMode === "toplist" ? <AnalyticsTopList result={analyticsQuery.data} /> : null}
        {vizMode === "table" || vizMode === "list" ? (
          <AnalyticsTable result={analyticsQuery.data} />
        ) : null}
        {vizMode === "piechart" ? <AnalyticsPieChart result={analyticsQuery.data} /> : null}
      </div>
    </PageSurface>
  );
}

export const LlmGenerationsAnalyticsSection = memo(LlmGenerationsAnalyticsSectionComponent);
