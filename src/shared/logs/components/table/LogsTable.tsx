import { Loader2 } from "lucide-react";
import { memo } from "react";

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

const MESSAGE_BOX = "flex min-h-[240px] items-center justify-center";

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
  return (
    <div className="flex flex-col">
      <LogsTableHeader />
      {loading && rows.length === 0 ? (
        <div className={`${MESSAGE_BOX} gap-2 text-[13px] text-[var(--fg-3)]`}>
          <Loader2 size={16} className="animate-spin" />
          Loading logs…
        </div>
      ) : rows.length === 0 ? (
        <div className={`${MESSAGE_BOX} flex-col gap-1.5`}>
          <span className="font-medium text-[14px] text-[var(--fg-1)]">{emptyTitle}</span>
          <span className="text-[12px] text-[var(--fg-3)]">{emptyDescription}</span>
        </div>
      ) : (
        rows.map((row) => (
          <LogRow
            key={row.id}
            row={row}
            searchTerm={searchTerm}
            isSelected={selectedId === row.id}
            onClick={onRowClick}
            onContextMenu={onRowContextMenu}
          />
        ))
      )}
    </div>
  );
}

export const LogsTable = memo(LogsTableComponent);
