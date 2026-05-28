import { cn } from "@/lib/utils";

export type StatusFilter = "any" | "healthy" | "warn" | "error" | "unhealthy";

const OPTIONS: ReadonlyArray<{ id: StatusFilter; label: string }> = [
  { id: "any", label: "any" },
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
  return (
    <label className="inline-flex items-center gap-1.5 text-[11.5px] text-[var(--text-muted)]">
      <span>status</span>
      <select
        value={value}
        onChange={(ev) => onChange(ev.target.value as StatusFilter)}
        className={cn(
          "rounded border border-transparent bg-transparent text-[11.5px] font-medium text-[var(--text-primary)] outline-none",
          "hover:border-[var(--border-color)] focus:border-[var(--color-primary)]"
        )}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
