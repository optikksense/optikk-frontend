import { AlertCircle } from "lucide-react";
import { memo, useCallback } from "react";

import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable, FacetRail } from "@/features/explorer-core/components";
import type { FacetGroup } from "@/features/explorer-core/types";
import { cn } from "@/lib/utils";
import { ERROR_CODE_LABELS } from "@/shared/constants/errorCodes";
import { formatNumber } from "@shared/utils/formatters";

import type { TraceRecord } from "../../../types";

type NormalizedError = { code: string; message: string } | null;

type Props = {
  facetGroups: FacetGroup[];
  selectedFacetState: Record<string, string | null | undefined>;
  onFacetSelect: (groupKey: string, value: string | null) => void;
  isError: boolean;
  normalizedError: NormalizedError;
  renderedTraces: TraceRecord[];
  columns: SimpleTableColumn<TraceRecord>[];
  isLoading: boolean;
  isLiveTail: boolean;
  page: number;
  pageSize: number;
  totalTraces: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedTrace: TraceRecord | null;
  onSelectTrace: (row: TraceRecord) => void;
};

function TracesListSectionComponent({
  facetGroups,
  selectedFacetState,
  onFacetSelect,
  isError,
  normalizedError,
  renderedTraces,
  columns,
  isLoading,
  isLiveTail,
  page,
  pageSize,
  totalTraces,
  onPageChange,
  onPageSizeChange,
  selectedTrace,
  onSelectTrace,
}: Props) {
  const handleRow = useCallback(
    (row: TraceRecord) => ({ onClick: () => onSelectTrace(row) }),
    [onSelectTrace]
  );
  return (
    <>
      <FacetRail groups={facetGroups} selected={selectedFacetState} onSelect={onFacetSelect} />

      {isError && normalizedError ? (
        <div className="mb-3 flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium text-sm">
            {ERROR_CODE_LABELS[normalizedError.code] ?? "Error"}
          </span>
          <span className="text-sm opacity-80">
            {normalizedError.message || "Failed to load traces"}
          </span>
        </div>
      ) : null}

      <ExplorerResultsTable
        title="Trace Explorer"
        subtitle={`${formatNumber(renderedTraces.length)} rows in view, ${formatNumber(totalTraces)} total traces`}
        rows={renderedTraces}
        columns={columns}
        rowKey={(row) => row.trace_id}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        showPagination={!isLiveTail}
        total={isLiveTail ? renderedTraces.length : totalTraces}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onRow={handleRow}
        rowClassName={(row) =>
          cn(
            "cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]",
            selectedTrace?.trace_id === row.trace_id &&
              "bg-[rgba(10,174,214,0.12)] ring-1 ring-[rgba(10,174,214,0.28)] ring-inset"
          )
        }
      />
    </>
  );
}

export const TracesListSection = memo(TracesListSectionComponent);
