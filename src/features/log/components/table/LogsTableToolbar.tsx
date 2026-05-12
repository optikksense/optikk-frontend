import { AlignLeft, Columns3, Minimize2, Maximize2 } from "lucide-react";
import { memo } from "react";

import { useLogsExplorerStore } from "../../store/logsExplorerStore";

/** Secondary toolbar above the log table — density, wrap, column controls. */
function LogsTableToolbarComponent() {
  const density = useLogsExplorerStore((s) => s.density);
  const setDensity = useLogsExplorerStore((s) => s.setDensity);
  const wrapLines = useLogsExplorerStore((s) => s.wrapLines);
  const toggleWrapLines = useLogsExplorerStore((s) => s.toggleWrapLines);

  return (
    <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-1.5">
      <span className="font-semibold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
        Results
      </span>
      <div className="flex items-center gap-1">
        {/* Density toggle */}
        <button
          type="button"
          onClick={() => setDensity(density === "comfortable" ? "compact" : "comfortable")}
          title={density === "comfortable" ? "Switch to compact" : "Switch to comfortable"}
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          {density === "comfortable" ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        {/* Wrap toggle */}
        <button
          type="button"
          onClick={toggleWrapLines}
          title={wrapLines ? "Disable line wrap" : "Enable line wrap"}
          className={`flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-[var(--bg-hover)] ${
            wrapLines ? "text-[var(--color-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          <AlignLeft size={14} />
        </button>

        {/* Column picker placeholder */}
        <button
          type="button"
          title="Configure columns"
          className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
        >
          <Columns3 size={14} />
        </button>
      </div>
    </div>
  );
}

export const LogsTableToolbar = memo(LogsTableToolbarComponent);
