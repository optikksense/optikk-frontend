import { Search, X } from 'lucide-react';

interface Props {
  filter: string;
  onFilterChange: (v: string) => void;
  nodeCount: number;
  edgeCount: number;
  focusService: string;
  onClearFocus: () => void;
}

export function TopologyToolbar({
  filter,
  onFilterChange,
  nodeCount,
  edgeCount,
  focusService,
  onClearFocus,
}: Props) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2">
      <div className="relative">
        <Search
          size={13}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Filter services..."
          className="h-7 w-56 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] pl-7 pr-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      {focusService ? (
        <button
          type="button"
          onClick={onClearFocus}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-primary)] bg-[rgba(124,127,242,0.12)] px-2 py-0.5 text-[11px] text-[var(--text-primary)] hover:bg-[rgba(124,127,242,0.2)]"
        >
          Focus: {focusService}
          <X size={11} />
        </button>
      ) : null}

      <div className="ml-auto flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
        <span>
          {nodeCount} services • {edgeCount} edges
        </span>
        <span className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--color-success)' }}
          />
          healthy
        </span>
        <span className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--color-warning)' }}
          />
          degraded
        </span>
        <span className="flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--color-error)' }}
          />
          unhealthy
        </span>
      </div>
    </div>
  );
}
