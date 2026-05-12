import { Loader2 } from "lucide-react";
import { memo, useEffect, useRef } from "react";

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

  // Scroll to top whenever the row set changes (page navigation)
  const firstRowId = rows[0]?.id;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [firstRowId]);

  if (loading && rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <LogsTableHeader />
        <div className="flex flex-1 items-center justify-center gap-2 text-[13px] text-[var(--text-muted)]">
          <Loader2 size={16} className="animate-spin" />
          Loading logs…
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <LogsTableHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16">
          <div className="rounded-full bg-[var(--bg-tertiary)] p-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)]">
              <path d="M9 12h6M12 9v6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-medium text-[14px] text-[var(--text-secondary)]">{emptyTitle}</span>
          <span className="text-[12px] text-[var(--text-muted)]">{emptyDescription}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <LogsTableHeader />
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {rows.map((row) => (
          <LogRow
            key={row.id}
            row={row}
            searchTerm={searchTerm}
            isSelected={selectedId === row.id}
            onClick={onRowClick}
            onContextMenu={onRowContextMenu}
          />
        ))}
      </div>
    </div>
  );
}

export const LogsTable = memo(LogsTableComponent);
