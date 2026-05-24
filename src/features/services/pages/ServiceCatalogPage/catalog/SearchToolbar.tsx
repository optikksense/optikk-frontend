import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

interface SearchToolbarProps {
  readonly value: string;
  readonly onChange: (next: string) => void;
}

export function SearchToolbar({ value, onChange }: SearchToolbarProps) {
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
    <div className="flex items-center gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-3 py-1.5">
      <Search size={14} className="text-[var(--text-muted)]" />
      <input
        ref={inputRef}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder="Search services…"
        className="flex-1 bg-transparent text-[12px] text-[var(--text-primary)] outline-none"
      />
      <kbd className="hidden rounded border border-[var(--border-color)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] sm:inline">
        /
      </kbd>
    </div>
  );
}
