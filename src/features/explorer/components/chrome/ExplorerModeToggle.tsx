import { BarChart3, List } from "lucide-react";
import { memo } from "react";

import type { ExplorerMode } from "../../types/filters";

interface Props {
  readonly mode: ExplorerMode;
  readonly onChange: (next: ExplorerMode) => void;
}

const TABS: ReadonlyArray<{ key: ExplorerMode; label: string; icon: typeof List }> = [
  { key: "list", label: "List", icon: List },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

function ExplorerModeToggleComponent({ mode, onChange }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Explorer mode"
      className="inline-flex items-center gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1"
    >
      {TABS.map((tab) => {
        const active = mode === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-1 rounded px-3 py-1 text-[12px] font-medium transition-colors ${
              active
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon size={14} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export const ExplorerModeToggle = memo(ExplorerModeToggleComponent);
