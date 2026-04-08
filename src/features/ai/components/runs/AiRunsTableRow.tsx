import { ArrowUpRight } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";
import { APP_COLORS } from "@config/colorLiterals";
import { formatDuration, formatNumber, formatTimestamp } from "@shared/utils/formatters";

import type { ReactNode } from "react";
import type { LLMRun } from "../../types";
import type { AiRunColumn } from "../../utils/aiRunsUtils";

interface AiRunsTableRowProps {
  run: LLMRun;
  colWidths: Record<string, number>;
  visibleCols: Record<string, boolean>;
  maxDuration: number;
  columns: AiRunColumn[];
  onRowClick: (spanId: string) => void;
  onOpenDetail: (run: LLMRun) => void;
}

export const AiRunsTableRow = React.memo(function AiRunsTableRow({
  run,
  colWidths,
  visibleCols,
  maxDuration,
  columns,
  onRowClick,
  onOpenDetail,
}: AiRunsTableRowProps): JSX.Element {
  const fixedColumns = columns.filter((col) => !col.flex && visibleCols[col.key]);
  const flexColumn = columns.find((col) => col.flex && visibleCols[col.key]);

  const renderCell = (columnKey: string): ReactNode => {
    switch (columnKey) {
      case "model":
        return (
          <span
            className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[12px] text-[var(--text-link)] hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              onRowClick(run.spanId);
            }}
          >
            <ArrowUpRight size={11} />
            {run.model || "—"}
          </span>
        );
      case "operationType":
        return (
          <span className="inline-block rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-2 py-0.5 text-[var(--text-secondary)] text-xs capitalize">
            {run.operationType || "—"}
          </span>
        );
      case "serviceName":
        return (
          <span className="traces-service-tag">
            <span className="traces-service-tag-dot" />
            {run.serviceName || "—"}
          </span>
        );
      case "durationMs": {
        const pct = maxDuration > 0 ? Math.min((run.durationMs / maxDuration) * 100, 100) : 0;
        const color =
          run.durationMs > 5000
            ? APP_COLORS.hex_f04438
            : run.durationMs > 2000
              ? APP_COLORS.hex_f79009
              : APP_COLORS.hex_73c991;
        return (
          <div className="traces-duration-cell">
            <span className="traces-duration-value" style={{ color }}>
              {formatDuration(run.durationMs)}
            </span>
            <div className="traces-duration-bar-wrapper">
              <div
                className="traces-duration-bar"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      }
      case "totalTokens":
        return (
          <span className="font-mono" style={{ fontSize: 12 }}>
            {formatNumber(run.totalTokens)}
            <span style={{ color: "var(--text-muted)", fontSize: 10, marginLeft: 4 }}>
              ({formatNumber(run.inputTokens)}+{formatNumber(run.outputTokens)})
            </span>
          </span>
        );
      case "hasError":
        return (
          <span
            className={cn(
              "inline-flex rounded px-2 py-0.5 font-semibold text-[11px]",
              run.hasError
                ? "bg-[rgba(240,68,56,0.12)] text-[#f04438]"
                : "bg-[rgba(16,185,129,0.12)] text-[#10b981]"
            )}
          >
            {run.hasError ? "Error" : "OK"}
          </span>
        );
      case "startTime":
        return <span className="traces-timestamp">{formatTimestamp(run.startTime)}</span>;
      case "operationName":
        return (
          <div className="traces-operation-cell">
            <span className="traces-operation-name" title={run.operationName}>
              {run.operationName || "—"}
            </span>
            {run.provider && (
              <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{run.provider}</span>
            )}
          </div>
        );
      default: {
        const fallbackValue = run[columnKey as keyof LLMRun];
        return <span>{String(fallbackValue ?? "—")}</span>;
      }
    }
  };

  return (
    <>
      {fixedColumns.map((col) => (
        <div
          key={col.key}
          className="box-border inline-flex min-h-[34px] shrink-0 items-center overflow-hidden text-ellipsis whitespace-nowrap border-[color:var(--glass-border)] border-r px-[10px] py-[6px]"
          style={{ width: colWidths[col.key] }}
          onClick={() => onOpenDetail(run)}
        >
          {renderCell(col.key)}
        </div>
      ))}
      {flexColumn && (
        <div
          className="box-border inline-flex min-h-[34px] min-w-0 flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap border-[color:var(--glass-border)] border-r-0 px-[10px] py-[6px]"
          onClick={() => onOpenDetail(run)}
        >
          {renderCell(flexColumn.key)}
        </div>
      )}
    </>
  );
});

export default AiRunsTableRow;
