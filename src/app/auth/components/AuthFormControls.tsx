import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@shared/lib/utils";

interface AuthFieldProps {
  readonly id: string;
  readonly testIdPrefix: string;
  readonly label: ReactNode;
  readonly type: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly icon: ReactNode;
  readonly endSlot?: ReactNode;
  readonly required?: boolean;
  readonly autoComplete?: string;
  readonly error?: string;
}

const INPUT_BASE =
  "h-[42px] w-full rounded-md border border-border bg-card " +
  "py-0 pl-9 pr-3 font-[inherit] text-[13.5px] text-foreground outline-none " +
  "transition-[border-color,box-shadow] duration-150 " +
  "placeholder:text-foreground-muted hover:border-foreground-muted " +
  "focus:border-primary focus:shadow-[var(--login-focus-ring)]";

export function AuthFieldError({ id, message }: { readonly id: string; readonly message: string }) {
  return (
    <p id={`${id}-error`} className="m-0 text-[11.5px] text-error">
      {message}
    </p>
  );
}

export function AuthField({
  id,
  testIdPrefix,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon,
  endSlot,
  required,
  autoComplete,
  error,
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="mb-3 grid gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center font-semibold text-[11.5px] text-foreground-secondary uppercase tracking-[0.04em]"
      >
        {label}
      </label>
      <div className="relative">
        <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-[11px] text-foreground-muted">
          {icon}
        </span>
        <input
          id={id}
          data-testid={`${testIdPrefix}-${id}`}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error != null || undefined}
          aria-describedby={error != null ? errorId : undefined}
          className={cn(INPUT_BASE, endSlot && "pr-16", error && "border-error")}
        />
        {endSlot}
      </div>
      {error && <AuthFieldError id={id} message={error} />}
    </div>
  );
}

interface PasswordVisibilityButtonProps {
  readonly visible: boolean;
  readonly onChange: (visible: boolean) => void;
}

export function PasswordVisibilityButton({ visible, onChange }: PasswordVisibilityButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!visible)}
      tabIndex={-1}
      aria-label={visible ? "Hide password" : "Show password"}
      className="-translate-y-1/2 absolute top-1/2 right-2 rounded px-1.5 py-1 font-semibold text-[11px] text-foreground-muted uppercase tracking-[0.04em] transition-colors hover:bg-surface-inset hover:text-foreground-secondary"
    >
      {visible ? "Hide" : "Show"}
    </button>
  );
}

interface AuthSubmitButtonProps {
  readonly testIdPrefix: string;
  readonly loading: boolean;
  readonly children: ReactNode;
}

export function AuthSubmitButton({ testIdPrefix, loading, children }: AuthSubmitButtonProps) {
  return (
    <button
      data-testid={`${testIdPrefix}-submit`}
      type="submit"
      disabled={loading}
      className="mt-2 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary font-[inherit] font-semibold text-[var(--login-submit-fg)] text-sm transition-[background-color,border-color,transform] duration-150 hover:border-[var(--login-link)] hover:bg-[var(--login-link)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="h-[16px] w-[16px] animate-[spin_0.6s_linear_infinite] rounded-full border-2 border-transparent border-t-current" />
      ) : (
        <>
          {children}
          <ArrowRight size={14} strokeWidth={2.2} />
        </>
      )}
    </button>
  );
}
