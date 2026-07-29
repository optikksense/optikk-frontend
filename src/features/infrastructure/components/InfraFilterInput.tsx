import { Search } from "lucide-react";

interface InfraFilterInputProps {
  readonly value: string;
  readonly onChange: (next: string) => void;
  readonly placeholder: string;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
}

/** The search box used by the infrastructure hub tabs. */
export function InfraFilterInput({
  value,
  onChange,
  placeholder,
  onFocus,
  onBlur,
}: InfraFilterInputProps) {
  return (
    <div className="flex w-[320px] items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 focus-within:border-primary">
      <Search size={14} className="text-foreground-muted" />
      <input
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-foreground-muted"
      />
    </div>
  );
}
