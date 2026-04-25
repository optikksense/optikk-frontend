import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { FacetGroup, type FacetGroupModel } from "./FacetGroup";

interface Props {
  readonly groups: readonly FacetGroupModel[];
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
  readonly isActive?: (field: string, value: string) => "include" | "exclude" | null;
  readonly defaultCollapsed?: boolean;
  /** Number of filters currently applied (shown as a badge next to "Facets"). */
  readonly activeFilterCount?: number;
  /** Hook for "Clear all" in the rail header. Hidden when absent or count is 0. */
  readonly onClearAll?: () => void;
}

function FacetRailComponent(props: Props) {
  const [collapsed, setCollapsed] = useState(Boolean(props.defaultCollapsed));
  const [search, setSearch] = useState("");
  const visibleGroups = useMemo(() => filterGroupsBySearch(props.groups, search), [props.groups, search]);
  if (collapsed) return <CollapsedRail onExpand={() => setCollapsed(false)} />;
  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-y-auto border-r border-[var(--border-color)] bg-[var(--bg-primary)]">
      <RailHeader
        activeFilterCount={props.activeFilterCount}
        onClearAll={props.onClearAll}
        onCollapse={() => setCollapsed(true)}
      />
      <RailSearch value={search} onChange={setSearch} />
      <div className="flex flex-col">
        {visibleGroups.map((group) => (
          <FacetGroup
            key={group.field}
            group={group}
            onInclude={props.onInclude}
            onExclude={props.onExclude}
            isActive={props.isActive}
          />
        ))}
      </div>
    </aside>
  );
}

function CollapsedRail({ onExpand }: { onExpand: () => void }) {
  return (
    <aside className="flex w-8 shrink-0 flex-col items-center border-r border-[var(--border-color)] bg-[var(--bg-primary)] py-2">
      <button
        type="button"
        aria-label="Expand facets"
        onClick={onExpand}
        className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        <PanelLeftOpen size={14} />
      </button>
    </aside>
  );
}

function RailHeader({
  activeFilterCount,
  onClearAll,
  onCollapse,
}: {
  activeFilterCount?: number;
  onClearAll?: () => void;
  onCollapse: () => void;
}) {
  const showClear = Boolean(onClearAll && activeFilterCount && activeFilterCount > 0);
  return (
    <header className="flex items-center justify-between gap-2 px-2 py-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Facets</span>
        {activeFilterCount && activeFilterCount > 0 ? (
          <span className="rounded bg-[var(--accent)] px-1.5 text-[10px] font-semibold text-white">{activeFilterCount}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        {showClear ? (
          <button
            type="button"
            aria-label="Clear all filters"
            onClick={onClearAll}
            className="flex items-center gap-0.5 rounded px-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={11} /> Clear
          </button>
        ) : null}
        <button
          type="button"
          aria-label="Collapse facets"
          onClick={onCollapse}
          className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>
    </header>
  );
}

function RailSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="px-2 pb-2">
      <input
        type="search"
        placeholder="Search facets…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1 text-[11px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
      />
    </div>
  );
}

function filterGroupsBySearch(
  groups: readonly FacetGroupModel[],
  search: string,
): readonly FacetGroupModel[] {
  const q = search.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({
      ...g,
      buckets: g.buckets.filter((b) => b.value.toLowerCase().includes(q)),
    }))
    .filter((g) => g.label.toLowerCase().includes(q) || g.buckets.length > 0);
}

export const FacetRail = memo(FacetRailComponent);
