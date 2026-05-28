import { AlignLeft, ArrowDownUp, Columns3, Minimize2 } from "lucide-react";
import { memo } from "react";

import { useLogsExplorerStore } from "../../store/logsExplorerStore";

/** Secondary toolbar above the log table — density, wrap, column controls. */
function LogsTableToolbarComponent() {
  const density = useLogsExplorerStore((s) => s.density);
  const setDensity = useLogsExplorerStore((s) => s.setDensity);
  const wrapLines = useLogsExplorerStore((s) => s.wrapLines);
  const toggleWrapLines = useLogsExplorerStore((s) => s.toggleWrapLines);

  return (
    <div className="ok-rwrap-h">
      <span className="ok-rwrap-t">Results</span>
      <div className="ok-rwrap-actions">
        <button
          type="button"
          onClick={() => setDensity(density === "comfortable" ? "compact" : "comfortable")}
          title={density === "comfortable" ? "Switch to compact" : "Switch to comfortable"}
          className={`ok-ib ${density === "compact" ? "is-on" : ""}`}
        >
          <Minimize2 size={14} />
        </button>
        <button
          type="button"
          onClick={toggleWrapLines}
          title={wrapLines ? "Disable line wrap" : "Enable line wrap"}
          className={`ok-ib ${wrapLines ? "is-on" : ""}`}
        >
          <AlignLeft size={14} />
        </button>
        <button type="button" className="ok-ib" title="Sort">
          <ArrowDownUp size={14} />
        </button>
        <button type="button" className="ok-ib" title="Configure columns">
          <Columns3 size={14} />
        </button>
      </div>
    </div>
  );
}

export const LogsTableToolbar = memo(LogsTableToolbarComponent);
