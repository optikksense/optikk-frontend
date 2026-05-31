import { AlignLeft, ArrowDownUp, Columns3, Minimize2 } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";

import { useLogsExplorerStore } from "../../store/logsExplorerStore";

const ICON_BTN_BASE =
  "inline-grid h-7 w-7 cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent text-[var(--fg-2)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]";
const ICON_BTN_ON = "bg-[var(--accent-bg)] text-[var(--fg-0)]";

/** Secondary toolbar above the log table — density, wrap, column controls. */
function LogsTableToolbarComponent() {
  const density = useLogsExplorerStore((s) => s.density);
  const setDensity = useLogsExplorerStore((s) => s.setDensity);
  const wrapLines = useLogsExplorerStore((s) => s.wrapLines);
  const toggleWrapLines = useLogsExplorerStore((s) => s.toggleWrapLines);

  return (
    <div className="flex shrink-0 items-center justify-between border-[var(--line)] border-b px-[18px] py-3">
      <span className="font-semibold text-[11px] text-[var(--fg-2)] uppercase tracking-[0.08em]">
        Results
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setDensity(density === "comfortable" ? "compact" : "comfortable")}
          title={density === "comfortable" ? "Switch to compact" : "Switch to comfortable"}
          className={cn(ICON_BTN_BASE, density === "compact" && ICON_BTN_ON)}
        >
          <Minimize2 size={14} />
        </button>
        <button
          type="button"
          onClick={toggleWrapLines}
          title={wrapLines ? "Disable line wrap" : "Enable line wrap"}
          className={cn(ICON_BTN_BASE, wrapLines && ICON_BTN_ON)}
        >
          <AlignLeft size={14} />
        </button>
        <button type="button" className={ICON_BTN_BASE} title="Sort">
          <ArrowDownUp size={14} />
        </button>
        <button type="button" className={ICON_BTN_BASE} title="Configure columns">
          <Columns3 size={14} />
        </button>
      </div>
    </div>
  );
}

export const LogsTableToolbar = memo(LogsTableToolbarComponent);
