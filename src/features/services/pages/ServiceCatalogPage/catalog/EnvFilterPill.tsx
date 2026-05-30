import { cn } from "@/lib/utils";

interface EnvFilterPillProps {
  readonly value: string;
  readonly options: readonly string[];
  readonly onChange: (next: string) => void;
}

/** Environment filter; options are the distinct environments present in the catalog rows. */
export function EnvFilterPill({ value, options, onChange }: EnvFilterPillProps) {
  if (options.length === 0) return null;
  return (
    <label className="inline-flex items-center gap-1.5 text-[11.5px] text-foreground-muted">
      <span>env</span>
      <select
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        className={cn(
          "rounded border border-transparent bg-transparent text-[11.5px] font-medium text-foreground outline-none",
          "hover:border-border focus:border-primary"
        )}
      >
        <option value="any">any</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
