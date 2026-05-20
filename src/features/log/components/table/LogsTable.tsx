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

  const firstRowId = rows[0]?.id;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [firstRowId]);

  if (loading && rows.length === 0) {
    return (
      <div className="ok-table">
        <LogsTableHeader />
        <div
          style={{
            flex: 1,
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
      <div className="ok-table">
        <LogsTableHeader />
        <div
          style={{
            flex: 1,
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
    <div className="ok-table">
      <LogsTableHeader />
      <div ref={scrollRef} className="ok-tbody">
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
