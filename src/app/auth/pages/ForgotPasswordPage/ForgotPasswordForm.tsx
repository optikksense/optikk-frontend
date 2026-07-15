import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { session } from "@shared/api/auth/session";
import { cn } from "@shared/lib/utils";

import type { ReactNode } from "react";

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email").email("Please enter a valid email"),
});

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setIsSubmitting(true);
    try {
      await session.forgotPassword(parsed.data.email);
      setIsSuccess(true);
      toast.success("If your email is registered, a reset link has been sent.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to request password reset");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-md border border-border bg-card p-4 text-[13.5px] text-foreground">
        <p className="mb-2 font-semibold">Check your inbox</p>
        <p className="text-foreground-muted">
          We've sent a password reset link to <strong>{email}</strong>. It will expire in 30
          minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="off">
      <Field
        id="email"
        label="Work email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@company.com"
        icon={<Mail size={15} strokeWidth={2} />}
        required
        autoComplete="email"
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
          data-testid={`forgot-${id}`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={cn(INPUT_BASE)}
        />
      </div>
    </div>
  );
}

function SubmitButton({ loading }: { readonly loading: boolean }) {
  return (
    <button
      data-testid="forgot-submit"
      type="submit"
      disabled={loading}
      className="mt-2 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary font-[inherit] font-semibold text-[var(--login-submit-fg)] text-sm transition-[background-color,border-color,transform] duration-150 hover:border-[var(--login-link)] hover:bg-[var(--login-link)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="h-[16px] w-[16px] animate-[spin_0.6s_linear_infinite] rounded-full border-2 border-transparent border-t-current" />
      ) : (
        <>
          Send reset link
          <ArrowRight size={14} strokeWidth={2.2} />
        </>
      )}
    </button>
  );
}
