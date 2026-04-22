import { Search } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly placeholder?: string;
}

/**
 * Filter-within-facet input. Controlled so the parent can reset on group close.
 */
function FacetSearchBoxComponent({ value, onChange, placeholder = "Filter values" }: Props) {
  return (
    <div className="flex items-center gap-1.5 rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1">
      <Search size={12} className="shrink-0 text-[var(--text-muted)]" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
      />
    </div>
  );
}

export const FacetSearchBox = memo(FacetSearchBoxComponent);
