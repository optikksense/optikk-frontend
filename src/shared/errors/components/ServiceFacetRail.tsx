import { cn } from "@shared/lib/utils";

export interface ServiceFacet {
  readonly service: string;
  readonly count: number;
}

interface ServiceFacetRailProps {
  readonly facets: ServiceFacet[];
  readonly totalCount: number;
  readonly active: string | null;
  readonly onSelect: (service: string | null) => void;
}

function FacetRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md px-2 py-[5px] text-left transition-colors",
        active ? "bg-primary/10" : "hover:bg-muted/50"
      )}
    >
      <span
        className={cn(
          "min-w-0 truncate font-mono text-[12.5px]",
          active ? "font-semibold text-primary" : "text-foreground-secondary"
        )}
      >
        {label}
      </span>
      <span className="flex-shrink-0 font-mono text-[12px] text-foreground-muted">{count}</span>
    </button>
  );
}

                                                                 
export function ServiceFacetRail({
  facets,
  totalCount,
  active,
  onSelect,
}: ServiceFacetRailProps): JSX.Element {
  return (
    <div className="sticky top-4 rounded-lg border border-border bg-card p-3">
      <div className="px-2 pb-1.5 font-semibold text-[10.5px] text-foreground-muted uppercase tracking-[0.08em]">
        Service
      </div>
      <FacetRow
        label="All services"
        count={totalCount}
        active={active === null}
        onClick={() => onSelect(null)}
      />
      {facets.map((f) => (
        <FacetRow
          key={f.service}
          label={f.service}
          count={f.count}
          active={active === f.service}
          onClick={() => onSelect(active === f.service ? null : f.service)}
        />
      ))}
    </div>
  );
}
