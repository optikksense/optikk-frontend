import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

import type {
  AggregationSpec,
  ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { useExplorerAnalytics } from "@/features/explorer-core/hooks/useExplorerAnalytics";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { cn } from "@/lib/utils";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { useTimeRange } from "@app/store/appStore";

import { llmHubApi } from "../../api/llmHubApi";
import { useLlmExplorer } from "../../hooks/useLlmExplorer";
import { useLlmGenerationDetail } from "../../hooks/useLlmGenerationDetail";
import type { LlmGenerationRecord } from "../../types";
import { LlmGenerationsAnalyticsSection } from "./components/LlmGenerationsAnalyticsSection";
import { LlmGenerationsDatasetModal } from "./components/LlmGenerationsDatasetModal";
import { LlmGenerationsDetailPanel } from "./components/LlmGenerationsDetailPanel";
import { LlmGenerationsExplorerChrome } from "./components/LlmGenerationsExplorerChrome";
import { LlmGenerationsHeader } from "./components/LlmGenerationsHeader";
import { LlmGenerationsListSection } from "./components/LlmGenerationsListSection";
import { useLlmFacetRailModel } from "./hooks/useLlmFacetRailModel";
import { useLlmGenerationsColumns } from "./hooks/useLlmGenerationsColumns";

export default function LlmGenerationsView() {
  const queryClient = useQueryClient();
  const timeRange = useTimeRange();
  const explorer = useLlmExplorer();

  const {
    isPending: isLoading,
    isError,
    generations,
    summary,
    facets,
    trend,
    selectedProvider,
    selectedModel,
    selectedSession,
    errorsOnly,
    pageSize,
    hasMore,
    hasPrev,
    onNext,
    onPrev,
    filters,
    explorerQuery,
    setSelectedProvider,
    setSelectedModel,
    setSelectedSession,
    setErrorsOnly,
    setPageSize,
    resetCursor,
    setFilters,
    clearAll,
    startTime,
    endTime,
  } = explorer;

  const [explorerMode, setExplorerMode] = useState<"list" | "analytics">("list");
  const [datasetModalOpen, setDatasetModalOpen] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [vizMode, setVizMode] = useState<ExplorerVizMode>("table");
  const [groupBy, setGroupBy] = useState<string[]>(["gen_ai.request.model"]);
  const [aggregations, setAggregations] = useState<AggregationSpec[]>([
    { function: "count", alias: "count" },
  ]);
  const [analyticsStep, setAnalyticsStep] = useState("5m");

  const { startTime: rangeStart, endTime: rangeEnd } = useMemo(
    () => resolveTimeBounds(timeRange),
    [timeRange]
  );

  const analyticsEnabled =
    explorerMode === "analytics" && groupBy.length > 0 && aggregations.length > 0;

  const analyticsQuery = useExplorerAnalytics("traces", {
    query: explorerQuery ? `@gen_ai.system:* AND ${explorerQuery}` : "@gen_ai.system:*",
    startTime: rangeStart,
    endTime: rangeEnd,
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

  const [selectedGeneration, setSelectedGeneration] = useState<LlmGenerationRecord | null>(null);
  const detailFields = useLlmGenerationDetail(selectedGeneration);

  const topModels = useMemo(() => facets.ai_model.slice(0, 5), [facets.ai_model]);

  const columns = useLlmGenerationsColumns();

  const saveDatasetMutation = useMutation({
    mutationFn: llmHubApi.createDataset,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["llm", "hub", "datasets"] });
      toast.success("Dataset saved");
      setDatasetModalOpen(false);
      setDatasetName("");
    },
    onError: (e: Error) => toast.error(e.message || "Could not save dataset"),
  });

  const { facetGroups, selectedFacetState } = useLlmFacetRailModel({
    facets,
    selectedProvider,
    selectedModel,
    errorsOnly,
    filters,
  });

  const facetHandlers = useMemo(
    () => ({
      filters,
      setFilters,
      setSelectedProvider,
      setSelectedModel,
      setErrorsOnly,
      resetPage: resetCursor,
    }),
    [filters, setFilters, setSelectedProvider, setSelectedModel, setErrorsOnly, resetCursor]
  );

  const onStructuredFiltersChange = useCallback(
    (nextFilters: StructuredFilter[]) => {
      setFilters(nextFilters);
      resetCursor();
    },
    [setFilters, resetCursor]
  );

  const onErrorsOnlyChange = useCallback(
    (checked: boolean) => {
      setErrorsOnly(checked);
      resetCursor();
    },
    [setErrorsOnly, resetCursor]
  );

  const onClearSessionFilter = useCallback(() => {
    setSelectedSession(null);
    resetCursor();
  }, [setSelectedSession, resetCursor]);

  const onToggleTopModel = useCallback(
    (model: string) => {
      setSelectedModel(selectedModel === model ? null : model);
      resetCursor();
    },
    [selectedModel, setSelectedModel, resetCursor]
  );

  const closeDatasetModal = useCallback(() => {
    setDatasetModalOpen(false);
    setDatasetName("");
  }, []);

  const onSaveDataset = useCallback(() => {
    const name = datasetName.trim();
    if (!name) {
      toast.error("Enter a dataset name.");
      return;
    }
    const stripped = generations.map(({ estimated_cost: _ec, ...rest }) => ({
      ...rest,
    }));
    saveDatasetMutation.mutate({
      name,
      query_snapshot: explorerQuery || "",
      start_time_ms: startTime,
      end_time_ms: endTime,
      generations: stripped,
    });
  }, [datasetName, endTime, explorerQuery, generations, saveDatasetMutation, startTime]);

  return (
    <div className="space-y-4">
      <LlmGenerationsHeader
        generations={generations}
        onOpenDataset={() => setDatasetModalOpen(true)}
        onReset={clearAll}
      />

      <LlmGenerationsExplorerChrome
        trend={trend}
        isLoading={isLoading}
        summary={summary}
        selectedSession={selectedSession}
        onClearSession={onClearSessionFilter}
        filters={filters}
        onClearAll={clearAll}
        errorsOnly={errorsOnly}
        onErrorsOnlyChange={onErrorsOnlyChange}
        onStructuredFiltersChange={onStructuredFiltersChange}
        topModels={topModels}
        selectedModel={selectedModel}
        onToggleModel={onToggleTopModel}
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
          "relative z-0 grid w-full min-w-0 gap-4",
          explorerMode === "list"
            ? "lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]"
            : "grid-cols-1"
        )}
      >
        {explorerMode === "list" ? (
          <LlmGenerationsListSection
            facetGroups={facetGroups}
            selectedFacetState={selectedFacetState}
            facetHandlers={facetHandlers}
            isError={isError}
            generations={generations}
            columns={columns}
            isLoading={isLoading}
            pageSize={pageSize}
            hasMore={hasMore}
            hasPrev={hasPrev}
            onNext={onNext}
            onPrev={onPrev}
            onPageSizeChange={setPageSize}
            selectedGeneration={selectedGeneration}
            onSelectGeneration={setSelectedGeneration}
          />
        ) : (
          <LlmGenerationsAnalyticsSection vizMode={vizMode} analyticsQuery={analyticsQuery} />
        )}
      </div>

      <LlmGenerationsDatasetModal
        open={datasetModalOpen}
        datasetName={datasetName}
        onDatasetNameChange={setDatasetName}
        onClose={closeDatasetModal}
        savePending={saveDatasetMutation.isPending}
        saveDisabled={saveDatasetMutation.isPending || generations.length === 0}
        onSave={onSaveDataset}
        startTime={startTime}
        endTime={endTime}
      />

      {selectedGeneration ? (
        <LlmGenerationsDetailPanel
          generation={selectedGeneration}
          detailFields={detailFields}
          startTime={startTime}
          endTime={endTime}
          onClose={() => setSelectedGeneration(null)}
        />
      ) : null}
    </div>
  );
}
