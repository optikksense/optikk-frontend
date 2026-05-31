import { cn } from "@/lib/utils";

export type StatusSeriesFilter = "all" | "2xx" | "4xx" | "5xx";

const OPTIONS: ReadonlyArray<{ id: StatusSeriesFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "2xx", label: "2xx" },
  { id: "4xx", label: "4xx" },
  { id: "5xx", label: "5xx" },
];

interface StatusSeriesToggleProps {
  readonly value: StatusSeriesFilter;
  readonly onChange: (next: StatusSeriesFilter) => void;
}

export function StatusSeriesToggle({ value, onChange }: StatusSeriesToggleProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded bg-muted p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "rounded-[3px] px-2 py-0.5 font-medium text-[10.5px] transition-colors",
            value === opt.id
              ? "bg-card text-foreground shadow-[var(--shadow-sm)]"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
