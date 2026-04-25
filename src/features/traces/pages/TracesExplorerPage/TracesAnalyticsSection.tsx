import { memo, useMemo, useState } from "react";

import { AnalyticsHeatmap } from "@/features/explorer/components/analytics/AnalyticsHeatmap";
import { AnalyticsPie } from "@/features/explorer/components/analytics/AnalyticsPie";
import { AnalyticsTable } from "@/features/explorer/components/analytics/AnalyticsTable";
import { AnalyticsTimeseries } from "@/features/explorer/components/analytics/AnalyticsTimeseries";
import {
  AnalyticsToolbar,
  type AnalyticsToolbarValue,
} from "@/features/explorer/components/analytics/AnalyticsToolbar";
import { AnalyticsTopN } from "@/features/explorer/components/analytics/AnalyticsTopN";
import { AnalyticsTreemap } from "@/features/explorer/components/analytics/AnalyticsTreemap";
import { AnalyticsVizTabs } from "@/features/explorer/components/analytics/AnalyticsVizTabs";
import type { AnalyticsResponse, ExplorerFilter } from "@/features/explorer/types";

import { useTracesAnalytics } from "../../hooks/useTracesAnalytics";

const AVAILABLE_FIELDS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "service", label: "Service" },
  { key: "operation", label: "Operation" },
  { key: "http_method", label: "HTTP method" },
  { key: "http_status", label: "HTTP status" },
  { key: "status", label: "Status" },
];

const DEFAULT_STATE: AnalyticsToolbarValue = {
  groupBy: ["service"],
  aggregations: [{ fn: "count", alias: "count" }],
  step: "auto",
  vizMode: "timeseries",
};

interface Props {
  readonly filters: readonly ExplorerFilter[];
}

function TracesAnalyticsSectionImpl({ filters }: Props) {
  const [toolbar, setToolbar] = useState<AnalyticsToolbarValue>(DEFAULT_STATE);
  const query = useTracesAnalytics({
    filters,
    groupBy: toolbar.groupBy,
    aggregations: toolbar.aggregations,
    step: toolbar.step,
    vizMode: toolbar.vizMode,
  });
  const response = query.data;
  const warnings = useMemo(() => response?.warnings ?? [], [response]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <AnalyticsToolbar value={toolbar} onChange={setToolbar} availableFields={AVAILABLE_FIELDS} />
      {warnings.length > 0 ? (
        <ul className="border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2 text-xs text-[var(--text-secondary)]">
          {warnings.map((w) => <li key={w.code}>{w.message}</li>)}
        </ul>
      ) : null}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-2">
        <AnalyticsVizTabs
          value={toolbar.vizMode}
          onChange={(v) => setToolbar((s) => ({ ...s, vizMode: v }))}
        />
        <span className="text-xs text-[var(--text-secondary)]">
          {query.isPending ? "Loading…" : `${response?.rows.length ?? 0} rows`}
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <AnalyticsBody response={response} loading={query.isPending} vizMode={toolbar.vizMode} />
      </div>
    </div>
  );
}

function AnalyticsBody({
  response, loading, vizMode,
}: {
  response: AnalyticsResponse | undefined;
  loading: boolean;
  vizMode: AnalyticsToolbarValue["vizMode"];
}) {
  if (!response || response.rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
        {loading ? "Loading analytics…" : "No data"}
      </div>
    );
  }
  if (vizMode === "timeseries") return <div className="h-full p-2"><AnalyticsTimeseries data={response} /></div>;
  if (vizMode === "topN") return <AnalyticsTopN data={response} />;
  if (vizMode === "pie") return <AnalyticsPie data={response} />;
  if (vizMode === "heatmap") return <AnalyticsHeatmap data={response} />;
  if (vizMode === "treemap") return <AnalyticsTreemap data={response} />;
  return <AnalyticsTable data={response} />;
}

export const TracesAnalyticsSection = memo(TracesAnalyticsSectionImpl);
