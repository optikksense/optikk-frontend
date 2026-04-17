import { memo } from "react";

function VisualizationHeaderComponent() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 className="font-semibold text-[var(--text-primary)] text-base">Trace Visualization</h2>
        <p className="mt-1 text-[var(--text-secondary)] text-sm">
          Switch between timeline and flamegraph views without leaving the trace context.
        </p>
      </div>
    </div>
  );
}

export const VisualizationHeader = memo(VisualizationHeaderComponent);
