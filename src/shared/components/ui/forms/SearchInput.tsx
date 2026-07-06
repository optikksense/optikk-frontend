import { Search } from "lucide-react";
import { Button, Input, SearchField } from "react-aria-components";
import { useDebouncedCallback } from "use-debounce";

import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function SearchInput({
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
  style,
  className,
}: SearchInputProps): JSX.Element {
  const debouncedSearch = useDebouncedCallback((newValue: string) => {
    onSearch?.(newValue);
  }, debounceMs);

  return (
    <SearchField
      className={cn("group relative inline-flex items-center", className)}
      style={style}
      onChange={debouncedSearch}
      onClear={() => onSearch?.("")}
      aria-label="Search"
    >
      <Search
        size={16}
        className="pointer-events-none absolute left-2 z-10 text-[var(--text-secondary,#999)]"
      />
      <Input
        placeholder={placeholder}
        className="h-8 w-full rounded-md border border-[var(--border-color,#d9d9d9)] pr-[28px] pl-[30px] text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary"
      />
      <Button className="absolute right-1.5 cursor-pointer rounded-sm border-none bg-transparent p-0.5 text-[var(--text-secondary,#999)] text-sm opacity-0 outline-none hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary group-data-[empty=false]:opacity-100">
        &times;
      </Button>
    </SearchField>
  );
}
