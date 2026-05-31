import { Filter } from "lucide-react";

export type StatusFilter = "any" | "healthy" | "warn" | "error" | "unhealthy";

const OPTIONS: ReadonlyArray<{ id: StatusFilter; label: string }> = [
  { id: "any", label: "all" },
  { id: "unhealthy", label: "unhealthy" },
  { id: "healthy", label: "healthy" },
  { id: "warn", label: "warn" },
  { id: "error", label: "error" },
];

interface StatusFilterPillProps {
  readonly value: StatusFilter;
  readonly onChange: (next: StatusFilter) => void;
}

export function StatusFilterPill({ value, onChange }: StatusFilterPillProps) {
  const currentLabel = OPTIONS.find((o) => o.id === value)?.label ?? value;
  return (
    <div className="relative inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-3 font-medium text-[12.5px] text-foreground-secondary transition-all hover:bg-secondary hover:text-foreground">
      <Filter size={14} className="pointer-events-none text-foreground-muted" />
      <span className="pointer-events-none">Status · {currentLabel}</span>
      <select
        value={value}
        onChange={(ev) => onChange(ev.target.value as StatusFilter)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
