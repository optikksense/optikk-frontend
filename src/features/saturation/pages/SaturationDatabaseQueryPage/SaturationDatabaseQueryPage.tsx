import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import type { DatabaseFilters } from "@/features/saturation/api/databaseSlowQueriesApi";
import { Route } from "@/routes/_app/database/query/$queryId";
import { PageShell } from "@shared/components/ui/layout/PageShell";

import { QueryDetailHeader } from "./QueryDetailHeader";
import { QueryDetailKpiStrip } from "./QueryDetailKpiStrip";
import { QueryExecutionsTable } from "./QueryExecutionsTable";
import { QueryTimeseriesCharts } from "./QueryTimeseriesCharts";
import {
  useQueryDetailExecutions,
  useQueryDetailSummary,
  useQueryDetailTimeseries,
} from "./hooks/useQueryDetail";
import { viewFromSummary } from "./viewModel";

function EmptyCard({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 text-[12px] text-foreground-muted">
      {text}
    </div>
  );
}

function downloadJson(name: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function BackendQueryDetail({ hash, filters }: { hash: string; filters: DatabaseFilters }) {
  const summary = useQueryDetailSummary(hash, filters, true);
  const timeseries = useQueryDetailTimeseries(hash, filters, true);
  const executions = useQueryDetailExecutions(hash, filters, true);

  const view = useMemo(() => (summary.data ? viewFromSummary(summary.data) : null), [summary.data]);

  if (!view || view.callCount === 0) {
    return (
      <EmptyCard
        text={
          summary.isPending
            ? "Loading…"
            : "No executions of this query were recorded in the current time range."
        }
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <QueryDetailHeader
        view={view}
        onExport={() =>
          downloadJson(`query-${hash}.json`, {
            summary: summary.data,
            executions: executions.data ?? [],
          })
        }
      />
      <QueryDetailKpiStrip view={view} timeseries={timeseries.data ?? []} />
      <QueryTimeseriesCharts timeseries={timeseries.data ?? []} />
      <QueryExecutionsTable rows={executions.data ?? []} loading={executions.isPending} />
    </div>
  );
}

export default function SaturationDatabaseQueryPage(): JSX.Element {
  const params = useParams({ strict: false });
  const queryId = typeof params.queryId === "string" ? params.queryId : "";
  const filters = Route.useSearch();

  return (
    <PageShell>
      {/^[0-9a-f]{16}$/.test(queryId) ? (
        <BackendQueryDetail hash={queryId} filters={filters} />
      ) : (
        <EmptyCard text="Invalid query identifier." />
      )}
    </PageShell>
  );
}
