import { useVirtualizer } from "@tanstack/react-virtual";
import { Loader2 } from "lucide-react";
import { memo, useRef } from "react";

import type { LogRecord } from "../../types/log";
import { LogRow } from "./LogRow";
import { LogsTableHeader } from "./LogsTableHeader";

interface Props {
  readonly rows: readonly LogRecord[];
  readonly searchTerm?: string;
  readonly loading?: boolean;
  readonly selectedId?: string | null;
  readonly onRowClick?: (row: LogRecord) => void;
  readonly onRowContextMenu?: (row: LogRecord, x: number, y: number) => void;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
}

function LogsTableComponent({
  rows,
  searchTerm,
  loading,
  selectedId,
  onRowClick,
  onRowContextMenu,
  emptyTitle = "No logs found",
  emptyDescription = "Adjust filters or broaden the time range.",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 28,
  });

  if (loading && rows.length === 0) {
    return (
      <div className="flex flex-col">
        <LogsTableHeader />
        <div
          style={{
            minHeight: 240,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "var(--fg-3)",
            fontSize: 13,
          }}
        >
          <Loader2 size={16} className="animate-spin" />
          Loading logs…
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col">
        <LogsTableHeader />
        <div
          style={{
            minHeight: 240,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "64px 16px",
          }}
        >
          <span style={{ fontWeight: 500, fontSize: 14, color: "var(--fg-1)" }}>{emptyTitle}</span>
          <span style={{ fontSize: 12, color: "var(--fg-3)" }}>{emptyDescription}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <LogsTableHeader />
      <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 relative">
        <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <LogRow
                  row={row}
                  searchTerm={searchTerm}
                  isSelected={selectedId === row.id}
                  onClick={onRowClick}
                  onContextMenu={onRowContextMenu}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const LogsTable = memo(LogsTableComponent);
