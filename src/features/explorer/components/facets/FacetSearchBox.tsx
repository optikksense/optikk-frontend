import { Search } from "lucide-react";
import { memo } from "react";
import { Input, SearchField } from "react-aria-components";

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
    <SearchField 
      className="flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-1"
      value={value}
      onChange={onChange}
      aria-label={placeholder}
    >
      <Search size={12} className="shrink-0 text-foreground-muted" />
      <Input
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-foreground-muted"
      />
    </SearchField>
  );
}

export const FacetSearchBox = memo(FacetSearchBoxComponent);
