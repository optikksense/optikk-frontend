import { useCallback, useMemo, useState } from "react";

import type {
  AggregationSpec,
  ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { useExplorerAnalytics } from "@/features/explorer-core/hooks/useExplorerAnalytics";
import { buildLogsExplorerQuery } from "@/features/explorer-core/utils/explorerQuery";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { cn } from "@/lib/utils";
import { useURLFilters } from "@/shared/hooks/useURLFilters";
import { useTimeRange } from "@app/store/appStore";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { PageShell } from "@shared/components/ui";

import { useLogDetailFields } from "../../hooks/useLogDetailFields";
import { useLogsHubData } from "../../hooks/useLogsHubData";
import type { LogRecord, LogsBackendParams } from "../../types";
import { LOGS_URL_FILTER_CONFIG, compileLogsStructuredFilters } from "../../utils/logUtils";

import { LogsHubAnalyticsSection } from "./components/LogsHubAnalyticsSection";
import { LogsHubExplorerChrome } from "./components/LogsHubExplorerChrome";
import { LogsHubListSection } from "./components/LogsHubListSection";
import { LogsHubLogDetailPanel } from "./components/LogsHubLogDetailPanel";
import { LogsHubPageHeader } from "./components/LogsHubPageHeader";
import { type LogsFacetSelectionContext, handleLogsFacetSelect } from "./facetSelection";
import { useLogsHubColumns } from "./hooks/useLogsHubColumns";
import { useLogsHubFacetModel } from "./hooks/useLogsHubFacetModel";
import { useLogsHubShareCallbacks } from "./hooks/useLogsHubShareCallbacks";

export default function LogsHubPage() {
  const timeRange = useTimeRange();
  const { onCopyShareLink, onExportViewJson } = useLogsHubShareCallbacks();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LOGS_URL_FILTER_CONFIG);

  const errorsOnly = urlValues.errorsOnly === true;

  const setErrorsOnly = (value: boolean): void => {
    urlSetters.errorsOnly?.(value);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);

  const [explorerMode, setExplorerMode] = useState<"list" | "analytics">("list");
  const [vizMode, setVizMode] = useState<ExplorerVizMode>("table");
  const [groupBy, setGroupBy] = useState<string[]>(["service"]);
  const [aggregations, setAggregations] = useState<AggregationSpec[]>([
    { function: "count", alias: "count" },
  ]);
  const [analyticsStep, setAnalyticsStep] = useState("5m");

  const explorerQuery = useMemo(
    () => buildLogsExplorerQuery({ filters, errorsOnly }),
    [filters, errorsOnly]
  );

  const liveTailParams = useMemo((): LogsBackendParams => {
    const params: LogsBackendParams = {
      ...compileLogsStructuredFilters(filters),
    };
    if (errorsOnly) {
      params.severities = [...(params.severities ?? []), "ERROR"];
    }
    return params;
  }, [errorsOnly, filters]);

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const analyticsEnabled =
    explorerMode === "analytics" && groupBy.length > 0 && aggregations.length > 0;

  const analyticsQuery = useExplorerAnalytics("logs", {
    query: explorerQuery,
    startTime,
    endTime,
    groupBy,
    aggregations: aggregations.map((a) => ({
      function: a.function,
      field: a.field,
      alias: a.alias || "m",
    })),
    vizMode: vizMode === "list" ? "table" : vizMode,
    step: analyticsStep,
    limit: 500,
    enabled: analyticsEnabled,
  });

  const {
    logs,
    logsLoading,
    logsError,
    logsErrorDetail,
    total,
    serviceFacets,
    levelFacets,
    hostFacets,
    podFacets,
    containerFacets,
    environmentFacets,
    scopeNameFacets,
    liveTailEnabled,
    setLiveTailEnabled,
    liveTailStatus,
    liveTailLagMs,
    liveTailErrorMessage,
    liveTailDroppedCount,
    errorCount,
  } = useLogsHubData({
    explorerQuery,
    filters,
    liveTailParams,
    page,
    pageSize,
  });

  const detailFields = useLogDetailFields(selectedLog);
  const normalizedLogsError = useMemo(
    () => (logsErrorDetail ? toApiErrorShape(logsErrorDetail) : null),
    [logsErrorDetail]
  );

  const { activeSelections, facetGroups } = useLogsHubFacetModel(filters, errorsOnly, {
    serviceFacets,
    levelFacets,
    hostFacets,
    podFacets,
    containerFacets,
    environmentFacets,
    scopeNameFacets,
  });

  const onSelectLog = useCallback((row: LogRecord) => {
    setSelectedLog(row);
  }, []);

  const columns = useLogsHubColumns(liveTailEnabled, onSelectLog);

  const facetCtx: LogsFacetSelectionContext = useMemo(
    () => ({
      filters,
      setFilters,
      setErrorsOnly,
      setPage,
    }),
    [filters, setFilters, setErrorsOnly, setPage]
  );

  const onFacetSelect = useCallback(
    (groupKey: string, value: string | null) => {
      handleLogsFacetSelect(groupKey, value, facetCtx);
    },
    [facetCtx]
  );

  return (
    <PageShell>
      <LogsHubPageHeader onCopyShareLink={onCopyShareLink} onExportViewJson={onExportViewJson} />

      <LogsHubExplorerChrome
        liveTailEnabled={liveTailEnabled}
        liveTailErrorMessage={liveTailErrorMessage}
        liveTailStatus={liveTailStatus}
        liveTailLagMs={liveTailLagMs}
        liveTailDroppedCount={liveTailDroppedCount}
        errorCount={errorCount}
        onToggleLiveTail={() => setLiveTailEnabled(!liveTailEnabled)}
        filters={filters}
        setFilters={setFilters}
        clearURLFilters={clearURLFilters}
        setPage={setPage}
        errorsOnly={errorsOnly}
        setErrorsOnly={setErrorsOnly}
        explorerMode={explorerMode}
        setExplorerMode={setExplorerMode}
        vizMode={vizMode}
        setVizMode={setVizMode}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        aggregations={aggregations}
        setAggregations={setAggregations}
        analyticsStep={analyticsStep}
        setAnalyticsStep={setAnalyticsStep}
      />

      <div
        className={cn(
          "relative z-0 grid gap-4",
          explorerMode === "list" ? "xl:grid-cols-[300px_minmax(0,1fr)]" : "grid-cols-1"
        )}
      >
        {explorerMode === "list" ? (
          <LogsHubListSection
            facetGroups={facetGroups}
            activeSelections={activeSelections}
            onFacetSelect={onFacetSelect}
            logsError={logsError}
            normalizedLogsError={normalizedLogsError}
            logs={logs}
            columns={columns}
            logsLoading={logsLoading}
            liveTailEnabled={liveTailEnabled}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            selectedLog={selectedLog}
            onSelectLog={onSelectLog}
          />
        ) : (
          <LogsHubAnalyticsSection vizMode={vizMode} analyticsQuery={analyticsQuery} />
        )}
      </div>

      {selectedLog ? (
        <LogsHubLogDetailPanel
          log={selectedLog}
          detailFields={detailFields}
          onClose={() => setSelectedLog(null)}
        />
      ) : null}
    </PageShell>
  );
}
