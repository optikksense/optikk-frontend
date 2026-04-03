import type { LayoutMode } from './utils/topologyLayoutAlgorithms';
import type { StatusFilter, TypeFilter } from './hooks/useTopologyFilters';

interface TopologyToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (v: StatusFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (v: TypeFilter) => void;
  layoutMode: LayoutMode;
  onLayoutModeChange: (v: LayoutMode) => void;
  animate: boolean;
  onAnimateChange: (v: boolean) => void;
  showLabels: boolean;
  onShowLabelsChange: (v: boolean) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-7 rounded-md border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] px-2 text-[11px] text-[var(--text-primary)] outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function TopologyToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  layoutMode,
  onLayoutModeChange,
  animate,
  onAnimateChange,
  showLabels,
  onShowLabelsChange,
  hasActiveFilters,
  onResetFilters,
}: TopologyToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2">
      {/* Search */}
      <input
        type="text"
        placeholder="Search services..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-7 w-48 rounded-md border border-[rgba(95,106,133,0.45)] bg-[rgba(20,23,31,0.88)] px-2 text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--color-primary)]"
      />

      <div className="mx-1 h-5 w-px bg-[var(--border-color)]" />

      {/* Status filter */}
      <Select
        value={statusFilter}
        onChange={onStatusFilterChange}
        options={[
          { value: 'all', label: 'All Status' },
          { value: 'healthy', label: 'Healthy' },
          { value: 'degraded', label: 'Degraded' },
          { value: 'critical', label: 'Critical' },
        ]}
      />

      {/* Type filter */}
      <Select
        value={typeFilter}
        onChange={onTypeFilterChange}
        options={[
          { value: 'all', label: 'All Types' },
          { value: 'application', label: 'Application' },
          { value: 'database', label: 'Database' },
          { value: 'cache', label: 'Cache' },
          { value: 'queue', label: 'Queue' },
          { value: 'grpc', label: 'gRPC' },
          { value: 'external', label: 'External' },
        ]}
      />

      <div className="mx-1 h-5 w-px bg-[var(--border-color)]" />

      {/* Layout selector */}
      <Select
        value={layoutMode}
        onChange={onLayoutModeChange}
        options={[
          { value: 'dag', label: 'DAG' },
          { value: 'radial', label: 'Radial' },
          { value: 'force', label: 'Force' },
        ]}
      />

      <div className="mx-1 h-5 w-px bg-[var(--border-color)]" />

      {/* Toggles */}
      <label className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] select-none cursor-pointer">
        <input type="checkbox" checked={animate} onChange={(e) => onAnimateChange(e.target.checked)} className="accent-[var(--color-primary)]" />
        Animate
      </label>
      <label className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] select-none cursor-pointer">
        <input type="checkbox" checked={showLabels} onChange={(e) => onShowLabelsChange(e.target.checked)} className="accent-[var(--color-primary)]" />
        Labels
      </label>

      {hasActiveFilters && (
        <>
          <div className="mx-1 h-5 w-px bg-[var(--border-color)]" />
          <button
            onClick={onResetFilters}
            className="text-[10px] text-[var(--color-primary)] hover:underline"
          >
            Clear filters
          </button>
        </>
      )}
    </div>
  );
}
