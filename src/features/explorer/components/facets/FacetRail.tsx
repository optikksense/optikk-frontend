import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { memo, useState } from "react";

import { FacetGroup, type FacetGroupModel } from "./FacetGroup";

interface Props {
  readonly groups: readonly FacetGroupModel[];
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
  readonly isActive?: (field: string, value: string) => "include" | "exclude" | null;
  readonly defaultCollapsed?: boolean;
}

/**
 * Collapsible rail container. Collapsed state is component-local (D.7:
 * facet-rail expanded groups in localStorage — handled inside FacetGroup;
 * rail-wide collapse is ephemeral).
 */
function FacetRailComponent({ groups, onInclude, onExclude, isActive, defaultCollapsed }: Props) {
  const [collapsed, setCollapsed] = useState(Boolean(defaultCollapsed));
  if (collapsed) {
    return (
      <aside className="flex w-8 shrink-0 flex-col items-center border-r border-[var(--border-color)] bg-[var(--bg-primary)] py-2">
        <button
          type="button"
          aria-label="Expand facets"
          onClick={() => setCollapsed(false)}
          className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <PanelLeftOpen size={14} />
        </button>
      </aside>
    );
  }
  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
      <header className="flex items-center justify-between px-2 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Facets
        </span>
        <button
          type="button"
          aria-label="Collapse facets"
          onClick={() => setCollapsed(true)}
          className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <PanelLeftClose size={14} />
        </button>
      </header>
      <div className="flex flex-col">
        {groups.map((group) => (
          <FacetGroup
            key={group.field}
            group={group}
            onInclude={onInclude}
            onExclude={onExclude}
            isActive={isActive}
          />
        ))}
      </div>
    </aside>
  );
}

export const FacetRail = memo(FacetRailComponent);
