import { memo, useMemo, useState } from "react";

import { AnalyticsPie } from "@/features/explorer/components/analytics/AnalyticsPie";
import { AnalyticsTable } from "@/features/explorer/components/analytics/AnalyticsTable";
import { AnalyticsTimeseries } from "@/features/explorer/components/analytics/AnalyticsTimeseries";
import {
  AnalyticsToolbar,
  type AnalyticsToolbarValue,
} from "@/features/explorer/components/analytics/AnalyticsToolbar";
import { AnalyticsVizTabs } from "@/features/explorer/components/analytics/AnalyticsVizTabs";
import { AnalyticsTopN } from "@/features/explorer/components/analytics/AnalyticsTopN";
import type { ExplorerFilter } from "@/features/explorer/types";

import { useLogsAnalytics } from "../../hooks/useLogsAnalytics";

const AVAILABLE_FIELDS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "service", label: "Service" },
  { key: "severity_bucket", label: "Severity" },
  { key: "host", label: "Host" },
  { key: "pod", label: "Pod" },
  { key: "environment", label: "Environment" },
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

/**
 * Analytics mode for the logs explorer. Mirrors the structure for traces —
 * toolbar picks groupBy + aggs + step + viz, which drives the analytics
 * query; the viz tabs swap between the four renderers. URL sync for the
 * toolbar state is intentionally deferred (ephemeral for v1).
 */
function LogsAnalyticsSectionImpl({ filters }: Props) {
  const [toolbar, setToolbar] = useState<AnalyticsToolbarValue>(DEFAULT_STATE);
  const query = useLogsAnalytics({
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
      <AnalyticsToolbar
        value={toolbar}
        onChange={setToolbar}
        availableFields={AVAILABLE_FIELDS}
      />
      {warnings.length > 0 ? (
        <ul className="border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-2 text-xs text-[var(--text-secondary)]">
          {warnings.map((w) => (
            <li key={w.code}>{w.message}</li>
          ))}
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
        {!response || response.rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
            {query.isPending ? "Loading analytics…" : "No data"}
          </div>
        ) : toolbar.vizMode === "timeseries" ? (
          <div className="h-full p-2">
            <AnalyticsTimeseries data={response} />
          </div>
        ) : toolbar.vizMode === "topN" ? (
          <AnalyticsTopN data={response} />
        ) : toolbar.vizMode === "pie" ? (
          <AnalyticsPie data={response} />
        ) : (
          <AnalyticsTable data={response} />
        )}
      </div>
    </div>
  );
}

export const LogsAnalyticsSection = memo(LogsAnalyticsSectionImpl);
