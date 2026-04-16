import { AlertCircle } from "lucide-react";
import { memo } from "react";

import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable, FacetRail } from "@/features/explorer-core/components";
import type { FacetGroup } from "@/features/explorer-core/types";

import { cn } from "@/lib/utils";
import { formatNumber } from "@shared/utils/formatters";

import type { LlmGenerationRecord } from "../../../types";
import { type LlmFacetSelectionHandlers, handleFacetSelect } from "../facetSelection";

type Props = {
  facetGroups: FacetGroup[];
  selectedFacetState: Record<string, string | null | undefined>;
  facetHandlers: LlmFacetSelectionHandlers;
  isError: boolean;
  generations: LlmGenerationRecord[];
  columns: SimpleTableColumn<LlmGenerationRecord>[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedGeneration: LlmGenerationRecord | null;
  onSelectGeneration: (row: LlmGenerationRecord) => void;
};

function LlmGenerationsListSectionComponent({
  facetGroups,
  selectedFacetState,
  facetHandlers,
  isError,
  generations,
  columns,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  selectedGeneration,
  onSelectGeneration,
}: Props) {
  return (
    <>
      <FacetRail
        groups={facetGroups}
        selected={selectedFacetState}
        onSelect={(groupKey, value) => handleFacetSelect(groupKey, value, facetHandlers)}
      />

      {isError && (
        <div className="mb-3 flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium text-sm">Failed to load generations</span>
        </div>
      )}

      <ExplorerResultsTable
        title="LLM Generations"
        subtitle={`${formatNumber(generations.length)} rows in view, ${formatNumber(total)} total`}
        rows={generations}
        columns={columns}
        rowKey={(row) => `${row.trace_id}-${row.span_id}`}
        isLoading={isLoading}
        page={page}
        pageSize={pageSize}
        showPagination
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onRow={(row) => ({
          onClick: () => onSelectGeneration(row),
        })}
        rowClassName={(row) =>
          cn(
            "cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]",
            selectedGeneration?.span_id === row.span_id &&
              "bg-[rgba(10,174,214,0.12)] ring-1 ring-[rgba(10,174,214,0.28)] ring-inset"
          )
        }
      />
    </>
  );
}

export const LlmGenerationsListSection = memo(LlmGenerationsListSectionComponent);
