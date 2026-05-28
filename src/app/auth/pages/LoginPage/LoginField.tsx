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
  readonly hint?: ReactNode;
  readonly required?: boolean;
  readonly autoComplete?: string;
}

const INPUT_BASE =
  "h-[42px] w-full rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] " +
  "py-0 pl-9 pr-3 font-[inherit] text-[13.5px] text-[var(--text-primary)] outline-none " +
  "transition-[border-color,box-shadow] duration-150 " +
  "placeholder:text-[var(--text-muted)] " +
  "hover:border-[var(--text-muted)] " +
  "focus:border-[var(--color-primary)] focus:shadow-[var(--login-focus-ring)]";

export function LoginField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  endSlot,
  hint,
  required,
  autoComplete,
}: LoginFieldProps) {
  return (
    <div className="mb-3 grid gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[var(--text-secondary)]"
        >
          {label}
        </label>
        {hint}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          {icon}
        </span>
        <input
          id={id}
          data-testid={`login-${id}`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={cn(INPUT_BASE, endSlot && "pr-16")}
        />
        {endSlot}
      </div>
    </div>
  );
}
