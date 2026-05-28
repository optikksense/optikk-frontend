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
    <div className="flex items-center gap-3 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-1.5">
      <Search size={14} className="text-[var(--text-muted)]" />
      <input
        ref={inputRef}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder="Search services, tags…"
        className="min-w-0 flex-1 bg-transparent text-[12px] text-[var(--text-primary)] outline-none"
      />
      <kbd className="hidden rounded border border-[var(--border-color)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] sm:inline">
        /
      </kbd>
      <span className="h-4 w-px bg-[var(--border-color)]" aria-hidden="true" />
      <StatusFilterPill value={status} onChange={onStatusChange} />
    </div>
  );
}
