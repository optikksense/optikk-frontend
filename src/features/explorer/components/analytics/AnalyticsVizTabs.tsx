import { memo } from "react";

import type { AnalyticsVizMode } from "../../types/analytics";

interface Props {
  readonly value: AnalyticsVizMode;
  readonly onChange: (next: AnalyticsVizMode) => void;
}

const TABS: ReadonlyArray<{ key: AnalyticsVizMode; label: string }> = [
  { key: "timeseries", label: "Timeseries" },
  { key: "topN", label: "Top N" },
  { key: "table", label: "Table" },
  { key: "pie", label: "Pie" },
];

function AnalyticsVizTabsComponent({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Analytics visualization"
      className="inline-flex items-center gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1"
    >
      {TABS.map((tab) => {
        const active = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`rounded px-3 py-1 text-[12px] font-medium transition-colors ${
              active
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export const AnalyticsVizTabs = memo(AnalyticsVizTabsComponent);
