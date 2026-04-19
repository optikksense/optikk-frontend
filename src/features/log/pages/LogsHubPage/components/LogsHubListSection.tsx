import { AlertCircle } from "lucide-react";
import { memo, useCallback } from "react";

import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable, FacetRail } from "@/features/explorer-core/components";
import type { FacetGroup } from "@/features/explorer-core/types";
import { cn } from "@/lib/utils";
import { ERROR_CODE_LABELS } from "@/shared/constants/errorCodes";
import { formatNumber } from "@shared/utils/formatters";
import { rowKey as logRowKey } from "@shared/utils/logUtils";

import type { LogRecord } from "../../../types";

type NormalizedError = { code: string; message: string } | null;

type Props = {
  facetGroups: FacetGroup[];
  activeSelections: Record<string, string | null | undefined>;
  onFacetSelect: (groupKey: string, value: string | null) => void;
  logsError: boolean;
  normalizedLogsError: NormalizedError;
  logs: LogRecord[];
  columns: SimpleTableColumn<LogRecord>[];
  logsLoading: boolean;
  liveTailEnabled: boolean;
  pageSize: number;
  hasMore: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  onPageSizeChange: (size: number) => void;
  selectedLog: LogRecord | null;
  onSelectLog: (row: LogRecord) => void;
};

function LogsHubListSectionComponent({
  facetGroups,
  activeSelections,
  onFacetSelect,
  logsError,
  normalizedLogsError,
  logs,
  columns,
  logsLoading,
  liveTailEnabled,
  pageSize,
  hasMore,
  hasPrev,
  onNext,
  onPrev,
  onPageSizeChange,
  selectedLog,
  onSelectLog,
}: Props) {
  const handleRow = useCallback(
    (row: LogRecord) => ({ onClick: () => onSelectLog(row) }),
    [onSelectLog]
  );
  return (
    <>
      <FacetRail groups={facetGroups} selected={activeSelections} onSelect={onFacetSelect} />

      {logsError && normalizedLogsError ? (
        <div className="mb-3 flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium text-sm">
            {ERROR_CODE_LABELS[normalizedLogsError.code] ?? "Error"}
          </span>
          <span className="text-sm opacity-80">
            {normalizedLogsError.message || "Failed to load logs"}
          </span>
        </div>
      ) : null}

      <ExplorerResultsTable
        key={liveTailEnabled ? "logs-live-tail" : "logs-explorer"}
        title="Logs Explorer"
        subtitle={
          liveTailEnabled
            ? `${formatNumber(logs.length)} live tail rows`
            : `${formatNumber(logs.length)} rows in view${hasMore ? " — more available" : ""}`
        }
        rows={logs}
        columns={columns}
        rowKey={(row) => logRowKey(row)}
        isLoading={logsLoading}
        pagination={
          liveTailEnabled
            ? undefined
            : {
                hasMore,
                hasPrev,
                onNext,
                onPrev,
                pageSize,
                onPageSizeChange,
              }
        }
        onRow={handleRow}
        rowClassName={(row) =>
          cn(
            "cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]",
            selectedLog?.timestamp === row.timestamp &&
              "bg-[rgba(10,174,214,0.12)] ring-1 ring-[rgba(10,174,214,0.28)] ring-inset"
          )
        }
      />
    </>
  );
}

export const LogsHubListSection = memo(LogsHubListSectionComponent);
