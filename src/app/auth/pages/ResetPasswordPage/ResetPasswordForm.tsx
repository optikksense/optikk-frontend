import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ROUTES } from "@shared/constants/routes";
import { cn } from "@shared/lib/utils";
import { session } from "@shared/api/auth/session";

import type { ReactNode } from "react";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const { token } = useSearch({ strict: false }) as { token?: string };

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset token is missing from the URL.");
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setIsSubmitting(true);
    try {
      await session.resetPassword(token, parsed.data.password);
      toast.success("Password reset successfully. You can now sign in.");
      navigate({ to: ROUTES.login });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <Field
        id="password"
        label="New password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="••••••••••••"
        icon={<Lock size={15} strokeWidth={2} />}
        required
        autoComplete="new-password"
        endSlot={<ShowHideToggle show={showPassword} onToggle={setShowPassword} />}
      />
      <SubmitButton loading={isSubmitting} />
    </form>
  );
}

interface FieldProps {
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

const INPUT_BASE =
  "h-[42px] w-full rounded-md border border-border bg-card " +
  "py-0 pl-9 pr-3 font-[inherit] text-[13.5px] text-foreground outline-none " +
  "transition-[border-color,box-shadow] duration-150 " +
  "placeholder:text-foreground-muted " +
  "hover:border-foreground-muted " +
  "focus:border-primary focus:shadow-[var(--login-focus-ring)]";

function Field({
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
}: FieldProps) {
  return (
    <div className="mb-3 grid gap-1.5">
      <label
        htmlFor={id}
        className="font-semibold text-[11.5px] text-foreground-secondary uppercase tracking-[0.04em]"
      >
        {label}
      </label>
      <div className="relative">
        <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-[11px] text-foreground-muted">
          {icon}
        </span>
        <input
          id={id}
          data-testid={`reset-${id}`}
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

function ShowHideToggle({
  show,
  onToggle,
}: {
  readonly show: boolean;
  readonly onToggle: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!show)}
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
      className="-translate-y-1/2 absolute top-1/2 right-2 rounded px-1.5 py-1 font-semibold text-[11px] text-foreground-muted uppercase tracking-[0.04em] transition-colors hover:bg-surface-inset hover:text-foreground-secondary"
    >
      {show ? "Hide" : "Show"}
    </button>
  );
}

function SubmitButton({ loading }: { readonly loading: boolean }) {
  return (
    <button
      data-testid="reset-submit"
      type="submit"
      disabled={loading}
      className="mt-2 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary font-[inherit] font-semibold text-[var(--login-submit-fg)] text-sm transition-[background-color,border-color,transform] duration-150 hover:border-[var(--login-link)] hover:bg-[var(--login-link)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="h-[16px] w-[16px] animate-[spin_0.6s_linear_infinite] rounded-full border-2 border-transparent border-t-current" />
      ) : (
        <>
          Set password
          <ArrowRight size={14} strokeWidth={2.2} />
        </>
      )}
    </button>
  );
}
