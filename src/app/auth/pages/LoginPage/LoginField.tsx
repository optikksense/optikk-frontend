import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface LoginFieldProps {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly icon: ReactNode;
  readonly endSlot?: ReactNode;
  readonly required?: boolean;
  readonly autoComplete?: string;
}

/**
 * Reusable login field — uppercase label, left icon, optional right action slot.
 */
export function LoginField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  endSlot,
  required,
  autoComplete,
}: LoginFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-[14px] flex items-center text-[var(--text-muted)]">
          {icon}
        </span>
        <input
          id={id}
          data-testid={`login-${id}`}
          className={cn(
            "h-12 w-full rounded-lg border border-border bg-[var(--bg-tertiary)] pl-11 pr-[14px] font-[inherit] text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-150",
            "placeholder:text-[var(--text-muted)] placeholder:opacity-70",
            "focus:border-[var(--login-accent)] focus:shadow-[0_0_0_3px_var(--login-accent-glow)]",
            endSlot && "pr-11",
          )}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
        />
        {endSlot}
      </div>
    </div>
  );
}
