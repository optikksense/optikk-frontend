import { Search } from "lucide-react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { cn } from "@shared/lib/utils";

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
  const [value, setValue] = useState("");
  const debouncedSearch = useDebouncedCallback((newValue: string) => {
    onSearch?.(newValue);
  }, debounceMs);

  const clear = (): void => {
    setValue("");
    debouncedSearch.cancel();
    onSearch?.("");
  };

  return (
    <div className={cn("relative inline-flex items-center", className)} style={style}>
      <Search
        size={16}
        className="pointer-events-none absolute left-2 z-10 text-[var(--text-secondary,#999)]"
      />
      <input
        type="text"
        aria-label="Search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          debouncedSearch(e.target.value);
        }}
        onKeyDown={(e) => {
          // Escape clears, matching the previous SearchField behavior.
          if (e.key === "Escape" && value !== "") {
            e.preventDefault();
            clear();
          }
        }}
        className="h-8 w-full rounded-md border border-[var(--border-color,#d9d9d9)] pr-[28px] pl-[30px] text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary"
      />
      {value !== "" && (
        <button
          type="button"
          aria-label="Clear search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={clear}
          className="absolute right-1.5 cursor-pointer rounded-sm border-none bg-transparent p-0.5 text-[var(--text-secondary,#999)] text-sm outline-none hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
        >
          &times;
        </button>
      )}
    </div>
  );
}
