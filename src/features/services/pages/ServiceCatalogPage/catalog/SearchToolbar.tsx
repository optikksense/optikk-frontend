import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

import { type StatusFilter, StatusFilterPill } from "./StatusFilterPill";

interface SearchToolbarProps {
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly status: StatusFilter;
  readonly onStatusChange: (next: StatusFilter) => void;
}

export function SearchToolbar({ value, onChange, status, onStatusChange }: SearchToolbarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-[320px] items-center gap-2 rounded-md border border-border bg-card px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search size={14} className="text-foreground-muted" />
        <input
          ref={inputRef}
          type="text"
          aria-label="Filter services"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // Escape clears, matching the previous SearchField behavior.
            if (e.key === "Escape" && value !== "") {
              e.preventDefault();
              onChange("");
            }
          }}
          placeholder="Filter services…"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-muted"
        />
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-foreground-muted sm:inline">
          /
        </kbd>
      </div>
      <StatusFilterPill value={status} onChange={onStatusChange} />
    </div>
  );
}
