import { CreateMonitorButton } from "../../components/CreateMonitorButton";
import { ExportButton } from "../../components/ExportButton";
import { ShareLinkButton } from "../../components/ShareLinkButton";
import { TraceScopeToggle } from "../../components/TraceScopeToggle";
import { SpansResultsPane } from "./SpansResultsPane";
import { TracesAnalyticsSection } from "./TracesAnalyticsSection";
import { TracesResultsPane } from "./TracesResultsPane";
import type { useTracesExplorerPage } from "./useTracesExplorerPage";

type PageState = ReturnType<typeof useTracesExplorerPage>;

/** Chooses between analytics, spans and traces panes based on mode+scope. */
export function ExplorerMainBody({ p }: { p: PageState }) {
  if (p.state.mode === "analytics") {
    return <TracesAnalyticsSection filters={p.state.filters} />;
  }
  return (
    <>
      <TraceScopeToggle
        scope={p.scope}
        onChange={p.setScope}
        trailing={
          <div className="flex items-center gap-3">
            <ExportButton traces={p.sortedTraces} />
            <CreateMonitorButton filters={p.state.filters} />
            <ShareLinkButton filters={p.state.filters} />
          </div>
        }
      />
      {p.scope === "spans" ? (
        <SpansResultsPane filters={p.state.filters} />
      ) : (
        <TracesResultsPane
          trendBuckets={p.trendBuckets}
          latencyPoints={p.latency.points}
          zoomed={p.zoomed}
          onTimeRangeChange={p.onTimeRangeChange}
          sortMode={p.sortMode}
          onSortChange={p.setSortMode}
          rows={p.sortedTraces}
          columns={p.columnDefs}
          columnConfig={p.columnConfig}
          onColumnConfigChange={p.setColumns}
          onRowClick={p.onRowClick}
          resetKey={p.filterKey}
          loading={p.query.isPending}
          queryError={p.queryError}
          onRetry={p.onRetry}
        />
      )}
    </>
  );
}
