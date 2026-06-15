import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { ROUTES } from "@shared/constants/routes";
import { dynamicNavigateOptions } from "@shared/utils/navigation";

import { session } from "@shared/api/auth/session";

import { useAppStore } from "@store/appStore";

import type { ReactNode } from "react";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Please enter your email").email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ strict: false }) as { redirect?: string };
  const setTimeRange = useAppStore((s) => s.setTimeRange);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return;
    }

    setIsSubmitting(true);
    try {
      await session.login(parsed.data.email, parsed.data.password);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      setIsSubmitting(false);
      return;
    }

    setTimeRange({ kind: "relative", preset: "30m", label: "Last 30 minutes", minutes: 30 });
    toast.success("Login successful!");
    // Only honor internal paths so a crafted ?redirect= can't leave the app.
    const target = redirect?.startsWith("/") ? redirect : ROUTES.overview;
    navigate(dynamicNavigateOptions(target));
  };

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
      <Field
        id="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="••••••••••••"
        icon={<Lock size={15} strokeWidth={2} />}
        required
        autoComplete="current-password"
        endSlot={<ShowHideToggle show={showPassword} onToggle={setShowPassword} />}
      />
      <SubmitButton loading={isSubmitting} />
      <RequestAccessLine />
      <LegalLine />
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
      data-testid="login-submit"
      type="submit"
      disabled={loading}
      className="mt-2 flex h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary font-[inherit] font-semibold text-[var(--login-submit-fg)] text-sm transition-[background-color,border-color,transform] duration-150 hover:border-[var(--login-link)] hover:bg-[var(--login-link)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="h-[16px] w-[16px] animate-[spin_0.6s_linear_infinite] rounded-full border-2 border-transparent border-t-current" />
      ) : (
        <>
          Sign in
          <ArrowRight size={14} strokeWidth={2.2} />
        </>
      )}
    </button>
  );
}

function RequestAccessLine() {
  return (
    <p className="mt-4 text-center text-[12.5px] text-foreground-muted">
      Want to deploy your own instance?{" "}
      <Link
        to={ROUTES.selfHost}
        className="font-semibold text-[var(--login-link)] no-underline hover:underline"
      >
        Self-host now
      </Link>
    </p>
  );
}

function LegalLine() {
  return (
    <p className="mx-auto mt-[22px] max-w-[320px] text-center text-[11px] text-foreground-muted leading-[1.5]">
      By signing in you agree to Optikk&apos;s{" "}
      <Link to={ROUTES.terms} className="text-foreground-secondary underline">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link to={ROUTES.privacy} className="text-foreground-secondary underline">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
