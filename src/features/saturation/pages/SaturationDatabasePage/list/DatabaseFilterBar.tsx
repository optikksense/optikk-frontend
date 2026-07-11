import { Search } from "lucide-react";

import { cn } from "@shared/lib/utils";

interface DatabaseFilterBarProps {
  readonly search: string;
  readonly onSearch: (value: string) => void;
  readonly engine: string;
  readonly onEngine: (value: string) => void;
  readonly engines: readonly string[];
  readonly shownCount: number;
  readonly totalCount: number;
}

export function DatabaseFilterBar({
  search,
  onSearch,
  engine,
  onEngine,
  engines,
  shownCount,
  totalCount,
}: DatabaseFilterBarProps) {
  const options = ["all", ...engines];
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-4 py-2.5">
      <div className="flex h-8 w-64 items-center gap-2 rounded-md border border-border bg-surface px-2.5 focus-within:border-primary">
        <Search size={14} className="text-foreground-muted" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search instances…"
          className="h-full flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-muted"
        />
      </div>

      <div className="flex items-center gap-0.5 rounded-md bg-muted p-0.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onEngine(opt)}
            className={cn(
              "rounded px-2.5 py-1 font-medium font-mono text-[12px] transition-colors",
              engine === opt
                ? "bg-card text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {opt === "all" ? "All engines" : opt}
          </button>
        ))}
      </div>

      <span className="ml-auto text-[12px] text-foreground-muted">
        Showing {shownCount} of {totalCount}
      </span>
    </div>
  );
}
